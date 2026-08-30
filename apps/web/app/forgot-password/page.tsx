"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Dummy — password reset is not implemented yet.
    setSubmitted(true);
  }

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <p className="eyebrow">SAMARTH MESS</p>
        <h1>Reset password</h1>

        {submitted ? (
          <>
            <div className="notice" role="status">
              If that number is registered, you'll receive reset instructions shortly.
            </div>
            <p className="muted">
              (Password reset is not yet available. Please contact your mess owner for help.)
            </p>
            <Link href="/login" className="button button-secondary button-wide" style={{ textAlign: "center" }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="muted">
              Enter your registered phone number and we'll send reset instructions.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="field-label" htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <button className="button button-primary button-wide" type="submit" style={{ marginTop: 4 }}>
                Send reset link
              </button>
            </form>

            <Link href="/login" className="hint" style={{ textAlign: "center", color: "var(--green)" }}>
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
