import React from "react";

const navItems = [
  { key: "dashboard", icon: "bi-grid-fill", label: "Dashboard" },
  { key: "queries", icon: "bi-list-task", label: "Query Tracker" },
  { key: "raise", icon: "bi-plus-circle-fill", label: "Raise Query" },
];

export default function Sidebar({ active, onNav, openCount }) {
  return (
    <div style={{
      width: 220, minWidth: 220, background: "#f8f9fa",
      borderRight: "1px solid #dee2e6", display: "flex",
      flexDirection: "column", height: "100vh", position: "sticky", top: 0
    }}>
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #dee2e6" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#212529" }}>
          SafeSupply
        </div>
        <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>Food Safety Portal</div>
      </div>

      <div style={{ padding: "10px 8px 0" }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: "#adb5bd", letterSpacing: "0.06em",
          textTransform: "uppercase", padding: "6px 10px 4px"
        }}>Main</div>

        {navItems.map(item => (
          <button key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", border: "none", borderRadius: 8, marginBottom: 2,
              background: active === item.key ? "#fff" : "transparent",
              color: active === item.key ? "#0d6efd" : "#495057",
              fontWeight: active === item.key ? 600 : 400, fontSize: 13,
              cursor: "pointer", transition: "all .15s", boxShadow: active === item.key ? "0 1px 3px rgba(0,0,0,.08)" : "none"
            }}
          >
            <i className={`bi ${item.icon}`} style={{ fontSize: 15 }}></i>
            <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
            {item.key === "queries" && openCount > 0 && (
              <span className="badge bg-danger" style={{ fontSize: 10 }}>{openCount}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: "1px solid #dee2e6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#cfe2ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "#0a58ca", flexShrink: 0
          }}>SM</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#212529" }}>QA Test User</div>
            <div style={{ fontSize: 11, color: "#6c757d" }}>QA Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
