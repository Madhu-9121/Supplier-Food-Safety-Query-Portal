import React, { useState } from 'react';
import { QueryRow } from './Dashboard';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'review', label: 'In Review' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'high', label: 'High Priority', style: { background: '#f8d7da', color: '#842029', border: '1px solid #f5c2c7' } },
];

export default function QueryTracker({ queries, onOpenQuery, onGoRaise }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = queries.filter(q => {
    const matchFilter = activeFilter === 'all' ? true
      : activeFilter === 'high' ? q.priority === 'high'
      : q.status === activeFilter;
    const matchSearch = !search || q.subject.toLowerCase().includes(search.toLowerCase()) || q.supplierName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #dee2e6', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>Query Tracker</div>
        <input className="form-control form-control-sm" placeholder="Search queries..." style={{ width: 220 }} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={onGoRaise}><i className="bi bi-plus me-1"></i>New Query</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid #dee2e6',
                background: activeFilter === f.id ? '#0d6efd' : (f.style?.background || '#fff'),
                color: activeFilter === f.id ? '#fff' : (f.style?.color || '#495057'),
                fontWeight: activeFilter === f.id ? 600 : 400,
                ...(activeFilter !== f.id && f.style ? f.style : {}),
              }}>
              {f.label} {f.id === 'all' ? `(${queries.length})` : `(${queries.filter(q => f.id === 'high' ? q.priority === 'high' : q.status === f.id).length})`}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: '0 20px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#6c757d', fontSize: 13 }}>No queries found.</div>
          )}
          {filtered.map(q => <QueryRow key={q.id} q={q} onClick={() => onOpenQuery(q.id)} />)}
        </div>
      </div>
    </div>
  );
}
