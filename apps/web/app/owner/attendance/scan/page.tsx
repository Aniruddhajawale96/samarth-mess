"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Lazy-load the scanner component — html5-qrcode uses browser-only APIs
// that crash during Next.js SSR/prerender of static pages (404, _error).
const ScanScanner = dynamic(() => import("./ScanScanner"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 40, textAlign: "center" }}>Loading scanner…</div>
  ),
});

export default function ScanAttendancePage() {
  return <ScanScanner />;
}
