/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker image (apps/web/Dockerfile copies .next/standalone).
  output: "standalone",
  // This is a pnpm monorepo: trace from the repo root so workspace packages
  // (and their dist folders) are included in the standalone output.
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.."),
  transpilePackages: ["@samarth-mess/types", "@samarth-mess/validation", "@samarth-mess/shared"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        // Uploaded images and generated invoices are stored under /uploads on the
        // API and referenced by relative paths (e.g. /uploads/abc.png). Serve them
        // through the same-origin rewrite so the browser never needs the API origin.
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
