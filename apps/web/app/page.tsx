"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Config ──────────────────────────────────────────────────────────────────
// All requests go through the Next.js proxy → Express API.
// The HttpOnly session cookie is handled automatically by the browser.
const PREFIX = "/api/proxy";

type Data = Record<string, unknown>;
type Role = "USER" | "OWNER" | "ADMIN";

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${PREFIX}${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: { message?: string } }).error?.message ?? "Request failed");
  return (body as { data: Data }).data;
}

const today = () => new Date().toISOString().slice(0, 10);

// ─── Small UI primitives ──────────────────────────────────────────────────────
function Status({ value }: { value?: string }) {
  return <span className={`status status-${value?.toLowerCase() ?? "pending"}`}>{value?.replaceAll("_", " ") ?? "Pending"}</span>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}
function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-header"><h2>{title}</h2>{action}</div>{children}</section>;
}
function PageTitle({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }) {
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>{title}</h1>
          {detail && <p className="muted">{detail}</p>}
        </div>
      </div>
      {children}
    </>
  );
}
function InlineError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="error-banner">
      {message}
      <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function Shell({ role, view, setView, onLogout, children }: {
  role: Role; view: string; setView: (v: string) => void; onLogout: () => void; children: React.ReactNode;
}) {
  const userNav = [["home", "Home"], ["menu", "Menu"], ["book", "Book meal"], ["payments", "Payments"], ["history", "History"], ["profile", "Profile"]];
  const ownerNav = [["dashboard", "Dashboard"], ["menu", "Menu"], ["customers", "Customers"], ["approvals", "Approvals"], ["attendance", "Attendance"]];
  const nav = role === "USER" ? userNav : ownerNav;
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">SM</span><span>Samarth Mess</span></div>
        <div className="topbar-actions">
          <span className="role-label">{role === "OWNER" ? "Owner workspace" : "User workspace"}</span>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <div className="layout">
        <nav className="sidebar">
          {nav.map(([key, label]) => (
            <button className={`nav-item ${view === key ? "nav-active" : ""}`} key={key} onClick={() => setView(key)}>{label}</button>
          ))}
        </nav>
        <main className="main-content">{children}</main>
      </div>
      <nav className="mobile-nav">
        {nav.slice(0, 5).map(([key, label]) => (
          <button className={view === key ? "nav-active" : ""} key={key} onClick={() => setView(key)}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

// ─── User Workspace ───────────────────────────────────────────────────────────
function UserWorkspace({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState("home");
  const [user, setUser] = useState<Data>();
  const [subscription, setSubscription] = useState<Data>();
  const [menu, setMenu] = useState<Data>();
  const [history, setHistory] = useState<Data>();
  const [qr, setQr] = useState<Data>();
  const [mealType, setMealType] = useState("LUNCH");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const mess = subscription?.mess as Data | undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      const [profile, subscriptions, activity] = await Promise.all([
        api("/auth/me"),
        api("/subscriptions/me").catch(() => ({ items: [] })),
        api("/users/me/history?limit=5").catch(() => ({ bookings: [], attendance: [], payments: [] })),
      ]);
      const current = (subscriptions as { items?: Data[] }).items?.[0];
      setUser((profile as { user: Data }).user);
      setSubscription(current);
      setHistory(activity);
      if ((current?.mess as Data | undefined)?.id)
        setMenu(await api(`/messes/${(current!.mess as Data).id}/menu?date=${today()}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function bookMeal(event: FormEvent) {
    event.preventDefault();
    if (!mess?.id) return;
    try {
      await api("/bookings", { method: "POST", body: JSON.stringify({ messId: mess.id, date: today(), mealType, status: "BOOKED" }) });
      setMessage("Meal booked");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Booking failed"); }
  }

  async function showQr() {
    try { setQr(await api("/users/me/qr")); setView("qr"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "QR unavailable"); }
  }

  if (loading && !user) return <Shell role="USER" view={view} setView={setView} onLogout={onLogout}><div className="loading-state">Loading your workspace...</div></Shell>;
  if (error && !user) return <Shell role="USER" view={view} setView={setView} onLogout={onLogout}><div className="error-state"><h2>Could not load workspace</h2><p className="muted">{error}</p><button className="button button-secondary" onClick={load}>Try again</button></div></Shell>;

  const userData = user as { name?: string; phone?: string; email?: string; status?: string } | undefined;
  const subStatus = (subscription?.subscription as Data | undefined)?.status ?? subscription?.status;

  return (
    <Shell role="USER" view={view} setView={setView} onLogout={onLogout}>
      {error && <InlineError message={error} onDismiss={() => setError("")} />}
      {message && <div className="notice">{message}<button onClick={() => setMessage("")} aria-label="Dismiss">×</button></div>}

      {view === "home" && (
        <>
          <section className="welcome">
            <div><p className="eyebrow">TODAY, {today()}</p><h1>Hello, {userData?.name?.split(" ")[0] ?? "there"}</h1><p className="muted">{(mess as { name?: string } | undefined)?.name ?? "Choose a mess to get started."}</p></div>
            <Status value={String(subStatus ?? "")} />
          </section>
          <section className="metrics">
            <Metric label="Subscription" value={String(subStatus ?? "Not started").replaceAll("_", " ")} />
            <Metric label="Meals today" value={String((menu as { items?: unknown[] } | undefined)?.items?.length ?? 0)} />
            <Metric label="Recent activity" value={String(((history as { bookings?: unknown[] } | undefined)?.bookings?.length ?? 0) + ((history as { attendance?: unknown[] } | undefined)?.attendance?.length ?? 0))} />
          </section>
          <section className="content-grid">
            <Panel title="Today's menu" action={<button className="text-button" onClick={() => setView("menu")}>View menu →</button>}>
              {(menu as { items?: Data[] } | undefined)?.items?.length
                ? <div className="menu-list">{(menu as { items: Data[] }).items.map((item) => <div className="menu-row" key={`${item.mealType as string}-${item.itemName as string}`}><span>{item.mealType as string}</span><strong>{item.itemName as string}</strong></div>)}</div>
                : <Empty>No menu published for today.</Empty>}
            </Panel>
            <Panel title="Quick actions">
              <div className="action-grid">
                <button className="action-button" onClick={() => setView("book")}>Book meal</button>
                <button className="action-button" onClick={showQr}>Show QR</button>
                <button className="action-button" onClick={() => setView("payments")}>Payments</button>
                <button className="action-button" onClick={() => setView("history")}>History</button>
              </div>
            </Panel>
          </section>
        </>
      )}

      {view === "menu" && (
        <PageTitle title="Today's menu" detail={(mess as { name?: string } | undefined)?.name}>
          <Panel title={today()}>
            {(menu as { items?: Data[] } | undefined)?.items?.length
              ? <div className="menu-list">{(menu as { items: Data[] }).items.map((item) => <div className="menu-row menu-row-large" key={`${item.mealType as string}-${item.itemName as string}`}><span>{item.mealType as string}</span><div><strong>{item.itemName as string}</strong><p className="muted">{(item.description as string) || "Prepared fresh."}</p></div></div>)}</div>
              : <Empty>No published menu for today.</Empty>}
          </Panel>
        </PageTitle>
      )}

      {view === "book" && (
        <PageTitle title="Book a meal" detail={(mess as { name?: string } | undefined)?.name}>
          <Panel title={`Booking for ${today()}`}>
            <form className="stack" onSubmit={bookMeal}>
              <label className="field-label" htmlFor="meal">Meal type</label>
              <select id="meal" className="input" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option>
              </select>
              <button className="button button-primary" type="submit">Confirm booking</button>
            </form>
          </Panel>
        </PageTitle>
      )}

      {view === "qr" && (
        <PageTitle title="Your QR identity" detail="Show this code at the mess">
          <Panel title="Attendance QR">
            {qr
              ? <div className="qr-box"><img src={(qr as { qrDataUrl: string }).qrDataUrl} alt="Your attendance QR" /><code>{(qr as { token: string }).token}</code><button className="button button-secondary" onClick={showQr}>Refresh</button></div>
              : <Empty>QR is not loaded.</Empty>}
          </Panel>
        </PageTitle>
      )}

      {view === "payments" && (
        <PageTitle title="Payments" detail="Your payment history">
          <Panel title="Payment records">
            {(history as { payments?: Data[] } | undefined)?.payments?.length
              ? <div className="record-list">{(history as { payments: Data[] }).payments.map((row) => <div className="record" key={(row.payment as Data).id as string}><div><strong>{(row.mess as Data).name as string}</strong><p className="muted">{(row.payment as Data).currency as string} {(row.payment as Data).amount as string}</p></div><Status value={(row.payment as Data).status as string} /></div>)}</div>
              : <Empty>No payments yet.</Empty>}
          </Panel>
        </PageTitle>
      )}

      {view === "history" && (
        <PageTitle title="Activity history" detail="Bookings and attendance">
          <section className="content-grid">
            <Panel title="Bookings">
              {(history as { bookings?: Data[] } | undefined)?.bookings?.length
                ? (history as { bookings: Data[] }).bookings.map((item) => <div className="record" key={item.id as string}><span>{item.date as string} · {item.mealType as string}</span><Status value={item.status as string} /></div>)
                : <Empty>No bookings yet.</Empty>}
            </Panel>
            <Panel title="Attendance">
              {(history as { attendance?: Data[] } | undefined)?.attendance?.length
                ? (history as { attendance: Data[] }).attendance.map((item) => <div className="record" key={item.id as string}><span>{item.date as string} · {item.mealType as string}</span><Status value={item.status as string} /></div>)
                : <Empty>No attendance records yet.</Empty>}
            </Panel>
          </section>
        </PageTitle>
      )}

      {view === "profile" && (
        <PageTitle title="Profile">
          <Panel title={userData?.name ?? ""}>
            <div className="profile-grid">
              <span>Phone</span><strong>{userData?.phone}</strong>
              <span>Email</span><strong>{userData?.email || "Not added"}</strong>
              <span>Account</span><Status value={userData?.status} />
            </div>
          </Panel>
        </PageTitle>
      )}
    </Shell>
  );
}

// ─── Owner Workspace ──────────────────────────────────────────────────────────
function OwnerWorkspace({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState("dashboard");
  const [dashboard, setDashboard] = useState<Data>();
  const [menus, setMenus] = useState<Data[]>([]);
  const [customers, setCustomers] = useState<Data[]>([]);
  const [approvals, setApprovals] = useState<Data[]>([]);
  const [attendance, setAttendance] = useState<Data>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [menuName, setMenuName] = useState("");
  const [menuType, setMenuType] = useState("LUNCH");
  const [menuDate, setMenuDate] = useState(today());
  const [attendanceUser, setAttendanceUser] = useState("");
  const [attendanceType, setAttendanceType] = useState("PRESENT");

  async function load() {
    try {
      setError("");
      const [dash, menuRows, customerRows, pending, daily] = await Promise.all([
        api("/owner/dashboard"),
        api("/owner/menus"),
        api("/owner/customers?limit=100"),
        api("/owner/subscriptions/pending"),
        api(`/owner/attendance?date=${today()}`),
      ]);
      setDashboard(dash);
      setMenus(((menuRows as { items?: Data[] }).items ?? []));
      setCustomers(((customerRows as { items?: Data[] }).items ?? []));
      setApprovals(((pending as { items?: Data[] }).items ?? []));
      setAttendance(daily);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load owner workspace"); }
  }

  useEffect(() => { void load(); }, []);

  async function act(path: string, init: RequestInit) {
    try { await api(path, init); setMessage("Saved"); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Action failed"); }
  }

  async function createMenu(event: FormEvent) {
    event.preventDefault();
    if (!(dashboard?.mess as Data | undefined)?.id || !menuName) return;
    await act("/owner/menus", { method: "POST", body: JSON.stringify({ messId: (dashboard!.mess as Data).id, date: menuDate, status: "DRAFT", items: [{ mealType: menuType, name: menuName, displayOrder: 0 }] }) });
    setMenuName("");
  }

  async function saveAttendance(event: FormEvent) {
    event.preventDefault();
    if (!attendanceUser || !(attendance?.mess as Data | undefined)?.id) return;
    await act("/owner/attendance/manual", { method: "POST", body: JSON.stringify({ messId: (attendance!.mess as Data).id, date: today(), records: [{ userId: attendanceUser, mealType: "LUNCH", status: attendanceType }] }) });
  }

  return (
    <Shell role="OWNER" view={view} setView={setView} onLogout={onLogout}>
      {error && <InlineError message={error} onDismiss={() => setError("")} />}
      {message && <div className="notice">{message}<button onClick={() => setMessage("")} aria-label="Dismiss">×</button></div>}

      {view === "dashboard" && (
        <PageTitle title="Owner dashboard" detail={(dashboard?.mess as Data | undefined)?.name as string | undefined}>
          <section className="metrics metrics-owner">
            <Metric label="Customers" value={String((dashboard?.customers as Data | undefined)?.total ?? "–")} />
            <Metric label="Active today" value={String((dashboard?.customers as Data | undefined)?.active ?? "–")} />
            <Metric label="Pending approvals" value={String((dashboard?.customers as Data | undefined)?.pendingApprovals ?? "–")} />
            <Metric label="Revenue" value={`₹${(dashboard?.revenue as Data | undefined)?.successfulAmount ?? "–"}`} />
          </section>
          <section className="content-grid">
            <Panel title="Today's operations">
              <div className="operations">
                <Metric label="Expected meals" value={String((dashboard?.today as Data | undefined)?.expectedMeals ?? "–")} />
                <Metric label="Present" value={String((dashboard?.today as Data | undefined)?.present ?? "–")} />
                <Metric label="Absent" value={String((dashboard?.today as Data | undefined)?.absent ?? "–")} />
                <Metric label="Extra" value={String((dashboard?.today as Data | undefined)?.extra ?? "–")} />
              </div>
            </Panel>
            <Panel title="Primary actions">
              <div className="action-grid">
                <button className="action-button" onClick={() => setView("menu")}>Manage menu</button>
                <button className="action-button" onClick={() => setView("approvals")}>Approvals</button>
                <button className="action-button" onClick={() => setView("customers")}>Customers</button>
                <button className="action-button" onClick={() => setView("attendance")}>Attendance</button>
              </div>
            </Panel>
          </section>
        </PageTitle>
      )}

      {view === "menu" && (
        <PageTitle title="Menu" detail="Create drafts and publish daily meals">
          <section className="content-grid">
            <Panel title="Add menu item">
              <form className="stack" onSubmit={createMenu}>
                <input className="input" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} type="date" required />
                <select className="input" value={menuType} onChange={(e) => setMenuType(e.target.value)}><option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option></select>
                <input className="input" value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder="Item name" required />
                <button className="button button-primary">Save draft</button>
              </form>
            </Panel>
            <Panel title="Menu history">
              {menus.length
                ? <div className="record-list">{menus.map((row) => <div className="record" key={(row.menu as Data).id as string}><div><strong>{row.messName as string}</strong><p className="muted">{((row.menu as Data).startDate as string)?.slice(0, 10)}</p></div><div className="row-actions"><Status value={(row.menu as Data).status as string} />{(row.menu as Data).status !== "PUBLISHED" && <button className="small-button" onClick={() => act(`/owner/menus/${(row.menu as Data).id as string}/publish`, { method: "POST" })}>Publish</button>}</div></div>)}</div>
                : <Empty>No menus created yet.</Empty>}
            </Panel>
          </section>
        </PageTitle>
      )}

      {view === "customers" && (
        <PageTitle title="Customers" detail="Your mess members">
          <Panel title={`${customers.length} customers`}>
            {customers.length
              ? <div className="record-list">{customers.map((row) => <div className="record" key={(row.user as Data).id as string}><div><strong>{(row.user as Data).name as string}</strong><p className="muted">{(row.user as Data).phone as string} · {((row.subscription as Data).status as string).replaceAll("_", " ")}</p></div><div className="row-actions"><Status value={(row.user as Data).status as string} /><button className="small-button" onClick={() => act(`/owner/customers/${(row.user as Data).id as string}/status`, { method: "PATCH", body: JSON.stringify({ status: (row.user as Data).status === "ACTIVE" ? "DISABLED" : "ACTIVE" }) })}>{(row.user as Data).status === "ACTIVE" ? "Disable" : "Enable"}</button></div></div>)}</div>
              : <Empty>No customers yet.</Empty>}
          </Panel>
        </PageTitle>
      )}

      {view === "approvals" && (
        <PageTitle title="Approvals" detail="Subscription requests">
          <Panel title="Pending requests">
            {approvals.length
              ? <div className="record-list">{approvals.map((row) => <div className="record" key={(row.subscription as Data).id as string}><div><strong>{(row.user as Data).name as string}</strong><p className="muted">{(row.user as Data).phone as string}</p></div><div className="row-actions"><button className="small-button" onClick={() => act(`/owner/subscriptions/${(row.subscription as Data).id as string}/approve`, { method: "POST" })}>Approve</button><button className="small-button danger-outline" onClick={() => act(`/owner/subscriptions/${(row.subscription as Data).id as string}/reject`, { method: "POST" })}>Reject</button></div></div>)}</div>
              : <Empty>No pending approvals.</Empty>}
          </Panel>
        </PageTitle>
      )}

      {view === "attendance" && (
        <PageTitle title="Attendance" detail={today()}>
          <section className="content-grid">
            <Panel title="Manual attendance">
              <form className="stack" onSubmit={saveAttendance}>
                <select className="input" value={attendanceUser} onChange={(e) => setAttendanceUser(e.target.value)}>
                  <option value="">Select customer</option>
                  {(attendance?.customers as Data[] | undefined)?.map((row) => <option key={(row.user as Data).id as string} value={(row.user as Data).id as string}>{(row.user as Data).name as string}</option>)}
                </select>
                <select className="input" value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}><option>PRESENT</option><option>ABSENT</option><option>EXTRA</option></select>
                <button className="button button-primary">Save attendance</button>
              </form>
            </Panel>
            <Panel title="Today's records">
              {(attendance?.attendance as Data[] | undefined)?.length
                ? (attendance!.attendance as Data[]).map((row) => <div className="record" key={row.id as string}><span>{row.date as string} · {row.mealType as string}</span><Status value={row.status as string} /></div>)
                : <Empty>No attendance recorded today.</Empty>}
            </Panel>
          </section>
        </PageTitle>
      )}
    </Shell>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);
  const [roleOverride, setRoleOverride] = useState<Role>("USER");

  useEffect(() => {
    // Check if the session cookie is valid by hitting /auth/me.
    // No token handling — just credentials: "include".
    api("/auth/me")
      .then((data) => {
        const role = ((data as { user?: { role?: string } }).user?.role ?? "USER") as Role;
        if (role === "ADMIN") {
          router.replace("/admin");
          return;
        }
        setUserRole(role);
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function logout() {
    await fetch(`${PREFIX}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUserRole(null);
    router.replace("/login");
  }

  if (checking) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p className="muted">Loading…</p>
      </main>
    );
  }

  if (!userRole) return null;

  // If the actual role is OWNER, only show owner workspace.
  // If USER, allow switching to owner view for demo purposes (role-switch button).
  const effectiveRole = userRole === "OWNER" ? "OWNER" : roleOverride;

  return (
    <>
      {userRole === "USER" && (
        <div className="role-switch">
          <button className={effectiveRole === "USER" ? "selected" : ""} onClick={() => setRoleOverride("USER")}>User</button>
          <button className={effectiveRole === "OWNER" ? "selected" : ""} onClick={() => setRoleOverride("OWNER")}>Owner</button>
        </div>
      )}
      {effectiveRole === "USER"
        ? <UserWorkspace onLogout={logout} />
        : <OwnerWorkspace onLogout={logout} />
      }
    </>
  );
}
