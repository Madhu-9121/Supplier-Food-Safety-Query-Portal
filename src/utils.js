export const STATUS_CONFIG = {
  pending:     { label: "Pending",    badge: "bg-warning text-dark" },
  "in-review": { label: "In Review", badge: "bg-primary text-white" },
  resolved:    { label: "Resolved",  badge: "bg-success text-white" },
  rejected:    { label: "Rejected",  badge: "bg-danger text-white" }
};

export const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "#dc3545", badgeCls: "bg-danger" },
  medium: { label: "Medium", color: "#fd7e14", badgeCls: "bg-warning text-dark" },
  low:    { label: "Low",    color: "#198754", badgeCls: "bg-success" }
};

export const CERT_STATUS_CONFIG = {
  valid:         { icon: "bi-check-circle-fill", color: "#198754", label: "Valid" },
  expiring:      { icon: "bi-exclamation-triangle-fill", color: "#fd7e14", label: "Expiring" },
  "needs-update":{ icon: "bi-x-circle-fill", color: "#dc3545", label: "Needs Update" },
  expired:       { icon: "bi-x-circle-fill", color: "#dc3545", label: "Expired" }
};

export const RISK_CONFIG = {
  low:    { badge: "bg-success", label: "Low Risk" },
  medium: { badge: "bg-warning text-dark", label: "Medium Risk" },
  high:   { badge: "bg-danger", label: "High Risk" }
};

export const QUERY_TYPES = [
  "Allergen Info", "HACCP / Certificate", "Non-Conformance",
  "Audit", "ISO 22000", "BRC Report", "Other"
];

export const QUERY_TEMPLATES = [
  { label: "Allergen info request", type: "Allergen Info",
    subject: "Allergen Declaration Update Required",
    body: "Please provide your updated allergen declaration document. Ensure all 14 major allergens are listed per EU Regulation 1169/2011." },
  { label: "HACCP cert renewal", type: "HACCP / Certificate",
    subject: "HACCP Certificate Renewal Required",
    body: "Your current HACCP certificate is due to expire. Please submit the renewed certificate at your earliest convenience to avoid supply disruption." },
  { label: "Audit scheduling", type: "Audit",
    subject: "Annual Supplier Audit Scheduling",
    body: "We would like to schedule the annual on-site food safety audit. Please provide your availability for the coming month." },
  { label: "NC follow-up", type: "Non-Conformance",
    subject: "Non-Conformance Corrective Action Required",
    body: "A non-conformance has been identified in a recent delivery. Please provide a corrective and preventive action (CAPA) plan within 5 business days." },
  { label: "ISO 22000 update", type: "ISO 22000",
    subject: "ISO 22000 Renewal Confirmation",
    body: "Please confirm the renewal status of your ISO 22000 certification and upload the new certificate once available." },
  { label: "BRC report request", type: "BRC Report",
    subject: "BRC Audit Report Submission",
    body: "Please submit your most recent BRC audit report, including grade achieved and any corrective actions raised." }
];

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysAgo(iso) {
  if (!iso) return null;
  const diff = new Date() - new Date(iso);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export const AVATAR_COLORS = [
  ["#cfe2ff","#0a58ca"], ["#d1e7dd","#0a3622"], ["#fff3cd","#664d03"],
  ["#f8d7da","#58151c"], ["#e2d9f3","#432874"], ["#d2f4ea","#0a3622"]
];

export function avatarColor(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function genId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}
