/**
 * QrCard — renders a user's QR code using the .qr-box CSS class.
 * The token is rendered as a code element for copy/display.
 */
import * as React from "react";

interface QrCardProps {
  qrImageUrl?: string | null;
  token?: string | null;
  className?: string;
}

export function QrCard({ qrImageUrl, token, className }: QrCardProps) {
  return (
    <div className={`qr-box ${className ?? ""}`}>
      {qrImageUrl ? (
        <img src={qrImageUrl} alt="QR Code" />
      ) : (
        <div
          style={{
            width: "min(100%, 320px)",
            aspectRatio: "1",
            border: "10px solid #fff",
            background: "var(--line)",
            display: "grid",
            placeItems: "center",
            color: "var(--muted)",
            fontSize: 12,
          }}
        >
          QR code unavailable
        </div>
      )}
      {token && <code>{token}</code>}
    </div>
  );
}
