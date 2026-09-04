"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usersApi, authApi } from "../../../lib/api";
import { ApiError } from "../../../lib/api/client";
import { StatusBadge, UserAvatar } from "../../../components/domain";
import { Button } from "../../../components/ui";
import Link from "next/link";

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usersApi.getProfile()
      .then(res => {
        setUser(res.user);
        setName(res.user.name ?? "");
        setEmail(res.user.email ?? "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await usersApi.updateProfile({ name, email: email || undefined });
      setUser(res.user);
      setEditing(false);
      setSuccess("Profile updated.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await usersApi.uploadProfilePhoto(file);
      setUser((prev: any) => ({ ...prev, profilePhotoUrl: res.profilePhotoUrl }));
      setSuccess("Photo updated.");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ height: 24, background: "var(--line)", borderRadius: 6, width: "40%" }} />
        <div style={{ height: 80, background: "var(--line)", borderRadius: "50%", width: 80, margin: "0 auto" }} />
        <div style={{ height: 200, background: "var(--line)", borderRadius: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 480, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">ACCOUNT</p>
        <h1>Profile</h1>
      </div>

      {/* Avatar + photo upload */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <UserAvatar name={user?.name} profilePhotoUrl={user?.profilePhotoUrl} size="lg" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoUpload}
        />
        <button
          className="button button-secondary"
          style={{ fontSize: 13, padding: "4px 14px" }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Change Photo"}
        </button>
      </div>

      {error && <div className="error-banner">{error}<button onClick={() => setError("")}>×</button></div>}
      {success && <div style={{ padding: 12, background: "var(--green-soft)", borderRadius: 8, color: "var(--green)", fontWeight: 600 }}>{success}</div>}

      {/* Profile info / edit form */}
      <div className="panel" style={{ padding: 20, display: "grid", gap: 16 }}>
        {editing ? (
          <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="button button-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <p className="hint" style={{ fontSize: 12 }}>Full Name</p>
              <p style={{ fontWeight: 600 }}>{user?.name}</p>
            </div>
            <div>
              <p className="hint" style={{ fontSize: 12 }}>Phone</p>
              <p style={{ fontWeight: 600 }}>{user?.phone}</p>
            </div>
            {user?.email && (
              <div>
                <p className="hint" style={{ fontSize: 12 }}>Email</p>
                <p style={{ fontWeight: 600 }}>{user.email}</p>
              </div>
            )}
            {user?.userType && (
              <div>
                <p className="hint" style={{ fontSize: 12 }}>User Type</p>
                <p style={{ fontWeight: 600, textTransform: "capitalize" }}>{user.userType.toLowerCase()}</p>
              </div>
            )}
            <div>
              <p className="hint" style={{ fontSize: 12 }}>Account Status</p>
              <StatusBadge status={user?.status ?? "ACTIVE"} />
            </div>
            <button className="button button-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* History links */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        {[
          { href: "/user/payments", label: "Payment History" },
          { href: "/user/history/bookings", label: "Booking History" },
          { href: "/user/history/attendance", label: "Attendance History" },
          { href: "/user/qr", label: "My QR Code" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} className="record" style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderTop: "1px solid var(--line)" }}>
            <span>{label}</span>
            <span style={{ color: "var(--muted)" }}>›</span>
          </Link>
        ))}
      </div>

      <button
        className="button button-secondary"
        style={{ color: "var(--red)", borderColor: "var(--red)" }}
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </div>
  );
}
