"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { useState, useEffect } from "react";
import { qrApi } from "../../../lib/api";
import { QrCard } from "../../../components/domain";

export default function UserQrPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    qrApi.getMyQr()
      .then((res: any) => {
        setToken(res.token);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <div>
        <p className="eyebrow">ATTENDANCE</p>
        <h1>My QR Code</h1>
      </div>

      <p className="muted">
        Show this QR to the mess owner for attendance marking.
      </p>

      {loading ? (
        <div style={{ padding: 40 }}>Loading QR...</div>
      ) : token ? (
        <QrCard token={token} />
      ) : (
        <div className="empty">
          <p>QR code not available. Contact support.</p>
        </div>
      )}

      <p className="hint" style={{ fontSize: 12 }}>
        The QR code is linked to your account. Do not share it with others.
      </p>
    </div>
  );
}
