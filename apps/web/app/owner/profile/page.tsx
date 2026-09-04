"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ownerApi } from "../../../lib/api";
import { usersApi } from "../../../lib/api";
import { Card, CardHeader, CardContent, Button } from "../../../components/ui";
import { UserAvatar, StatusBadge, MoneyDisplay } from "../../../components/domain";

export default function OwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [mess, setMess] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingMess, setEditingMess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // User form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Mess form state
  const [messName, setMessName] = useState("");
  const [messDescription, setMessDescription] = useState("");
  const [messAddress, setMessAddress] = useState("");
  const [messContact, setMessContact] = useState("");
  const [messMonthlyPrice, setMessMonthlyPrice] = useState<number>(0);
  const [messMealsPerDay, setMessMealsPerDay] = useState<number>(3);

  const photoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    Promise.all([usersApi.getProfile(), ownerApi.getOwnerMess()])
      .then(([userRes, messRes]) => {
        const u = userRes.user;
        const m = messRes.mess;
        setUser(u);
        setMess(m);
        setName(u.name || "");
        setEmail(u.email || "");
        setMessName(m.name || "");
        setMessDescription(m.description || "");
        setMessAddress(m.address || "");
        setMessContact(m.contact || "");
        setMessMonthlyPrice(m.monthlyPrice || 0);
        setMessMealsPerDay(m.mealsPerDay || 3);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load profile data.");
        setLoading(false);
      });
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await usersApi.updateProfile({ name, email: email || undefined });
      setUser(res.user);
      setEditing(false);
      setSuccessMsg("Profile updated.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mess) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await ownerApi.updateOwnerMess(mess.id, {
        name: messName,
        description: messDescription,
        address: messAddress,
        contact: messContact,
        monthlyPrice: messMonthlyPrice,
        mealsPerDay: messMealsPerDay,
      });
      setMess(res.mess);
      setEditingMess(false);
      setSuccessMsg("Mess details updated.");
    } catch (err: any) {
      setError(err.message || "Failed to update mess details.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await usersApi.uploadProfilePhoto(file);
      setUser((prev: any) => ({ ...prev, profilePhotoUrl: res.profilePhotoUrl }));
      setSuccessMsg("Photo updated.");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mess) return;
    setUploadingCover(true);
    try {
      const res = await ownerApi.uploadMessCoverImage(mess.id, file);
      setMess(res.mess);
      setSuccessMsg("Cover image updated.");
    } catch (err: any) {
      setError(err.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 600, margin: "0 auto" }}>
        <div style={{ height: 28, background: "var(--line)", borderRadius: 6, width: "30%" }} />
        <div style={{ height: 200, background: "var(--line)", borderRadius: 12 }} />
        <div style={{ height: 200, background: "var(--line)", borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 600, margin: "0 auto" }}>
      <div>
        <p className="eyebrow">ACCOUNT</p>
        <h1>Profile</h1>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
      {successMsg && (
        <div style={{ padding: 12, background: "var(--green-soft)", borderRadius: 8, color: "var(--green)", fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Owner Profile Card */}
      <Card>
        <CardHeader>
          <h2>Personal Info</h2>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <UserAvatar name={user?.name} profilePhotoUrl={user?.profilePhotoUrl} size="lg" />
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            <button
              className="button button-secondary"
              style={{ fontSize: 13, padding: "4px 14px" }}
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveUser} style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="field-label">Full Name</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%" }} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="button button-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="hint">Name</span>
                <span style={{ fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="hint">Phone</span>
                <span style={{ fontWeight: 600 }}>{user?.phone}</span>
              </div>
              {user?.email && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Email</span>
                  <span style={{ fontWeight: 600 }}>{user.email}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="hint">Status</span>
                <StatusBadge status={user?.status ?? "ACTIVE"} />
              </div>
              <Button variant="secondary" onClick={() => setEditing(true)}>Edit Personal Info</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mess Profile Card */}
      {mess && (
        <Card>
          <CardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Mess Details</h2>
              <StatusBadge status={mess.status} />
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 16 }}>
            {/* Cover image */}
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "var(--line)", height: 140 }}>
              {mess.coverImage ? (
                <img src={mess.coverImage} alt="Mess cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
                  No cover image
                </div>
              )}
              <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
              <button
                className="button button-secondary"
                style={{ position: "absolute", bottom: 8, right: 8, fontSize: 13, padding: "4px 12px", background: "rgba(0,0,0,0.6)", color: "white", borderColor: "transparent" }}
                onClick={() => coverRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? "Uploading..." : "Change Cover"}
              </button>
            </div>

            {editingMess ? (
              <form onSubmit={handleSaveMess} style={{ display: "grid", gap: 12 }}>
                <div>
                  <label className="field-label">Mess Name</label>
                  <input type="text" className="input" value={messName} onChange={e => setMessName(e.target.value)} required style={{ width: "100%" }} />
                </div>
                <div>
                  <label className="field-label">Description</label>
                  <textarea className="input" value={messDescription} onChange={e => setMessDescription(e.target.value)} rows={3} style={{ width: "100%", resize: "vertical" }} />
                </div>
                <div>
                  <label className="field-label">Address</label>
                  <input type="text" className="input" value={messAddress} onChange={e => setMessAddress(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label className="field-label">Contact</label>
                  <input type="text" className="input" value={messContact} onChange={e => setMessContact(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="field-label">Monthly Price (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={messMonthlyPrice}
                      onChange={e => setMessMonthlyPrice(Number(e.target.value))}
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label className="field-label">Meals / Day</label>
                    <select className="input" value={messMealsPerDay} onChange={e => setMessMealsPerDay(Number(e.target.value))} style={{ width: "100%" }}>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="button button-secondary" onClick={() => setEditingMess(false)}>Cancel</button>
                  <button type="submit" className="button button-primary" disabled={saving} style={{ flex: 1 }}>
                    {saving ? "Saving..." : "Save Mess Details"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Mess Name</span>
                  <span style={{ fontWeight: 600 }}>{mess.name}</span>
                </div>
                {mess.description && (
                  <div>
                    <span className="hint">Description</span>
                    <p style={{ marginTop: 4, fontSize: 14 }}>{mess.description}</p>
                  </div>
                )}
                {mess.address && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="hint">Address</span>
                    <span style={{ fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{mess.address}</span>
                  </div>
                )}
                {mess.contact && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="hint">Contact</span>
                    <span style={{ fontWeight: 600 }}>{mess.contact}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Monthly Price</span>
                  <span style={{ fontWeight: 600 }}><MoneyDisplay amount={mess.monthlyPrice} /></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="hint">Meals / Day</span>
                  <span style={{ fontWeight: 600 }}>{mess.mealsPerDay}</span>
                </div>
                <Button variant="secondary" onClick={() => setEditingMess(true)}>Edit Mess Details</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
