export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      <header
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "20px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border-subtle)",
          textAlign: "center"
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#ffedd5",
            color: "var(--brand-primary)",
            fontWeight: 700,
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "999px",
            marginBottom: "12px"
          }}
        >
          MVP Foundation
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px"
          }}
        >
          Samarth Mess
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Mess Management Platform for Students, Professionals, and Mess Owners
        </p>
      </header>

      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "20px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
          Core Operating Loop
        </h2>
        <ul
          style={{
            listStyleType: "none",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "14px",
            color: "var(--text-secondary)"
          }}
        >
          <li>✨ 1. Register as Student or Professional</li>
          <li>📍 2. Discover Messes & View Daily Menus</li>
          <li>💳 3. Subscribe & Pay Monthly Fee</li>
          <li>✅ 4. Owner Approval & Active Subscription</li>
          <li>🍽️ 5. Book, Skip, or Request Extra Meals</li>
          <li>📱 6. QR & Manual Attendance Check-in</li>
        </ul>
      </section>

      <footer
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "auto"
        }}
      >
        Samarth Mess Platform &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
