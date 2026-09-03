import * as React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <span>Samarth Mess</span>
        </div>
        <div className="topbar-actions">
          <Link href="/login" className="text-button">Login</Link>
          <Link href="/register" className="button button-primary" style={{ padding: "6px 14px", minHeight: 32 }}>Register</Link>
        </div>
      </header>
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "24px" }}>
        {children}
      </main>
    </div>
  );
}
