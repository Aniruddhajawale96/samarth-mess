import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: 64, fontWeight: 800, marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: 18, marginBottom: 24 }}>This page could not be found.</p>
        <Link href="/" style={{ color: "var(--primary)", fontWeight: 600 }}>← Go home</Link>
      </div>
    </div>
  );
}
