import React, { useState } from 'react';

const riskColor = { high: { bg: '#f8d7da', text: '#842029', label: 'High Risk' }, medium: { bg: '#fff3cd', text: '#664d03', label: 'Medium Risk' }, low: { bg: '#d1e7dd', text: '#0a3622', label: 'Low Risk' } };

const certDaysLeft = (expiry) => {
  const diff = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function Dashboard({ suppliers, queries, certs, onOpenQuery, onGoRaise }) {
  const [search, setSearch] = useState('');
  const open = queries.filter(q => q.status === 'pending' || q.status === 'review').length;
  const overdue = queries.filter(q => q.dueDate && new Date(q.dueDate) < new Date() && q.status !== 'resolved' && q.status !== 'rejected').length;
  const expiringCerts = certs.filter(c => c.status === 'expiring' || certDaysLeft(c.expiry) <= 30);
  const highRisk = suppliers.filter(s => s.risk === 'high').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #dee2e6', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>Supplier Dashboard</div>
        <input className="form-control form-control-sm" placeholder="Search suppliers..." style={{ width: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={onGoRaise}><i className="bi bi-plus me-1"></i>New Query</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Suppliers', val: suppliers.length, sub: `${suppliers.filter(s=>s.risk==='low').length} compliant`, subColor: '#198754' },
            { label: 'Open Queries', val: open, sub: `${overdue} overdue`, subColor: '#dc3545' },
            { label: 'Certs Expiring', val: expiringCerts.length, sub: 'within 30 days', subColor: '#dc3545' },
            { label: 'High Risk', val: highRisk, sub: 'require review', subColor: '#dc3545' },
          ].map(s => (
            <div className="col-3" key={s.label}>
              <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#212529' }}>{s.val}</div>
                <div style={{ fontSize: 11, marginTop: 4, color: s.subColor }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          {/* Supplier list */}
          <div className="col-7">
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Suppliers</div>
              {suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => {
                const supplierQueries = queries.filter(q => q.supplierId === s.id && (q.status === 'pending' || q.status === 'review'));
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => supplierQueries[0] && onOpenQuery(supplierQueries[0].id)}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.color, color: s.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{s.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#6c757d' }}>{s.category} · {s.country}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: riskColor[s.risk].bg, color: riskColor[s.risk].text, fontWeight: 500 }}>{riskColor[s.risk].label}</span>
                    <div style={{ fontSize: 12, color: '#6c757d', minWidth: 55, textAlign: 'right' }}>{supplierQueries.length > 0 ? `${supplierQueries.length} open` : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-5">
            {/* Risk heatmap */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Risk Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {suppliers.map(s => {
                  const colors = { high: { bg: '#f8d7da', text: '#842029' }, medium: { bg: '#fff3cd', text: '#664d03' }, low: { bg: '#d1e7dd', text: '#0a3622' } };
                  const scores = { high: (7 + Math.random() * 2).toFixed(1), medium: (4 + Math.random() * 2).toFixed(1), low: (1.5 + Math.random() * 1.5).toFixed(1) };
                  return (
                    <div key={s.id} style={{ background: colors[s.risk].bg, borderRadius: 8, padding: '8px 6px', textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: 10, fontWeight: 500, color: colors[s.risk].text }}>{s.initials}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors[s.risk].text }}>{scores[s.risk]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {[['#198754','Low'],['#ffc107','Med'],['#dc3545','High']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6c757d' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }}></div>{l}
                  </div>
                ))}
              </div>
            </div>

            {/* Expiring certs */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Certificates Expiring Soon</div>
              {expiringCerts.length === 0 && <div style={{ fontSize: 12, color: '#6c757d' }}>No certs expiring soon.</div>}
              {expiringCerts.map(c => {
                const days = certDaysLeft(c.expiry);
                const sup = suppliers.find(s => s.id === c.supplierId);
                return (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 10 }}>
                    <span style={{ color: '#212529' }}>{sup?.name} · {c.name}</span>
                    <span style={{ fontWeight: 600, color: days <= 7 ? '#dc3545' : '#856404' }}>{days <= 0 ? 'Expired' : `${days}d`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent queries */}
        <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: '16px 20px', marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Recent Queries</div>
          {queries.slice(0, 4).map(q => (
            <QueryRow key={q.id} q={q} onClick={() => onOpenQuery(q.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const statusStyle = { pending: { bg: '#fff3cd', text: '#664d03' }, review: { bg: '#cfe2ff', text: '#0a58ca' }, resolved: { bg: '#d1e7dd', text: '#0a3622' }, rejected: { bg: '#f8d7da', text: '#842029' } };
const priorityColor = { high: '#dc3545', medium: '#ffc107', low: '#198754' };
const statusLabel = { pending: 'Pending', review: 'In Review', resolved: 'Resolved', rejected: 'Rejected' };

export function QueryRow({ q, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
      <div style={{ width: 4, borderRadius: 4, background: priorityColor[q.priority], alignSelf: 'stretch', flexShrink: 0, minHeight: 40 }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#212529' }}>{q.subject}</div>
        <div style={{ fontSize: 11, color: '#6c757d', marginTop: 3 }}>{q.supplierName} · {q.raisedBy} · {q.type}</div>
      </div>
      <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: statusStyle[q.status]?.bg, color: statusStyle[q.status]?.text, fontWeight: 500, whiteSpace: 'nowrap' }}>{statusLabel[q.status]}</span>
    </div>
  );
}
