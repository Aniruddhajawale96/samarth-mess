"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "../../../lib/api";
import { ApiError } from "../../../lib/api/client";
import { defaultPathForRole } from "../../../lib/auth";

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
      const { user } = await authApi.login({ phone: phone.trim(), password });
      router.push(defaultPathForRole(user.role as any));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <p className="eyebrow" style={{ textAlign: "center", marginBottom: 8 }}>SAMARTH MESS</p>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>Sign in</h1>
        <p className="muted" style={{ textAlign: "center", marginBottom: 24 }}>Enter your registered phone number and password.</p>

        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom: 24 }}>
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
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
              style={{ width: "100%" }}
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
              style={{ width: "100%" }}
            />
          </div>

          <button
            className="button button-primary button-wide"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <Link href="/forgot-password" className="hint" style={{ color: "var(--green)" }}>
            Forgot your password?
          </Link>
          <div className="hint">
            Don't have an account? <Link href="/register" style={{ color: "var(--ink)", fontWeight: 600 }}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
