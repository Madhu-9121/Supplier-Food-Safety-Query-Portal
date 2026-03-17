import React, { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { INITIAL_SUPPLIERS, INITIAL_QUERIES, INITIAL_CERTS } from './data';
import Dashboard from './components/Dashboard';
import QueryTracker from './components/QueryTracker';
import RaiseQuery from './components/RaiseQuery';
import QueryDetail from './components/QueryDetail';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
  { id: 'queries', label: 'Query Tracker', icon: 'bi-list-ul' },
  { id: 'raise', label: 'Raise Query', icon: 'bi-plus-circle' },
];

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [suppliers] = useLocalStorage('ss_suppliers', INITIAL_SUPPLIERS);
  const [queries, setQueries] = useLocalStorage('ss_queries', INITIAL_QUERIES);
  const [certs] = useLocalStorage('ss_certs', INITIAL_CERTS);

  const openQuery = (id) => { setSelectedQueryId(id); setScreen('detail'); };
  const goRaise = () => setScreen('raise');

  const openCount = queries.filter(q => q.status === 'pending' || q.status === 'review').length;

  const addQuery = (q) => {
    setQueries(prev => [q, ...prev]);
    setSelectedQueryId(q.id);
    setScreen('detail');
  };

  const updateQuery = (updated) => {
    setQueries(prev => prev.map(q => q.id === updated.id ? updated : q));
  };

  const selectedQuery = queries.find(q => q.id === selectedQueryId);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{ width: 230, background: '#fff', borderRight: '1px solid #dee2e6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #dee2e6' }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#212529' }}>
            <i className="bi bi-shield-check me-2 text-success"></i>SafeSupply
          </div>
          <div style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>Food Safety Portal</div>
        </div>

        <nav style={{ padding: '10px 8px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#adb5bd', padding: '8px 8px 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Main</div>
          {NAV.map(n => (
            <div
              key={n.id}
              onClick={() => setScreen(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, marginBottom: 2, cursor: 'pointer', fontSize: 13,
                background: screen === n.id ? '#e7f1ff' : 'transparent',
                color: screen === n.id ? '#0d6efd' : '#495057',
                fontWeight: screen === n.id ? 600 : 400,
              }}
            >
              <i className={`bi ${n.icon}`} style={{ fontSize: 15 }}></i>
              {n.label}
              {n.id === 'queries' && openCount > 0 && (
                <span className="badge bg-danger ms-auto" style={{ fontSize: 10 }}>{openCount}</span>
              )}
            </div>
          ))}
          {selectedQuery && (
            <div
              onClick={() => setScreen('detail')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, marginBottom: 2, cursor: 'pointer', fontSize: 13,
                background: screen === 'detail' ? '#e7f1ff' : 'transparent',
                color: screen === 'detail' ? '#0d6efd' : '#495057',
                fontWeight: screen === 'detail' ? 600 : 400,
              }}
            >
              <i className="bi bi-file-text" style={{ fontSize: 15 }}></i>
              Query Detail
            </div>
          )}

          {/* <div style={{ fontSize: 10, fontWeight: 600, color: '#adb5bd', padding: '12px 8px 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Stats</div>
          <div style={{ padding: '6px 12px' }}>
            <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 4 }}>
              <span style={{ color: '#198754', fontWeight: 600 }}>{queries.filter(q=>q.status==='resolved').length}</span> resolved this month
            </div>
            <div style={{ fontSize: 12, color: '#6c757d' }}>
              <span style={{ color: '#dc3545', fontWeight: 600 }}>{queries.filter(q=>q.priority==='high'&&q.status!=='resolved').length}</span> high priority open
            </div>
          </div> */}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #dee2e6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#cfe2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#0a58ca' }}>SM</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#212529' }}>QA Test User</div>
            <div style={{ fontSize: 11, color: '#6c757d' }}>QA Manager</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'dashboard' && <Dashboard suppliers={suppliers} queries={queries} certs={certs} onOpenQuery={openQuery} onGoRaise={goRaise} />}
        {screen === 'queries' && <QueryTracker queries={queries} onOpenQuery={openQuery} onGoRaise={goRaise} />}
        {screen === 'raise' && <RaiseQuery suppliers={suppliers} certs={certs} onSubmit={addQuery} />}
        {screen === 'detail' && selectedQuery && <QueryDetail query={selectedQuery} onUpdate={updateQuery} onBack={() => setScreen('queries')} />}
        {screen === 'detail' && !selectedQuery && (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
            <div className="text-center"><i className="bi bi-file-text display-4 mb-3 d-block"></i>No query selected.<br />
              <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => setScreen('queries')}>View all queries</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
