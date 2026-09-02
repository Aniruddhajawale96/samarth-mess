import * as React from "react";
import Link from "next/link";
import { UserAvatar } from "../../components/domain";
import { fetchSession } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await fetchSession();
  
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  if (session.role !== "USER") {
    redirect(session.role === "OWNER" ? "/owner" : "/admin");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <span>Samarth Mess</span>
        </div>
        <div className="topbar-actions">
          <UserAvatar name={session.user.name} profilePhotoUrl={session.user.profilePhotoUrl} size="sm" />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Link href="/user" className="nav-item nav-active">Home</Link>
          <Link href="/user/menu" className="nav-item">Menu</Link>
          <Link href="/user/book-meal" className="nav-item">Book Meal</Link>
          <Link href="/user/history/payments" className="nav-item">Payments</Link>
          <Link href="/user/profile" className="nav-item">Profile</Link>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>

      <nav className="mobile-nav">
        <Link href="/user" className="nav-item text-center">Home</Link>
        <Link href="/user/menu" className="nav-item text-center">Menu</Link>
        <Link href="/user/book-meal" className="nav-item text-center">Book</Link>
        <Link href="/user/history/payments" className="nav-item text-center">Pay</Link>
        <Link href="/user/profile" className="nav-item text-center">Profile</Link>
      </nav>
    </div>
  );
}
