import * as React from "react";
import Link from "next/link";
import { UserAvatar } from "../../components/domain";
import { fetchSession } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await fetchSession();
  
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  if (session.role !== "OWNER") {
    redirect(session.role === "USER" ? "/user" : "/admin");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <span>Samarth Mess</span>
        </div>
        <div className="topbar-actions">
          <span className="role-label">Owner Area</span>
          <UserAvatar name={session.user.name} profilePhotoUrl={session.user.profilePhotoUrl} size="sm" />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Link href="/owner" className="nav-item nav-active">Dashboard</Link>
          <Link href="/owner/menu" className="nav-item">Menu</Link>
          <Link href="/owner/customers" className="nav-item">Customers</Link>
          <Link href="/owner/attendance" className="nav-item">Attendance</Link>
          <Link href="/owner/payments" className="nav-item">Payments</Link>
          <Link href="/owner/profile" className="nav-item">Profile</Link>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>

      <nav className="mobile-nav">
        <Link href="/owner" className="nav-item text-center">Dash</Link>
        <Link href="/owner/menu" className="nav-item text-center">Menu</Link>
        <Link href="/owner/customers" className="nav-item text-center">Users</Link>
        <Link href="/owner/attendance" className="nav-item text-center">Attd</Link>
        <Link href="/owner/payments" className="nav-item text-center">Pay</Link>
      </nav>
    </div>
  );
}
