"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="auth-shell">
      <div className="auth-panel" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>Reset Password</h1>
        
        {submitted ? (
          <div style={{ textAlign: "center", display: "grid", gap: 16 }}>
            <p>If an account exists with that number, we have sent password reset instructions.</p>
            <Link href="/login" className="button button-secondary button-wide">Return to Login</Link>
          </div>
        ) : (
          <>
            <p className="muted" style={{ textAlign: "center", marginBottom: 24 }}>
              Enter your registered phone number.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="field-label" htmlFor="phone">Phone number</label>
                <input id="phone" className="input" type="tel" placeholder="e.g. 9876543210" required style={{ width: "100%" }} />
              </div>
              <button type="submit" className="button button-primary button-wide">Send Reset Link</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
