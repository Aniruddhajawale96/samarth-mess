import * as React from "react";
import Link from "next/link";
import { UserAvatar } from "../../components/domain";
import { fetchSession } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await fetchSession();
  
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  if (session.role !== "ADMIN") {
    redirect(session.role === "USER" ? "/user" : "/owner");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ background: "var(--ink)" }}>SM</div>
          <span>Samarth Mess Admin</span>
        </div>
        <div className="topbar-actions">
          <span className="role-label">Platform Admin</span>
          <UserAvatar name={session.user.name} profilePhotoUrl={session.user.profilePhotoUrl} size="sm" />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Link href="/admin" className="nav-item nav-active">Dashboard</Link>
          <Link href="/admin/users" className="nav-item">Users</Link>
          <Link href="/admin/owners" className="nav-item">Owners</Link>
          <Link href="/admin/activity" className="nav-item">Activity</Link>
          <Link href="/admin/settings" className="nav-item">Settings</Link>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
