/**
 * Typed fetch wrapper for the Samarth Mess API.
 *
 * All API calls go through /api/proxy/* (Next.js rewrites to http://localhost:4000/*).
 * Envelope: { success: true, data: T } | { error: { code: string; message: string } }
 * This client unwraps the envelope and returns T on success, or throws ApiError on failure.
 *
 * Constraint: multipart/form-data helpers (upload*) must NOT pass Content-Type;
 * the browser sets it automatically with the correct boundary.
 */

const BASE = "/api/proxy";

/**
 * Browser requests go through the same-origin Next.js proxy (/api/proxy → API).
 * Server components / layouts fetch the API directly, but a plain fetch does NOT
 * carry the browser's cookies — without them every authenticated server render
 * bounces back to /login. We therefore forward the request cookies from
 * next/headers on the server. The import is dynamic + guarded so this module
 * stays safe to import from client components (the branch never runs there).
 */
async function forwardedCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const value = store.toString();
    return value.length > 0 ? value : undefined;
  } catch {
    // Not running inside a Next request context (tests, scripts) — no cookies.
    return undefined;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type SuccessEnvelope<T> = { success: true; data: T; timestamp: string };
type ErrorEnvelope = { error: { code: string; message: string } };
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

function isSuccess<T>(env: Envelope<T>): env is SuccessEnvelope<T> {
  return "success" in env && env.success === true;
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    isFormData?: boolean;
  } = {},
): Promise<T> {
  const isServer = typeof window === "undefined";
  // Server-side: call the API directly (no proxy hop) so cookie forwarding is
  // end-to-end. Client-side: same-origin /api/proxy rewrite (cookies flow naturally).
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");
  const url = isServer ? new URL(`${apiBase}${path}`) : new URL(`${BASE}${path}`, window.location.origin);

  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const headers: HeadersInit = {};
  if (isServer) {
    const cookieHeader = await forwardedCookieHeader();
    if (cookieHeader) headers["Cookie"] = cookieHeader;
  }
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    if (options.isFormData) {
      // Do NOT set Content-Type for multipart/form-data — browser handles boundary
      body = options.body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body,
    credentials: "include", // send HttpOnly cookies
  });

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError("PARSE_ERROR", `Unexpected response (${res.status})`, res.status);
  }

  if (isSuccess(json)) {
    return json.data;
  }

  const errEnv = json as ErrorEnvelope;
  throw new ApiError(
    errEnv.error?.code ?? "UNKNOWN",
    errEnv.error?.message ?? `Request failed with status ${res.status}`,
    res.status,
  );
}

// Convenience method builders — exported so endpoint modules can use them directly.
export const api = {
  get: <T>(path: string, query?: Record<string, string | number | boolean | undefined | null>) =>
    request<T>("GET", path, { query }),

  post: <T>(path: string, body?: unknown) =>
    request<T>("POST", path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),

  delete: <T>(path: string) =>
    request<T>("DELETE", path),

  postForm: <T>(path: string, formData: FormData) =>
    request<T>("POST", path, { body: formData, isFormData: true }),
};
