import React, { useState } from 'react';

const statusStyle = { pending: { bg: '#fff3cd', text: '#664d03' }, review: { bg: '#cfe2ff', text: '#0a58ca' }, resolved: { bg: '#d1e7dd', text: '#0a3622' }, rejected: { bg: '#f8d7da', text: '#842029' } };
const statusLabel = { pending: 'Pending', review: 'In Review', resolved: 'Resolved', rejected: 'Rejected' };
const priorityColor = { high: '#dc3545', medium: '#ffc107', low: '#198754' };

export default function QueryDetail({ query, onUpdate, onBack }) {
  const [newMsg, setNewMsg] = useState('');

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const updated = {
      ...query,
      messages: [...query.messages, { id: 'm' + Date.now(), sender: 'QA Test User', direction: 'out', text: newMsg, date: new Date().toISOString().split('T')[0] }]
    };
    onUpdate(updated);
    setNewMsg('');
  };

  const setStatus = (status) => {
    const today = new Date().toISOString().split('T')[0];
    let timeline = query.timeline;
    if (status === 'resolved') {
      timeline = query.timeline.map((t, i, arr) => {
        const isLast = i === arr.length - 1;
        return { ...t, done: true, active: false, isRejected: false, date: t.date || (isLast ? today : '') };
      });
    } else if (status === 'rejected') {
      timeline = query.timeline.map((t, i, arr) => {
        const isLast = i === arr.length - 1;
        return { ...t, done: !isLast, active: false, isRejected: isLast, date: t.date || (isLast ? today : '') };
      });
    }
    onUpdate({ ...query, status, timeline });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #dee2e6', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}><i className="bi bi-arrow-left me-1"></i>Back</button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, marginLeft: 4 }}>{query.subject}</div>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: statusStyle[query.status]?.bg, color: statusStyle[query.status]?.text, fontWeight: 500 }}>{statusLabel[query.status]}</span>
        {query.status !== 'resolved' && <button className="btn btn-success btn-sm" onClick={() => setStatus('resolved')}><i className="bi bi-check me-1"></i>Mark Resolved</button>}
        {query.status !== 'rejected' && query.status !== 'resolved' && <button className="btn btn-outline-danger btn-sm" onClick={() => setStatus('rejected')}>Reject</button>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 12, color: '#6c757d', flexWrap: 'wrap' }}>
          <span><i className="bi bi-building me-1"></i>{query.supplierName}</span>
          <span><i className="bi bi-person me-1"></i>{query.raisedBy}</span>
          <span><i className="bi bi-calendar me-1"></i>Raised {query.raisedDate}</span>
          <span><i className="bi bi-clock me-1"></i>Due {query.dueDate || 'N/A'}</span>
          <span><i className="bi bi-tag me-1"></i>{query.type}</span>
          <span>
            <i className="bi bi-flag me-1" style={{ color: priorityColor[query.priority] }}></i>
            <span style={{ color: priorityColor[query.priority], fontWeight: 500, textTransform: 'capitalize' }}>{query.priority} priority</span>
          </span>
        </div>

        <div className="row g-3">
          {/* Left: conversation */}
          <div className="col-7">
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Conversation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                {query.messages.map(m => (
                  <div key={m.id} style={{ maxWidth: '75%', alignSelf: m.direction === 'out' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                      background: m.direction === 'out' ? '#0d6efd' : '#f8f9fa',
                      color: m.direction === 'out' ? '#fff' : '#212529',
                      border: m.direction === 'in' ? '1px solid #dee2e6' : 'none',
                    }}>{m.text}</div>
                    <div style={{ fontSize: 11, color: '#6c757d', marginTop: 3, textAlign: m.direction === 'out' ? 'right' : 'left' }}>{m.sender} · {m.date}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control form-control-sm" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message to supplier..." />
                <button className="btn btn-primary btn-sm" onClick={sendMessage}><i className="bi bi-send"></i></button>
              </div>
            </div>

            {/* Attachments */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Attachments</div>
              {query.attachments.length === 0 && <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 8 }}>No attachments yet.</div>}
              {query.attachments.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid #dee2e6', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#cfe2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#0a58ca', flexShrink: 0 }}>PDF</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#212529', fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#6c757d' }}>Uploaded by {a.uploadedBy} · {a.date}</div>
                  </div>
                  <i className="bi bi-download" style={{ color: '#6c757d', cursor: 'pointer', fontSize: 14 }}></i>
                </div>
              ))}
              <button className="btn btn-outline-secondary btn-sm w-100 mt-1"><i className="bi bi-paperclip me-1"></i>Attach document</button>
            </div>
          </div>

          {/* Right: timeline */}
          <div className="col-5">
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Resolution timeline</div>
              <div>
                {query.timeline.map((t, i) => {
                  const dotColor = t.isRejected ? '#dc3545' : t.done ? '#198754' : t.active ? '#0d6efd' : '#dee2e6';
                  const isLast = i === query.timeline.length - 1;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: dotColor, marginTop: 3, flexShrink: 0, boxShadow: t.active ? `0 0 0 3px #cfe2ff` : 'none' }}></div>
                        {!isLast && <div style={{ flex: 1, width: 1, background: '#dee2e6', margin: '4px 0' }}></div>}
                      </div>
                      <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: t.active ? 600 : 400, color: '#212529' }}>{t.step}</div>
                        {t.date && <div style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>{t.date}</div>}
                        {t.warning && <div style={{ fontSize: 11, color: '#856404', marginTop: 2 }}>{t.warning}</div>}
                        {t.note && <div style={{ fontSize: 12, color: '#495057', marginTop: 5, padding: '7px 10px', background: '#f8f9fa', borderRadius: 6 }}>{t.note}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
