const { useState, useEffect, useCallback } = React;

const DEMO_SUPPLIERS = [
  { id: 1, name: "Test Company 1 Ltd", initials: "T1", category: "Produce · UK", risk: "High", color: "#dbeafe", textColor: "#1d4ed8" },
  { id: 2, name: "Test Company 2 Ltd", initials: "T2", category: "Dairy · Ireland", risk: "Low", color: "#dcfce7", textColor: "#166534" },
  { id: 3, name: "Test Company 3 Ltd", initials: "T3", category: "Grains · Germany", risk: "Med", color: "#fef3c7", textColor: "#b45309" },
];

const DEMO_CERTS = {
  1: [
    { name: "HACCP", expiry: "2026-03-22", status: "danger" },
    { name: "BRC Grade A", expiry: "2026-08-15", status: "ok" },
    { name: "ISO 22000", expiry: "2026-12-01", status: "ok" },
    { name: "Allergen", expiry: "Needs update", status: "warn" },
  ],
  2: [
    { name: "HACCP", expiry: "2026-11-10", status: "ok" },
    { name: "ISO 22000", expiry: "2026-09-30", status: "ok" },
  ],
  3: [
    { name: "ISO 22000", expiry: "2026-04-13", status: "warn" },
    { name: "HACCP", expiry: "2026-07-20", status: "ok" },
  ],
};

const DEMO_QUERIES = [
  {
    id: "Q001", supplierId: 1, supplierName: "Test Company 1 Ltd", type: "Certificate", priority: "High", subject: "HACCP Certificate Renewal Required", status: "Pending", raisedBy: "QA Test User", raisedDays: 38, messages: [
      { from: "QA", text: "Please provide your updated HACCP certificate. Current one expires in 5 days. This is urgent.", daysAgo: 38 },
      { from: "Supplier", text: "Hi Test User, we are in the process of renewal. Auditor visit is scheduled next week.", daysAgo: 35 },
      { from: "QA", text: "Noted. Please submit within 7 days or supply may be suspended.", daysAgo: 35 },
      { from: "Supplier", text: "Understood. We have attached the interim audit report as evidence.", daysAgo: 30 },
    ], attachments: ["interim-audit-report.pdf", "haccp-current-cert.pdf"]
  },
  {
    id: "Q002", supplierId: 6, supplierName: "Test Company 2 Ltd", type: "Allergen", priority: "High", subject: "Allergen Declaration Missing", status: "In Review", raisedBy: "James Okafor", raisedDays: 12, messages: [
      { from: "QA", text: "Please provide the full allergen declaration for Product Line B.", daysAgo: 12 },
      { from: "Supplier", text: "We are compiling the documentation, will send by end of week.", daysAgo: 9 },
    ], attachments: []
  },
  {
    id: "Q003", supplierId: 3, supplierName: "Test Company 3 Ltd", type: "HACCP", priority: "Med", subject: "Updated HACCP Plan Request", status: "Pending", raisedBy: "QA Test User", raisedDays: 5, messages: [
      { from: "QA", text: "Please share your latest HACCP plan revision.", daysAgo: 5 },
    ], attachments: []
  }
];

const QUERY_TYPES = ["Allergen Info", "HACCP / Certificate", "Non-Conformance", "Audit", "Other"];
const TEMPLATES = {
  allergen: { subject: "Allergen Declaration Update Required", type: "Allergen Info", message: "Please provide an updated allergen declaration for all product lines supplied to us." },
  haccp: { subject: "HACCP Certificate Renewal", type: "HACCP / Certificate", message: "Your HACCP certificate is due for renewal. Please submit the updated certificate at your earliest convenience." },
  audit: { subject: "Annual Audit Scheduling", type: "Audit", message: "We would like to schedule the annual supplier audit. Please propose three available dates within the next 30 days." },
  nc: { subject: "Non-Conformance Follow-Up", type: "Non-Conformance", message: "We have an open non-conformance on record. Please provide corrective action evidence and a root cause analysis." },
  iso: { subject: "ISO 22000 Renewal Confirmation", type: "HACCP / Certificate", message: "Please confirm the status of your ISO 22000 renewal and provide the updated certificate when available." },
  brc: { subject: "BRC Audit Report Submission", type: "Audit", message: "Please submit your latest BRC audit report for our records." },
};

const HEATMAP = [
  { id: 1, name: "Agri-H", score: 8.2, cls: "hm-3" },
  { id: 3, name: "MedGrain", score: 5.4, cls: "hm-2" },
  { id: 2, name: "DairyFr", score: 2.1, cls: "hm-1" },
  { id: 4, name: "FreshPk", score: 4.8, cls: "hm-2" },
  { id: 6, name: "ProMeat", score: 9.0, cls: "hm-3" },
  { id: 5, name: "SpiceB", score: 1.9, cls: "hm-1" },
  { id: 7, name: "AquaSp", score: 5.1, cls: "hm-2" },
  { id: 1, name: "NutroSp", score: 7.6, cls: "hm-3" },
  { id: 2, name: "OrganX", score: 2.7, cls: "hm-1" },
  { id: 3, name: "ColdCh", score: 4.3, cls: "hm-2" },
];

// ─── LocalStorage helpers ────────────────────────────────────────────────────
function loadState(key, seed) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : seed;
  } catch { return seed; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

// ─── Reusable badge components ───────────────────────────────────────────────
const RiskBadge = ({ risk }) => {
  const cls = { High: "risk-high", Med: "risk-med", Low: "risk-low" }[risk] || "risk-low";
  return <span className={`badge ${cls} px-2 py-1`} style={{ fontSize: 11, borderRadius: 20, fontWeight: 500 }}>{risk} Risk</span>;
};
const StatusPill = ({ status }) => {
  const cls = { "Pending": "s-pending", "In Review": "s-review", "Resolved": "s-resolved", "Rejected": "s-rejected" }[status] || "s-pending";
  return <span className={`badge ${cls} px-2 py-1`} style={{ fontSize: 11, borderRadius: 20, fontWeight: 500 }}>{status}</span>;
};
const PriorityBar = ({ priority }) => (
  <div className={`priority-bar ${priority === "High" ? "p-high" : priority === "Med" ? "p-med" : "p-low"}`} style={{ width: 4, minHeight: 44 }} />
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ screen, setScreen, queries }) => {
  const openCount = queries.filter(q => q.status === "Pending" || q.status === "In Review").length;
  const items = [
    { id: "dashboard", icon: "bi-grid", label: "Dashboard" },
    { id: "queries", icon: "bi-list-ul", label: "Query Tracker", badge: openCount },
    { id: "raise", icon: "bi-plus-circle", label: "Raise Query" },
  ];
  return (
    <div className="sidebar d-flex flex-column py-3" style={{ position: "sticky", top: 0, height: "100vh" }}>
      <div className="px-4 pb-3 mb-2" style={{ borderBottom: "1px solid #e3e8ef" }}>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>Food Safety Portal</div>
      </div>
      <div className="px-2 mt-2">
        <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: ".05em", padding: "0 14px 6px", textTransform: "uppercase" }}>Main</div>
        {items.map(it => (
          <button key={it.id} onClick={() => setScreen(it.id)}
            className={`nav-link w-100 text-start d-flex align-items-center gap-2 mb-1 border-0 bg-transparent ${screen === it.id ? "active" : ""}`}
            style={{ fontSize: 13 }}>
            <i className={`bi ${it.icon}`} style={{ fontSize: 15 }} />
            {it.label}
            {it.badge > 0 && <span className="badge ms-auto" style={{ background: "#ef4444", color: "#fff", fontSize: 10, borderRadius: 20 }}>{it.badge}</span>}
          </button>
        ))}
      </div>
      <div className="mt-auto px-3 py-2 d-flex align-items-center gap-2" style={{ borderTop: "1px solid #e3e8ef" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#3b5bdb" }}>SM</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a2e" }}>QA Test User</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>QA Manager</div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = ({ queries, setScreen, setSelectedQuery }) => {
  const open = queries.filter(q => q.status === "Pending" || q.status === "In Review").length;
  const overdue = queries.filter(q => (q.status === "Pending" || q.status === "In Review") && q.raisedDays > 30).length;

  return (
    <div className="p-4">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Suppliers", val: DEMO_SUPPLIERS.length, sub: "Active suppliers", subColor: "#166534" },
          { label: "Open Queries", val: open, sub: `${overdue} overdue`, subColor: "#b45309" },
          { label: "Certs Expiring", val: 4, sub: "Within 30 days", subColor: "#b91c1c" },
          { label: "High Risk", val: DEMO_SUPPLIERS.filter(s => s.risk === "High").length, sub: "Require review", subColor: "#b91c1c" },
        ].map(s => (
          <div key={s.label} className="col-6 col-xl-3">
            <div className="stat-card">
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: "#1a1a2e" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: s.subColor, marginTop: 3 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Suppliers list */}
        <div className="col-12 col-xl-7">
          <div className="bg-white rounded-3 border p-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>Suppliers</div>
            {DEMO_SUPPLIERS.map(s => {
              const openQ = queries.filter(q => q.supplierId === s.id && (q.status === "Pending" || q.status === "In Review")).length;
              return (
                <div key={s.id} className="query-row d-flex align-items-center gap-3 py-2 px-1 rounded"
                  onClick={() => { const q = queries.find(qq => qq.supplierId === s.id); if (q) { setSelectedQuery(q); setScreen("detail"); } }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.color, color: s.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{s.initials}</div>
                  <div className="flex-fill">
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{s.category}</div>
                  </div>
                  <RiskBadge risk={s.risk} />
                  <div style={{ fontSize: 12, color: "#6b7280", minWidth: 50, textAlign: "right" }}>{openQ} open</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-xl-5">
          {/* Heatmap */}
          <div className="bg-white rounded-3 border p-3 mb-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Risk Heatmap</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {HEATMAP.map((h, i) => (
                <div key={i} className={`heatmap-cell ${h.cls}`}>
                  <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 2 }}>{h.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{h.score}</div>
                </div>
              ))}
            </div>
            <div className="d-flex gap-3 mt-2">
              {[["#22c55e", "Low"], ["#f59e0b", "Medium"], ["#ef4444", "High"]].map(([c, l]) => (
                <div key={l} className="d-flex align-items-center gap-1" style={{ fontSize: 10, color: "#6b7280" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }}></div>{l}
                </div>
              ))}
            </div>
          </div>

          {/* Expiring certs */}
          <div className="bg-white rounded-3 border p-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Certificates Expiring Soon</div>
            {[
              { name: "Agri-Harvest · HACCP", days: "5 days", color: "#b91c1c" },
              { name: "ProMeat · BRC Grade A", days: "18 days", color: "#b45309" },
              { name: "MedGrain · ISO 22000", days: "27 days", color: "#b45309" },
            ].map(c => (
              <div key={c.name} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f3f9", fontSize: 12 }}>
                <span style={{ color: "#1a1a2e" }}>{c.name}</span>
                <span style={{ color: c.color, fontWeight: 600 }}>{c.days}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Query Tracker ────────────────────────────────────────────────────────────
const QueryTracker = ({ queries, setScreen, setSelectedQuery }) => {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Pending", "In Review", "Resolved", "Rejected", "Overdue >30d", "High Priority"];
  const filtered = queries.filter(q => {
    if (filter === "All") return true;
    if (filter === "Overdue >30d") return (q.status === "Pending" || q.status === "In Review") && q.raisedDays > 30;
    if (filter === "High Priority") return q.priority === "High";
    return q.status === filter;
  });

  return (
    <div className="p-4">
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`filter-chip border-0 ${filter === f ? "active" : ""}`}
            style={f === "Overdue >30d" && filter !== f ? { background: "#fee2e2", color: "#b91c1c", borderColor: "#ef4444" } : {}}
          >{f}</button>
        ))}
      </div>

      <div className="bg-white rounded-3 border" style={{ borderColor: "#e3e8ef" }}>
        {filtered.length === 0 && (
          <div className="text-center py-5" style={{ color: "#6b7280", fontSize: 13 }}>No queries match this filter.</div>
        )}
        {filtered.map(q => (
          <div key={q.id} className="query-row d-flex align-items-start gap-3 p-3 rounded"
            onClick={() => { setSelectedQuery(q); setScreen("detail"); }}>
            <PriorityBar priority={q.priority} />
            <div className="flex-fill">
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{q.subject}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{q.id} · {q.supplierName} · Raised {q.raisedDays}d ago · {q.raisedBy} · {q.type}</div>
            </div>
            <StatusPill status={q.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Raise Query ──────────────────────────────────────────────────────────────
const RaiseQuery = ({ queries, setQueries, setScreen }) => {
  const [form, setForm] = useState({ supplierId: "1", type: "Allergen Info", priority: "High", subject: "", message: "", dueDate: "" });
  const [saved, setSaved] = useState(false);

  const supplier = DEMO_SUPPLIERS.find(s => s.id === parseInt(form.supplierId));
  const supplierCerts = DEMO_CERTS[parseInt(form.supplierId)] || [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyTemplate = (key) => {
    const t = TEMPLATES[key];
    setForm(f => ({ ...f, subject: t.subject, type: t.type, message: t.message }));
  };

  const submit = () => {
    if (!form.subject.trim() || !form.message.trim()) { alert("Please fill in subject and message."); return; }
    const newQ = {
      id: "Q" + String(queries.length + 1).padStart(3, "0"),
      supplierId: parseInt(form.supplierId),
      supplierName: supplier.name,
      type: form.type,
      priority: form.priority,
      subject: form.subject,
      status: "Pending",
      raisedBy: "QA Test User",
      raisedDays: 0,
      messages: [{ from: "QA", text: form.message, daysAgo: 0 }],
      attachments: [],
    };
    const updated = [newQ, ...queries];
    setQueries(updated);
    saveState("sq_queries", updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); setScreen("queries"); }, 1200);
  };

  return (
    <div className="p-4">
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="bg-white rounded-3 border p-4" style={{ borderColor: "#e3e8ef" }}>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Supplier</label>
              <select className="form-select" style={{ fontSize: 13, borderColor: "#e3e8ef" }} value={form.supplierId} onChange={e => set("supplierId", e.target.value)}>
                {DEMO_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-7">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Query type</label>
                <select className="form-select" style={{ fontSize: 13, borderColor: "#e3e8ef" }} value={form.type} onChange={e => set("type", e.target.value)}>
                  {QUERY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Due date</label>
                <input type="date" className="form-control" style={{ fontSize: 13, borderColor: "#e3e8ef" }} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Priority</label>
              <div className="d-flex gap-2">
                {["High", "Med", "Low"].map(p => {
                  const sel = form.priority === p;
                  const style = sel
                    ? p === "High" ? { background: "#fee2e2", color: "#b91c1c", borderColor: "#ef4444" }
                      : p === "Med" ? { background: "#fef3c7", color: "#b45309", borderColor: "#f59e0b" }
                        : { background: "#dcfce7", color: "#166534", borderColor: "#22c55e" }
                    : { background: "#f9fafb", color: "#6b7280", borderColor: "#e3e8ef" };
                  return <button key={p} onClick={() => set("priority", p)} className="border flex-fill py-2 rounded" style={{ fontSize: 12, ...style, fontWeight: sel ? 600 : 400 }}>{p}</button>;
                })}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Subject</label>
              <input type="text" className="form-control" style={{ fontSize: 13, borderColor: "#e3e8ef" }} value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g. HACCP Certificate Renewal Required" />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Message to supplier</label>
              <textarea className="form-control" rows={4} style={{ fontSize: 13, borderColor: "#e3e8ef", resize: "none" }} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Describe the query..." />
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>Attach documents</label>
              <div className="d-flex align-items-center justify-content-center rounded" style={{ border: "1.5px dashed #c7d2e7", padding: 20, fontSize: 12, color: "#6b7280", cursor: "pointer", background: "#f9fafb" }}>
                <i className="bi bi-paperclip me-2" />Click to attach or drag files here
              </div>
            </div>
            {saved && <div className="alert alert-success py-2 mb-3" style={{ fontSize: 12 }}>Query submitted successfully! Redirecting…</div>}
            <button className="btn w-100 py-2" style={{ background: "#3b5bdb", color: "#fff", fontWeight: 500 }} onClick={submit}>
              <i className="bi bi-send me-2" />Submit Query
            </button>
          </div>
        </div>
        <div className="col-12 col-xl-5">
          <div className="bg-white rounded-3 border p-3 mb-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>Query Templates</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>Click to auto-fill the form</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries({ allergen: "Allergen info", haccp: "HACCP cert", audit: "Audit scheduling", nc: "NC follow-up", iso: "ISO 22000", brc: "BRC report" }).map(([k, label]) => (
                <button key={k} className="template-chip border-0 text-start" onClick={() => applyTemplate(k)}>{label}</button>
              ))}
            </div>
          </div>
          {supplier && (
            <div className="bg-white rounded-3 border p-3" style={{ borderColor: "#e3e8ef" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>{supplier.name} — Compliance</div>
              <div className="d-flex gap-2 mb-3">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: supplier.color, color: supplier.textColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{supplier.initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{supplier.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{supplier.category}</div>
                </div>
                <div className="ms-auto"><RiskBadge risk={supplier.risk} /></div>
              </div>
              {supplierCerts.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {supplierCerts.map(c => (
                    <div key={c.name} className="cert-card">
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a2e" }}>{c.name}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: c.status === "ok" ? "#166534" : c.status === "warn" ? "#b45309" : "#b91c1c" }}>
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: c.status === "ok" ? "#22c55e" : c.status === "warn" ? "#f59e0b" : "#ef4444", marginRight: 5 }} />
                        {c.expiry}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>No certificates on file.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Query Detail ─────────────────────────────────────────────────────────────
const QueryDetail = ({ query, queries, setQueries, setScreen }) => {
  const [msgText, setMsgText] = useState("");
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => setLocalQuery(query), [query]);

  const sendMsg = () => {
    if (!msgText.trim()) return;
    const updated = { ...localQuery, messages: [...localQuery.messages, { from: "QA", text: msgText, daysAgo: 0 }] };
    setLocalQuery(updated);
    setMsgText("");
    const newList = queries.map(q => q.id === updated.id ? updated : q);
    setQueries(newList);
    saveState("sq_queries", newList);
  };

  const changeStatus = (status) => {
    const updated = { ...localQuery, status };
    setLocalQuery(updated);
    const newList = queries.map(q => q.id === updated.id ? updated : q);
    setQueries(newList);
    saveState("sq_queries", newList);
  };

  const tl = [
    { label: "Query submitted", date: `${localQuery.raisedDays} days ago`, state: "done" },
    { label: "Acknowledged by supplier", date: localQuery.messages.length > 1 ? `${localQuery.messages[1].daysAgo} days ago` : "—", state: localQuery.messages.length > 1 ? "done" : "pending", note: localQuery.messages.length > 1 ? localQuery.messages[1].text : "" },
    { label: "Under review", date: "Documents received", state: localQuery.status === "In Review" || localQuery.status === "Resolved" || localQuery.status === "Rejected" ? "active" : "pending" },
    { label: "Awaiting final response", date: localQuery.raisedDays > 30 ? "Overdue" : localQuery.dueDate || "—", state: localQuery.status === "Resolved" || localQuery.status === "Rejected" ? "done" : "pending", warn: localQuery.raisedDays > 30 },
    { label: "Resolved / Rejected", date: localQuery.status === "Resolved" || localQuery.status === "Rejected" ? localQuery.status : "Pending", state: localQuery.status === "Resolved" ? "done" : localQuery.status === "Rejected" ? "done" : "pending" },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex align-items-start gap-3 mb-4 flex-wrap">
        <div className="flex-fill">
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>{localQuery.subject}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {localQuery.id} · Raised by {localQuery.raisedBy} · {localQuery.raisedDays} days ago · {localQuery.priority} Priority · {localQuery.type}
          </div>
        </div>
        <StatusPill status={localQuery.status} />
        <button className="btn btn-sm" style={{ fontSize: 12, borderColor: "#e3e8ef" }} onClick={() => changeStatus("Resolved")}>
          <i className="bi bi-check-circle me-1" />Mark Resolved
        </button>
        <button className="btn btn-sm" style={{ fontSize: 12, borderColor: "#ef4444", color: "#b91c1c" }} onClick={() => changeStatus("Rejected")}>
          <i className="bi bi-x-circle me-1" />Reject
        </button>
      </div>

      <div className="row g-3">
        {/* Conversation */}
        <div className="col-12 col-xl-7">
          <div className="bg-white rounded-3 border p-3 mb-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>Conversation</div>
            <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 340, overflowY: "auto" }}>
              {localQuery.messages.map((m, i) => (
                <div key={i} className={`d-flex ${m.from === "QA" ? "justify-content-end" : "justify-content-start"}`}>
                  <div>
                    <div className={m.from === "QA" ? "msg-bubble-out" : "msg-bubble-in"}>{m.text}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, textAlign: m.from === "QA" ? "right" : "left" }}>
                      {m.from === "QA" ? "QA Test User" : "Supplier Portal"} · {m.daysAgo === 0 ? "Just now" : `${m.daysAgo}d ago`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex gap-2">
              <input type="text" className="form-control" style={{ fontSize: 13, borderColor: "#e3e8ef" }} placeholder="Type a message to supplier…" value={msgText} onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()} />
              <button className="btn" style={{ background: "#3b5bdb", color: "#fff", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" }} onClick={sendMsg}>Send</button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          {/* Timeline */}
          <div className="bg-white rounded-3 border p-3 mb-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>Resolution Timeline</div>
            <div className="timeline">
              {tl.map((step, i) => (
                <div key={i} className="d-flex gap-2">
                  <div className="d-flex flex-column align-items-center" style={{ width: 20, flexShrink: 0 }}>
                    <div className="tl-dot" style={{ background: step.state === "done" ? "#22c55e" : step.state === "active" ? "#3b5bdb" : "#d1d5db" }} />
                    {i < tl.length - 1 && <div className="tl-line" />}
                  </div>
                  <div style={{ paddingBottom: i < tl.length - 1 ? 18 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: step.warn ? "#b45309" : "#9ca3af", marginTop: 2 }}>{step.date}{step.warn ? " — Overdue" : ""}</div>
                    {step.note && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 5, padding: "6px 10px", background: "#f1f3f9", borderRadius: 6 }}>{step.note.length > 80 ? step.note.slice(0, 80) + "…" : step.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-3 border p-3" style={{ borderColor: "#e3e8ef" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Attachments</div>
            {localQuery.attachments.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af" }}>No attachments yet.</div>}
            {localQuery.attachments.map((a, i) => (
              <div key={i} className="d-flex align-items-center gap-2 mb-2" style={{ border: "1px solid #e3e8ef", borderRadius: 8, padding: "8px 10px" }}>
                <div className="attach-icon">{a.endsWith(".pdf") ? "PDF" : "ZIP"}</div>
                <div className="flex-fill">
                  <div style={{ fontSize: 12, color: "#1a1a2e" }}>{a}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Uploaded · {localQuery.raisedDays - 2}d ago</div>
                </div>
              </div>
            ))}
            <button className="btn btn-sm w-100 mt-2" style={{ fontSize: 12, borderColor: "#e3e8ef", color: "#6b7280" }}>
              <i className="bi bi-paperclip me-1" />Attach document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
const App = () => {
  const [screen, setScreen] = useState("dashboard");
  const [queries, setQueries] = useState(() => loadState("sq_queries", DEMO_QUERIES));
  const [selectedQuery, setSelectedQuery] = useState(null);

  const topTitles = { dashboard: "Supplier Dashboard", queries: "Query Tracker", raise: "Raise New Query", detail: "Query Detail" };

  const handleSetScreen = (s) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar screen={screen} setScreen={handleSetScreen} queries={queries} />
      <div className="main-content flex-fill">
        <div className="topbar d-flex align-items-center gap-3">
          <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e", flex: 1 }}>{topTitles[screen]}</div>
          {(screen === "dashboard" || screen === "queries") && (
            <>
              <input className="form-control" style={{ maxWidth: 220, fontSize: 13, borderColor: "#e3e8ef" }} placeholder="Search…" />
              <button className="btn" style={{ background: "#3b5bdb", color: "#fff", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" }} onClick={() => handleSetScreen("raise")}>
                <i className="bi bi-plus me-1" />New Query
              </button>
            </>
          )}
          {screen === "detail" && (
            <button className="btn btn-sm" style={{ fontSize: 12, borderColor: "#e3e8ef" }} onClick={() => handleSetScreen("queries")}>
              <i className="bi bi-arrow-left me-1" />Back
            </button>
          )}
        </div>

        {screen === "dashboard" && <Dashboard queries={queries} setScreen={handleSetScreen} setSelectedQuery={setSelectedQuery} />}
        {screen === "queries" && <QueryTracker queries={queries} setScreen={handleSetScreen} setSelectedQuery={setSelectedQuery} />}
        {screen === "raise" && <RaiseQuery queries={queries} setQueries={setQueries} setScreen={handleSetScreen} />}
        {screen === "detail" && selectedQuery && <QueryDetail query={selectedQuery} queries={queries} setQueries={setQueries} setScreen={handleSetScreen} />}
        {screen === "detail" && !selectedQuery && (
          <div className="p-4 text-center" style={{ color: "#6b7280", fontSize: 13 }}>
            No query selected. <button className="btn btn-link p-0" style={{ fontSize: 13 }} onClick={() => handleSetScreen("queries")}>Go to Query Tracker</button>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
