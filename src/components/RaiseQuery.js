import React, { useState } from 'react';
import { QUERY_TYPES, TEMPLATES } from '../data';

const certStatus = { valid: { color: '#198754', dot: '#198754' }, expiring: { color: '#dc3545', dot: '#dc3545' }, warning: { color: '#856404', dot: '#ffc107' } };

export default function RaiseQuery({ suppliers, certs, onSubmit }) {
  const [form, setForm] = useState({ supplierId: suppliers[0]?.id || '', type: 'Certificate', priority: 'high', subject: '', message: '', dueDate: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyTemplate = (key) => {
    const t = TEMPLATES[key];
    if (t) set('subject', t.subject) || setForm(f => ({ ...f, subject: t.subject, message: t.message }));
  };

  const supplierCerts = certs.filter(c => c.supplierId === form.supplierId);
  const selectedSupplier = suppliers.find(s => s.id === form.supplierId);

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newQuery = {
      id: 'q' + Date.now(),
      supplierId: form.supplierId,
      supplierName: selectedSupplier?.name || '',
      type: form.type,
      subject: form.subject,
      priority: form.priority,
      status: 'pending',
      raisedBy: 'QA Test User',
      raisedDate: new Date().toISOString().split('T')[0],
      dueDate: form.dueDate,
      messages: [{ id: 'm1', sender: 'QA Test User', direction: 'out', text: form.message, date: new Date().toISOString().split('T')[0] }],
      attachments: [],
      timeline: [
        { step: 'Query submitted', date: new Date().toISOString().split('T')[0], done: true },
        { step: 'Awaiting acknowledgement', active: true },
        { step: 'Resolved / Rejected', done: false },
      ]
    };
    onSubmit(newQuery);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #dee2e6', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>Raise New Query</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div className="row g-3">
          <div className="col-7">
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 20 }}>
              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Supplier</label>
                <select className="form-select form-select-sm" value={form.supplierId} onChange={e => set('supplierId', e.target.value)}>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Query type</label>
                  <select className="form-select form-select-sm" value={form.type} onChange={e => set('type', e.target.value)}>
                    {QUERY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Due date</label>
                  <input type="date" className={`form-control form-control-sm ${errors.dueDate ? 'is-invalid' : ''}`} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                  {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['high', 'medium', 'low'].map(p => {
                    const colors = { high: { sel: '#f8d7da', text: '#842029', border: '#f5c2c7' }, medium: { sel: '#fff3cd', text: '#664d03', border: '#ffe69c' }, low: { sel: '#d1e7dd', text: '#0a3622', border: '#a3cfbb' } };
                    const isActive = form.priority === p;
                    return (
                      <button key={p} onClick={() => set('priority', p)} style={{
                        flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                        background: isActive ? colors[p].sel : '#fff',
                        color: isActive ? colors[p].text : '#6c757d',
                        border: isActive ? `1px solid ${colors[p].border}` : '1px solid #dee2e6',
                        fontWeight: isActive ? 600 : 400,
                      }}>{p}</button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Subject</label>
                <input type="text" className={`form-control form-control-sm ${errors.subject ? 'is-invalid' : ''}`} value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Query subject..." />
                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Message to supplier</label>
                <textarea className={`form-control form-control-sm ${errors.message ? 'is-invalid' : ''}`} rows={4} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Write your message..." style={{ resize: 'none' }} />
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 500, color: '#6c757d', marginBottom: 5, display: 'block' }}>Attach documents</label>
                <div style={{ border: '1px dashed #dee2e6', borderRadius: 8, padding: '16px', textAlign: 'center', fontSize: 12, color: '#6c757d', cursor: 'pointer' }}>
                  <i className="bi bi-paperclip me-1"></i>Click to attach or drag files here
                </div>
              </div>

              <button className="btn btn-primary w-100" onClick={handleSubmit}>
                <i className="bi bi-send me-1"></i>Submit Query
              </button>
            </div>
          </div>

          <div className="col-5">
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Query templates</div>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 10 }}>Click to auto-fill the form</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries({ allergen: 'Allergen info', haccp: 'HACCP cert', audit: 'Audit scheduling', nc: 'NC follow-up', iso: 'ISO 22000', brc: 'BRC report' }).map(([k, label]) => (
                  <button key={k} onClick={() => applyTemplate(k)} style={{ padding: '8px 10px', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#495057', background: '#f8f9fa', textAlign: 'left', transition: 'all .15s' }}
                    onMouseEnter={e => { e.target.style.borderColor = '#0d6efd'; e.target.style.color = '#0d6efd'; e.target.style.background = '#e7f1ff'; }}
                    onMouseLeave={e => { e.target.style.borderColor = '#dee2e6'; e.target.style.color = '#495057'; e.target.style.background = '#f8f9fa'; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {selectedSupplier && (
              <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{selectedSupplier.name} – Compliance</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {supplierCerts.length === 0 && <div style={{ fontSize: 12, color: '#6c757d', gridColumn: '1/-1' }}>No certificates on record.</div>}
                  {supplierCerts.map(c => (
                    <div key={c.id} style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#212529' }}>{c.name}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: certStatus[c.status]?.color || '#6c757d' }}>
                        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: certStatus[c.status]?.dot, marginRight: 5 }}></span>
                        {c.status === 'valid' ? `Valid · ${c.expiry}` : c.status === 'expiring' ? `Expiring ${c.expiry}` : 'Needs update'}
                      </div>
                    </div>
                  ))}
                </div>
                {['high', 'medium'].includes(selectedSupplier.risk) && (
                  <div style={{ background: '#f8d7da', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#842029' }}>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {selectedSupplier.risk === 'high' ? 'High risk supplier – review all compliance docs before raising.' : 'Medium risk supplier – ensure due dates are realistic.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
