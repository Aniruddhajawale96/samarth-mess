"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.trim(), password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body?.error?.message ?? "Invalid phone or password.");
        return;
      }

      // Session is now established via HttpOnly cookie from the API.
      // Redirect to home — the home page will detect the session.
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <p className="eyebrow">SAMARTH MESS</p>
        <h1>Sign in</h1>
        <p className="muted">Enter your registered phone number and password.</p>

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="field-label" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              className="input"
              type="tel"
              autoComplete="username"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            className="button button-primary button-wide"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link href="/forgot-password" className="hint" style={{ textAlign: "center", color: "var(--green)" }}>
          Forgot your password?
        </Link>
      </div>
    </main>
  );
}
