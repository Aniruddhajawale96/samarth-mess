"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "../../../lib/api";
import { ApiError } from "../../../lib/api/client";
import { defaultPathForRole } from "../../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [userType, setUserType] = useState<"STUDENT" | "PROFESSIONAL">("STUDENT");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Mock OTP verification since backend doesn't have an OTP endpoint in PRD
      if (otp !== "1234") {
        throw new Error("Invalid OTP. Try 1234 for testing.");
      }

      const { user } = await authApi.register({
        name,
        phone,
        email: email || undefined,
        password,
        role,
      });

      router.push(defaultPathForRole(user.role as any));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom: 24 }}>
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss">×</button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "grid", gap: 16 }}>
            <h1 style={{ textAlign: "center" }}>Who are you?</h1>
            
            <div style={{ display: "grid", gap: 8 }}>
              <button 
                type="button" 
                className={`panel ${role === "USER" && userType === "STUDENT" ? "nav-active" : ""}`}
                style={{ padding: 16, cursor: "pointer", border: role === "USER" && userType === "STUDENT" ? "2px solid var(--green)" : "1px solid var(--line)" }}
                onClick={() => { setRole("USER"); setUserType("STUDENT"); }}
              >
                <div style={{ fontWeight: 600 }}>College Student</div>
                <div className="hint">Looking for daily meals</div>
              </button>

              <button 
                type="button" 
                className={`panel ${role === "USER" && userType === "PROFESSIONAL" ? "nav-active" : ""}`}
                style={{ padding: 16, cursor: "pointer", border: role === "USER" && userType === "PROFESSIONAL" ? "2px solid var(--green)" : "1px solid var(--line)" }}
                onClick={() => { setRole("USER"); setUserType("PROFESSIONAL"); }}
              >
                <div style={{ fontWeight: 600 }}>Working Professional</div>
                <div className="hint">Looking for regular meals</div>
              </button>

              <button 
                type="button" 
                className={`panel ${role === "OWNER" ? "nav-active" : ""}`}
                style={{ padding: 16, cursor: "pointer", border: role === "OWNER" ? "2px solid var(--green)" : "1px solid var(--line)" }}
                onClick={() => setRole("OWNER")}
              >
                <div style={{ fontWeight: 600 }}>Mess Owner</div>
                <div className="hint">Manage your mess and customers</div>
              </button>
            </div>

            <button className="button button-primary button-wide" onClick={() => setStep(2)}>
              Continue
            </button>
            <div className="hint" style={{ textAlign: "center" }}>
              Already have an account? <Link href="/login" style={{ color: "var(--ink)", fontWeight: 600 }}>Log in</Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} style={{ display: "grid", gap: 16 }}>
            <h1 style={{ textAlign: "center" }}>Create Profile</h1>
            <p className="muted" style={{ textAlign: "center" }}>
              {role === "OWNER" ? "Owner details" : `${userType === "STUDENT" ? "Student" : "Professional"} details`}
            </p>

            <div>
              <label className="field-label">Full Name</label>
              <input className="input" type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <label className="field-label">Phone Number</label>
              <input className="input" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <label className="field-label">Email (Optional)</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%" }} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="button button-secondary" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="button button-primary" style={{ flex: 1 }}>Continue</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} style={{ display: "grid", gap: 16 }}>
            <h1 style={{ textAlign: "center" }}>Verify Phone</h1>
            <p className="muted" style={{ textAlign: "center" }}>
              Enter the OTP sent to {phone}.
            </p>

            <div>
              <input 
                className="input" 
                type="text" 
                required 
                placeholder="1234" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                style={{ width: "100%", textAlign: "center", fontSize: 24, letterSpacing: 4 }} 
                maxLength={4}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="button button-secondary" disabled={loading} onClick={() => setStep(2)}>Back</button>
              <button type="submit" className="button button-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? "Verifying..." : "Verify & Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
