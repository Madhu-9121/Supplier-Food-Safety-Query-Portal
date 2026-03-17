export const INITIAL_SUPPLIERS = [
  { id: 's1', name: 'Test Company 1 Ltd', category: 'Produce', country: 'UK', risk: 'high', initials: 'T1', color: '#cfe2ff', textColor: '#0a58ca' },
  { id: 's2', name: 'Test Company 2 Ltd', category: 'Dairy', country: 'India', risk: 'low', initials: 'T2', color: '#d1e7dd', textColor: '#0a3622' },
  { id: 's3', name: 'Test Company 3 Ltd', category: 'Grains', country: 'Germany', risk: 'medium', initials: 'T3', color: '#fff3cd', textColor: '#664d03' },
];

export const INITIAL_CERTS = [
  { id: 'c1', supplierId: 's1', name: 'HACCP', status: 'expiring', expiry: '2026-03-22' },
  { id: 'c2', supplierId: 's1', name: 'BRC Grade A', status: 'valid', expiry: '2026-08-10' },
  { id: 'c3', supplierId: 's1', name: 'ISO 22000', status: 'valid', expiry: '2026-12-01' },
  { id: 'c4', supplierId: 's1', name: 'Allergen Declaration', status: 'warning', expiry: '2026-04-15' },
  { id: 'c5', supplierId: 's2', name: 'HACCP', status: 'valid', expiry: '2027-01-20' },
  { id: 'c6', supplierId: 's2', name: 'ISO 22000', status: 'valid', expiry: '2027-03-01' },
  { id: 'c7', supplierId: 's3', name: 'ISO 22000', status: 'expiring', expiry: '2026-04-13' },
  { id: 'c8', supplierId: 's6', name: 'BRC Grade A', status: 'expiring', expiry: '2026-04-04' },
];



export const QUERY_TYPES = ['Allergen', 'HACCP', 'Certificate', 'Non-Conformance', 'Audit', 'Other'];
export const TEMPLATES = {
  allergen: { subject: 'Allergen Declaration Update Required', message: 'Please provide an updated allergen declaration for your products as required under our food safety policy.' },
  haccp: { subject: 'HACCP Certificate Renewal Required', message: 'Your HACCP certificate is due for renewal. Please submit the updated certificate at your earliest convenience.' },
  audit: { subject: 'Annual Supplier Audit Scheduling', message: 'We would like to schedule the annual food safety audit. Please confirm your availability for the proposed dates.' },
  nc: { subject: 'Non-Conformance Follow-Up', message: 'A non-conformance was identified in your recent delivery. Please provide a CAPA report within 7 days.' },
  iso: { subject: 'ISO 22000 Renewal Confirmation', message: 'Please confirm whether your ISO 22000 certification has been renewed and provide the updated certificate.' },
  brc: { subject: 'BRC Audit Report Submission Required', message: 'Please submit your latest BRC audit report as part of our supplier compliance review.' },
};
export const INITIAL_QUERIES = [
  {
    id: 'q1', supplierId: 's1', supplierName: 'Test Company 1 Ltd',
    type: 'Certificate', subject: 'HACCP Renewal Required',
    priority: 'high', status: 'pending',
    raisedBy: 'QA Test User', raisedDate: '2026-02-07',
    dueDate: '2026-02-28',
    messages: [
      { id: 'm1', sender: 'QA Test User', direction: 'out', text: 'Please provide your updated HACCP certificate. Current one expires in 5 days. This is urgent.', date: '2026-02-07' },
      { id: 'm2', sender: 'Test Company 1 Ltd', direction: 'in', text: 'Hi Test User, we are in the process of renewal. Auditor visit scheduled next week.', date: '2026-02-10' },
      { id: 'm3', sender: 'QA Test User', direction: 'out', text: 'Noted. Please submit within 7 days or supply may be suspended per policy.', date: '2026-02-10' },
      { id: 'm4', sender: 'Test Company 1 Ltd', direction: 'in', text: 'Understood. Attaching interim audit report as evidence of renewal in progress.', date: '2026-02-15' },
    ],
    attachments: [
      { name: 'interim-audit-report.pdf', uploadedBy: 'Agri-Harvest', date: '2026-02-15' },
      { name: 'haccp-current-cert.pdf', uploadedBy: 'QA Team', date: '2026-02-07' },
    ],
    timeline: [
      { step: 'Query submitted', date: '2026-02-07', done: true, note: '' },
      { step: 'Acknowledged by supplier', date: '2026-02-10', done: true, note: 'Auditor visit scheduled' },
      { step: 'Under review', date: '2026-02-15', active: true, note: 'Interim docs received' },
      { step: 'Awaiting final certificate', date: '', done: false, warning: 'Overdue · 8 days past SLA' },
      { step: 'Resolved / Rejected', date: '', done: false },
    ]
  }
];