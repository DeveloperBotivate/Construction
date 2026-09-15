import type {
  User, Project, Site, BOQItem, Drawing, Material, Vendor, Subcontractor, Client, Contract,
  MaterialIndent, Enquiry, VendorQuotation, PurchaseOrder, Dispatch, GRN, StockLedgerEntry,
  StoreIssue, StoreReturn, StockAudit, WorkOrder, Measurement, SubcontractorBill, RABill,
  VendorBill, Freight, DebitNote, Payment, AppDocument, Subscription, Loan, LoanInstallment,
  DailyReport, AttendanceRecord, EquipmentLog, SiteIssue, ChecklistTemplate, ChecklistInstance,
  Delegation, AuditEntry, AppNotification, ApprovalStep,
} from '../types'

// Fixed "today" reference for deterministic demo dates relative to 2026-09-15
const D = (offsetDays: number): string => {
  const d = new Date('2026-09-15T09:00:00.000Z')
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString()
}

function step(role: ApprovalStep['approverRole'], name: string, action: ApprovalStep['action'], daysAgo: number, comment?: string): ApprovalStep {
  return { id: `st-${Math.random().toString(36).slice(2, 8)}`, approverRole: role, approverName: name, action, comment, timestamp: D(-daysAgo) }
}

// ---------------------------------------------------------------------------
// Users (org chart)
// ---------------------------------------------------------------------------
export const USERS: User[] = [
  { id: 'user-md', employeeId: 'MD001', name: 'Rajesh Agarwal', email: 'md@constructionerp.demo', password: 'MD@123', role: 'MD', phone: '+91 98230 11001', designation: 'Managing Director', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-pm', employeeId: 'PM001', name: 'Suresh Nair', email: 'pm@constructionerp.demo', password: 'PM@123', role: 'PM', reportsTo: 'user-md', designation: 'HQ Project Manager', phone: '+91 98230 11002', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-acc', employeeId: 'ACC001', name: 'Priya Menon', email: 'accounts@constructionerp.demo', password: 'ACC@123', role: 'ACCOUNTS', reportsTo: 'user-md', designation: 'HQ Accounts Manager', phone: '+91 98230 11003', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-bill', employeeId: 'BILL001', name: 'Anita Rao', email: 'billing@constructionerp.demo', password: 'BILL@123', role: 'BILLING', reportsTo: 'user-pm', designation: 'HQ Billing & Liaison Engineer', phone: '+91 98230 11004', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-proc', employeeId: 'PROC001', name: 'Vikram Singh', email: 'procurement@constructionerp.demo', password: 'PROC@123', role: 'PROCUREMENT', reportsTo: 'user-pm', designation: 'HQ Procurement Executive', phone: '+91 98230 11005', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-pe', employeeId: 'PE001', name: 'Arjun Verma', email: 'pe@constructionerp.demo', password: 'PE@123', role: 'PE', reportsTo: 'user-pm', designation: 'Site Project Engineer', phone: '+91 98230 11006', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-store', employeeId: 'STORE001', name: 'Deepak Chauhan', email: 'store@constructionerp.demo', password: 'STORE@123', role: 'STORE', reportsTo: 'user-pe', designation: 'Site Supervisor / Store Keeper', phone: '+91 98230 11007', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
  { id: 'user-vendor', employeeId: 'VENDOR001', name: 'Ramesh Gupta', email: 'vendor@constructionerp.demo', password: 'VENDOR@123', role: 'VENDOR', designation: 'Vendor - Shree Cement Supplier', phone: '+91 98230 11008', projectIds: ['proj-001'], siteIds: [], active: true },
  { id: 'user-sub', employeeId: 'SUB001', name: 'Manoj Tiwari', email: 'subcontractor@constructionerp.demo', password: 'SUB@123', role: 'SUBCONTRACTOR', designation: 'Subcontractor - ABC Civil Works', phone: '+91 98230 11009', projectIds: ['proj-001'], siteIds: ['site-001'], active: true },
]

// ---------------------------------------------------------------------------
// Masters
// ---------------------------------------------------------------------------
export const MATERIALS: Material[] = [
  { id: 'mat-cement', code: 'MAT-CEM', name: 'Cement (OPC 53 Grade)', unit: 'Bags', category: 'Civil', reorderLevel: 500 },
  { id: 'mat-steel', code: 'MAT-STL', name: 'Reinforcement Steel (TMT)', unit: 'MT', category: 'Civil', reorderLevel: 10 },
  { id: 'mat-sand', code: 'MAT-SND', name: 'River Sand', unit: 'm3', category: 'Civil', reorderLevel: 50 },
  { id: 'mat-aggregate', code: 'MAT-AGG', name: 'Coarse Aggregate 20mm', unit: 'm3', category: 'Civil', reorderLevel: 80 },
  { id: 'mat-bricks', code: 'MAT-BRK', name: 'Fly Ash Bricks', unit: 'Nos', category: 'Civil', reorderLevel: 5000 },
  { id: 'mat-cable', code: 'MAT-CBL', name: 'Electrical Cable (XLPE)', unit: 'Mtr', category: 'Electrical', reorderLevel: 200 },
  { id: 'mat-pvc', code: 'MAT-PVC', name: 'PVC Pipe 4 inch', unit: 'Nos', category: 'Plumbing', reorderLevel: 50 },
  { id: 'mat-tiles', code: 'MAT-TIL', name: 'Vitrified Tiles', unit: 'Box', category: 'Finishing', reorderLevel: 100 },
  { id: 'mat-paint', code: 'MAT-PNT', name: 'Exterior Emulsion Paint', unit: 'Litre', category: 'Finishing', reorderLevel: 100 },
  { id: 'mat-hardware', code: 'MAT-HW', name: 'Hardware & Fasteners', unit: 'Lot', category: 'General', reorderLevel: 20 },
]

export const VENDORS: Vendor[] = [
  { id: 'ven-abc-steel', name: 'ABC Steel Traders', category: 'Steel & Reinforcement', contactPerson: 'Naresh Kumar', phone: '+91 90000 10001', email: 'sales@abcsteel.demo', gstin: '22ABCST1234A1Z5', rating: 4.2, status: 'ACTIVE' },
  { id: 'ven-shree-cement', name: 'Shree Cement Supplier', category: 'Cement & Building Material', contactPerson: 'Ramesh Gupta', phone: '+91 90000 10002', email: 'orders@shreecement.demo', gstin: '22SHREE5678B1Z2', rating: 4.5, status: 'ACTIVE' },
  { id: 'ven-buildmart', name: 'BuildMart Materials', category: 'General Building Materials', contactPerson: 'Sunil Joshi', phone: '+91 90000 10003', email: 'contact@buildmart.demo', gstin: '22BUILD9012C1Z8', rating: 3.9, status: 'ACTIVE' },
  { id: 'ven-national-elec', name: 'National Electricals', category: 'Electrical Supplies', phone: '+91 90000 10004', email: 'sales@nationalelec.demo', contactPerson: 'Farhan Sheikh', gstin: '22NATEL3456D1Z1', rating: 4.0, status: 'ACTIVE' },
]

export const SUBCONTRACTORS: Subcontractor[] = [
  { id: 'sub-abc-civil', name: 'ABC Civil Works', trade: 'Civil & Structural', contactPerson: 'Manoj Tiwari', phone: '+91 91000 20001', email: 'manoj@abccivil.demo', status: 'ACTIVE' },
  { id: 'sub-shree-elec', name: 'Shree Electrical Contractors', trade: 'Electrical', contactPerson: 'Kishore Patil', phone: '+91 91000 20002', email: 'kishore@shreeelectrical.demo', status: 'ACTIVE' },
  { id: 'sub-modern-plumb', name: 'Modern Plumbing Works', trade: 'Plumbing & Fire Fighting', contactPerson: 'Iqbal Ahmed', phone: '+91 91000 20003', email: 'iqbal@modernplumbing.demo', status: 'ACTIVE' },
]

export const CLIENTS: Client[] = [
  { id: 'client-skyline', name: 'Skyline Developers Pvt Ltd', contactPerson: 'Mr. Ashok Bansal', phone: '+91 99000 30001', email: 'ashok@skylinedevelopers.demo', address: 'Fafadih, Raipur, Chhattisgarh' },
]

export const CONTRACTS: Contract[] = [
  { id: 'contract-001', clientId: 'client-skyline', projectId: 'proj-001', contractNumber: 'CNT-SKY-2026-001', value: 50000000, startDate: D(-198), retentionPct: 5 },
]

// ---------------------------------------------------------------------------
// Project / Site / BOQ / Drawings
// ---------------------------------------------------------------------------
export const PROJECTS: Project[] = [
  {
    id: 'proj-001', code: 'PRJ-001', name: 'ABC Commercial Complex', client: 'Skyline Developers Pvt Ltd',
    contractValue: 50000000, budget: 47000000, actualCost: 12550000, startDate: D(-198), endDate: D(365),
    status: 'ACTIVE', progressPct: 24, pmId: 'user-pm', location: 'Raipur, Chhattisgarh',
    description: 'G+8 commercial complex with retail podium, office floors, and rooftop amenities.',
  },
]

export const SITES: Site[] = [
  { id: 'site-001', projectId: 'proj-001', name: 'Raipur Main Site', code: 'SITE-RPR-01', address: 'Plot 45, Fafadih Industrial Area, Raipur', geoLocation: '21.2514 N, 81.6296 E', peId: 'user-pe', storeKeeperId: 'user-store', status: 'ACTIVE' },
]

export const BOQ_ITEMS: BOQItem[] = [
  { id: 'boq-001', boqNumber: 'BOQ-001', projectId: 'proj-001', section: 'Civil - Structure', itemCode: 'CIV-001', description: 'Concrete M25 (RCC Foundation, Columns, Slabs)', unit: 'm3', contractQty: 1000, rate: 6200, contractAmount: 6200000, revisedQty: 1000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-002', boqNumber: 'BOQ-002', projectId: 'proj-001', section: 'Civil - Structure', itemCode: 'CIV-002', description: 'Reinforcement Steel (TMT Fe 500)', unit: 'MT', contractQty: 150, rate: 68000, contractAmount: 10200000, revisedQty: 150, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-003', boqNumber: 'BOQ-003', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-003', description: 'Cement (OPC 53 Grade)', unit: 'Bags', contractQty: 10000, rate: 380, contractAmount: 3800000, revisedQty: 10000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-004', boqNumber: 'BOQ-004', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-004', description: 'River Sand', unit: 'm3', contractQty: 800, rate: 1800, contractAmount: 1440000, revisedQty: 800, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-005', boqNumber: 'BOQ-005', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-005', description: 'Coarse Aggregate 20mm', unit: 'm3', contractQty: 1200, rate: 1600, contractAmount: 1920000, revisedQty: 1200, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-006', boqNumber: 'BOQ-006', projectId: 'proj-001', section: 'Civil - Masonry', itemCode: 'CIV-006', description: 'Fly Ash Brickwork', unit: 'Nos', contractQty: 200000, rate: 8, contractAmount: 1600000, revisedQty: 200000, consumedQty: 0, status: 'ACTIVE' },
]

export const DRAWINGS: Drawing[] = [
  { id: 'drw-001', drawingNumber: 'DRG-STR-001', projectId: 'proj-001', name: 'Foundation Layout Plan', discipline: 'Structural', revision: 'Rev A', issueDate: D(-190), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-002', drawingNumber: 'DRG-STR-002', projectId: 'proj-001', name: 'Column Layout & Reinforcement Detail', discipline: 'Structural', revision: 'Rev B', issueDate: D(-30), uploadedBy: 'user-pe', status: 'UNDER_REVIEW' },
  { id: 'drw-003', drawingNumber: 'DRG-ARC-001', projectId: 'proj-001', name: 'Ground Floor Architectural GA', discipline: 'Architectural', revision: 'Rev A', issueDate: D(-150), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
]

// ---------------------------------------------------------------------------
// Opening stock + one prior open PO (establishes indent math: 200 stock + 300 open PO)
// ---------------------------------------------------------------------------
export const STOCK_LEDGER: StockLedgerEntry[] = [
  { id: 'sl-open-cement', date: D(-197), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 200, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 200 },
  { id: 'sl-open-steel', date: D(-197), materialId: 'mat-steel', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 20, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 20 },
  { id: 'sl-open-sand', date: D(-197), materialId: 'mat-sand', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 150, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 150 },
  { id: 'sl-open-agg', date: D(-197), materialId: 'mat-aggregate', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 200, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 200 },
  { id: 'sl-open-brick', date: D(-197), materialId: 'mat-bricks', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 3000, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 3000 },
]

export const PURCHASE_ORDERS_PRIOR: PurchaseOrder[] = [
  {
    id: 'po-0000', poNumber: 'PO-0000', vendorId: 'ven-buildmart', projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', qty: 300, unit: 'Bags', rate: 355, tax: 5, receivedQty: 0 }],
    freight: 1500, total: 300 * 355 * 1.05 + 1500, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(10),
    paymentTerms: '30 days from GRN', warranty: 'NA', terms: 'Standard purchase terms apply.', documents: ['PO-0000.pdf'],
    status: 'ISSUED', createdBy: 'user-proc', createdAt: D(-20),
    approvalHistory: [step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 20), step('PM', 'Suresh Nair', 'APPROVED', 19, 'Approved - ongoing cement requirement')],
  },
]

// ---------------------------------------------------------------------------
// THE CONNECTED DEMO CHAIN
// BOQ Cement -> IND-0001 -> RFQ-0001 -> PO-0001 -> DSP-0001 -> GRN-0001 ->
// Stock -> ISS-0001 -> DPR-0001 -> CHK-0001 -> MEAS-0001 -> SCB-0001 ->
// VB-0001 -> PAY-0001/0002 -> Tally -> Audit
// ---------------------------------------------------------------------------

export const MATERIAL_INDENTS: MaterialIndent[] = [
  {
    id: 'ind-0001', indentNumber: 'IND-0001', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-003', materialId: 'mat-cement', requiredDate: D(-12), requiredQty: 1000, unit: 'Bags',
    priority: 'HIGH', purpose: 'Foundation concreting - Grid A1-A6', workArea: 'Foundation - Block A',
    drawingRef: 'DRG-STR-001 Rev A', remarks: 'Required before next concrete pour cycle.', attachments: ['site-requirement-note.pdf'],
    status: 'PROCUREMENT_PENDING', createdBy: 'user-pe', createdAt: D(-19),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 19), step('PM', 'Suresh Nair', 'APPROVED', 18, 'Approved - net requirement 500 bags verified against stock and open PO')],
  },
]

export const ENQUIRIES: Enquiry[] = [
  {
    id: 'rfq-0001', rfqNumber: 'RFQ-0001', indentId: 'ind-0001', materialId: 'mat-cement', qty: 500, unit: 'Bags',
    vendorIds: ['ven-shree-cement', 'ven-buildmart', 'ven-abc-steel'], requiredDate: D(-10), quotationDueDate: D(-16),
    technicalRequirements: 'OPC 53 Grade, IS 12269 certified, fresh stock not older than 30 days.',
    remarks: 'Urgent requirement for foundation pour.', status: 'VENDOR_SELECTED', selectedVendorId: 'ven-shree-cement',
    createdBy: 'user-proc', createdAt: D(-17),
  },
]

export const VENDOR_QUOTATIONS: VendorQuotation[] = [
  { id: 'vq-0001', rfqId: 'rfq-0001', vendorId: 'ven-shree-cement', rate: 350, tax: 5, freight: 2000, deliveryDays: 5, brand: 'Ultratech / Ambuja', specification: 'OPC 53 Grade IS 12269', validity: D(15), paymentTerms: '30 days from GRN', documents: ['shree-cement-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Meets IS 12269 spec, brand approved.', submittedAt: D(-15) },
  { id: 'vq-0002', rfqId: 'rfq-0001', vendorId: 'ven-buildmart', rate: 355, tax: 5, freight: 1200, deliveryDays: 4, brand: 'ACC', specification: 'OPC 53 Grade IS 12269', validity: D(15), paymentTerms: '45 days from GRN', documents: ['buildmart-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Compliant.', submittedAt: D(-15) },
  { id: 'vq-0003', rfqId: 'rfq-0001', vendorId: 'ven-abc-steel', rate: 360, tax: 5, freight: 0, deliveryDays: 7, brand: 'Local', specification: 'OPC 53 Grade - unverified mill certificate', validity: D(10), paymentTerms: '15 days advance', technicalStatus: 'REJECTED', technicalRemarks: 'Mill test certificate not submitted.', documents: [], submittedAt: D(-14) },
]

const po1Qty = 500, po1Rate = 350, po1Tax = 5, po1Freight = 2000
const po1Total = po1Qty * po1Rate * (1 + po1Tax / 100) + po1Freight

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  ...PURCHASE_ORDERS_PRIOR,
  {
    id: 'po-0001', poNumber: 'PO-0001', rfqId: 'rfq-0001', indentId: 'ind-0001', vendorId: 'ven-shree-cement',
    projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', qty: po1Qty, unit: 'Bags', rate: po1Rate, tax: po1Tax, receivedQty: po1Qty }],
    freight: po1Freight, total: po1Total, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(-10),
    paymentTerms: '30 days from GRN', warranty: 'NA', terms: 'Rejected/damaged material subject to debit note recovery.',
    documents: ['PO-0001.pdf'], status: 'FULLY_RECEIVED', createdBy: 'user-proc', createdAt: D(-14),
    approvalHistory: [
      step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 14),
      step('PROCUREMENT', 'Vikram Singh', 'APPROVED', 13, 'Technical approval - Shree Cement Supplier meets spec, lowest landed cost'),
      step('PM', 'Suresh Nair', 'APPROVED', 13, 'Management approval - within PM+Accounts threshold (₹1L-₹5L)'),
    ],
  },
]

export const DISPATCHES: Dispatch[] = [
  {
    id: 'dsp-0001', dispatchNumber: 'DSP-0001', poId: 'po-0001', vendorId: 'ven-shree-cement', materialId: 'mat-cement',
    qty: 500, vehicleNumber: 'CG04 AB 1234', driver: 'Ramlal Sahu', transporter: 'Bharat Road Carriers',
    dispatchDate: D(-11), challanNumber: 'CH-8821', lrNumber: 'LR-33421', expectedArrival: D(-10),
    documents: ['challan-8821.pdf'], photos: ['dispatch-loading.jpg'], status: 'RECEIVED',
  },
]

export const GRNS: GRN[] = [
  {
    id: 'grn-0001', grnNumber: 'GRN-0001', poId: 'po-0001', dispatchId: 'dsp-0001', vendorId: 'ven-shree-cement',
    projectId: 'proj-001', siteId: 'site-001', vehicle: 'CG04 AB 1234', challan: 'CH-8821',
    items: [{ materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', unit: 'Bags', orderedQty: 500, receivedQty: 500, acceptedQty: 495, rejectedQty: 5, damagedQty: 5, batch: 'BATCH-0926', location: 'Store Shed A' }],
    inspection: 'Visual + moisture check. 5 bags found with moisture damage (torn/hardened) - rejected.',
    photos: ['grn-0001-damage.jpg'], remarks: '5 bags rejected due to moisture damage; debit note raised against vendor.',
    status: 'ACCEPTED', createdBy: 'user-store', hodCheckedBy: 'user-pe', createdAt: D(-10),
  },
]

export const STOCK_LEDGER_CHAIN: StockLedgerEntry[] = [
  { id: 'sl-grn-0001', date: D(-10), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 495, refDoc: 'GRN-0001', refId: 'grn-0001', userId: 'user-store', balanceAfter: 695 },
  { id: 'sl-iss-0001', date: D(-5), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -100, refDoc: 'ISS-0001', refId: 'iss-0001', userId: 'user-store', balanceAfter: 595 },
  { id: 'sl-iss-0002', date: D(-5), materialId: 'mat-steel', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -5, refDoc: 'ISS-0002', refId: 'iss-0002', userId: 'user-store', balanceAfter: 15 },
  { id: 'sl-iss-0003', date: D(-5), materialId: 'mat-sand', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -20, refDoc: 'ISS-0003', refId: 'iss-0003', userId: 'user-store', balanceAfter: 130 },
  { id: 'sl-iss-0004', date: D(-5), materialId: 'mat-aggregate', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -30, refDoc: 'ISS-0004', refId: 'iss-0004', userId: 'user-store', balanceAfter: 170 },
]

export const STORE_ISSUES: StoreIssue[] = [
  { id: 'iss-0001', issueNumber: 'ISS-0001', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-003', materialId: 'mat-cement', qty: 100, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0002', issueNumber: 'ISS-0002', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-002', materialId: 'mat-steel', qty: 5, purpose: 'Column reinforcement - stirrups', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0003', issueNumber: 'ISS-0003', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-004', materialId: 'mat-sand', qty: 20, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0004', issueNumber: 'ISS-0004', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-005', materialId: 'mat-aggregate', qty: 30, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
]

export const STORE_RETURNS: StoreReturn[] = []
export const STOCK_AUDITS: StockAudit[] = [
  { id: 'aud-0001', auditNumber: 'AUD-0001', projectId: 'proj-001', siteId: 'site-001', date: D(-30), auditedBy: 'user-store', lines: [ { materialId: 'mat-cement', systemQty: 200, physicalQty: 198, variance: -2 }, { materialId: 'mat-bricks', systemQty: 3000, physicalQty: 3000, variance: 0 } ], status: 'COMPLETED' },
]

export const DEBIT_NOTES: DebitNote[] = [
  { id: 'dn-0001', debitNoteNumber: 'DN-0001', vendorId: 'ven-shree-cement', grnId: 'grn-0001', poId: 'po-0001', reason: 'REJECTED_MATERIAL', amount: 5 * po1Rate, status: 'ADJUSTED', createdAt: D(-9), remarks: '5 bags of cement rejected at GRN due to moisture damage in transit. Amount adjusted against vendor payment.' },
]

export const FREIGHT_RECORDS: Freight[] = [
  { id: 'frt-0001', freightNumber: 'FRT-0001', poId: 'po-0001', vendorId: 'ven-shree-cement', transporter: 'Bharat Road Carriers', vehicle: 'CG04 AB 1234', distance: 45, freightRate: 44.4, amount: 2000, invoiceNumber: 'FRT-INV-0452', approvalStatus: 'APPROVED', paymentStatus: 'PAID' },
]

const vb1InvoiceAmount = po1Qty * po1Rate * (1 + po1Tax / 100)
const vb1GrnAmount = 495 * po1Rate * (1 + po1Tax / 100)

export const VENDOR_BILLS: VendorBill[] = [
  {
    id: 'vb-0001', billNumber: 'VB-0001', poId: 'po-0001', grnId: 'grn-0001', vendorId: 'ven-shree-cement', projectId: 'proj-001',
    invoiceNumber: 'SCS/2026/4471', invoiceAmount: vb1InvoiceAmount, poAmount: po1Qty * po1Rate * (1 + po1Tax / 100), grnAmount: vb1GrnAmount,
    matchStatus: 'MISMATCH', mismatchReason: 'Invoice billed for 500 bags but GRN-0001 accepted only 495 bags (5 rejected - moisture damage). Resolved via Debit Note DN-0001.',
    status: 'CLOSED', createdAt: D(-8),
    approvalHistory: [
      step('ACCOUNTS', 'Priya Menon', 'SUBMITTED', 8, 'Vendor invoice received'),
      step('ACCOUNTS', 'Priya Menon', 'SENT_BACK', 7, '3-way match failed: qty mismatch vs GRN-0001, held pending debit note'),
      step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 6, 'Debit Note DN-0001 adjusted, net amount verified'),
      step('MD', 'Rajesh Agarwal', 'APPROVED', 5, 'Approved for payment net of debit note'),
    ],
  },
]

export const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo-0001', woNumber: 'WO-0001', subcontractorId: 'sub-abc-civil', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Foundation & Civil Structure - Block A', scope: 'RCC foundation, columns and slab work for Block A as per approved drawings and BOQ items CIV-001/CIV-002.', value: 4500000, startDate: D(-190), endDate: D(120), status: 'ACTIVE' },
  { id: 'wo-0002', woNumber: 'WO-0002', subcontractorId: 'sub-shree-elec', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Electrical Rough-in - Block A', scope: 'Conduit laying and cabling for ground and first floor.', value: 1800000, startDate: D(-30), endDate: D(150), status: 'DRAFT' },
]

export const MEASUREMENTS: Measurement[] = [
  { id: 'meas-0001', measurementNumber: 'MEAS-0001', projectId: 'proj-001', boqItemId: 'boq-001', subcontractorId: 'sub-abc-civil', workOrderId: 'wo-0001', previousQty: 175, currentQty: 45, cumulativeQty: 220, rate: 6200, amount: 45 * 6200, date: D(-4), measuredBy: 'user-pe', verifiedBy: 'user-pm', attachments: ['mb-page-22.pdf'], status: 'APPROVED' },
]

export const SUBCONTRACTOR_BILLS: SubcontractorBill[] = [
  {
    id: 'scb-0001', billNumber: 'SCB-0001', workOrderId: 'wo-0001', subcontractorId: 'sub-abc-civil', projectId: 'proj-001',
    measurementIds: ['meas-0001'], grossAmount: 45 * 6200, retention: Math.round(45 * 6200 * 0.05), advanceRecovery: 10000, penalty: 0, otherDeduction: 0, tax: 0,
    netPayable: 45 * 6200 - Math.round(45 * 6200 * 0.05) - 10000,
    status: 'PAID', createdAt: D(-3),
    approvalHistory: [
      step('SUBCONTRACTOR', 'Manoj Tiwari', 'SUBMITTED', 3),
      step('PE', 'Arjun Verma', 'VERIFIED', 3),
      step('PM', 'Suresh Nair', 'VERIFIED', 2),
      step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 2),
      step('MD', 'Rajesh Agarwal', 'APPROVED', 1),
    ],
  },
]

export const PAYMENTS: Payment[] = [
  {
    id: 'pay-0001', paymentNumber: 'PAY-0001', type: 'VENDOR', refBillId: 'vb-0001', projectId: 'proj-001', payeeName: 'Shree Cement Supplier',
    amount: vb1InvoiceAmount - 5 * po1Rate, status: 'TALLY_POSTED', paymentDate: D(-5), paymentRef: 'NEFT/2026/00234', tallyVoucherNumber: 'TV-0001',
    createdAt: D(-6),
    approvalHistory: [step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 6), step('MD', 'Rajesh Agarwal', 'APPROVED', 5, 'Approved net of debit note DN-0001')],
  },
  {
    id: 'pay-0002', paymentNumber: 'PAY-0002', type: 'SUBCONTRACTOR', refBillId: 'scb-0001', projectId: 'proj-001', payeeName: 'ABC Civil Works',
    amount: 45 * 6200 - Math.round(45 * 6200 * 0.05) - 10000, status: 'TALLY_POSTED', paymentDate: D(-1), paymentRef: 'NEFT/2026/00235', tallyVoucherNumber: 'TV-0002',
    createdAt: D(-1),
    approvalHistory: [step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 2), step('MD', 'Rajesh Agarwal', 'APPROVED', 1)],
  },
]

export const RA_BILLS: RABill[] = [
  { id: 'ra-0001', raNumber: 'RA-0001', projectId: 'proj-001', contractId: 'contract-001', measurementIds: ['meas-0001'], billedAmount: 4500000, certifiedAmount: 4300000, retention: 215000, deductions: 50000, netAmount: 4300000 - 215000 - 50000, invoiceNumber: 'INV-SKY-0001', receivedAmount: 3000000, status: 'RECEIVED', createdAt: D(-25) },
]

// ---------------------------------------------------------------------------
// Site Execution: DPR / Attendance / Equipment / Site Issues
// ---------------------------------------------------------------------------
export const DAILY_REPORTS: DailyReport[] = [
  {
    id: 'dpr-0001', dprNumber: 'DPR-0001', projectId: 'proj-001', siteId: 'site-001', date: D(-5), shift: 'DAY',
    weather: 'Clear', workArea: 'Foundation - Block A, Grid A1-A6', boqItemId: 'boq-001', activity: 'Foundation Concrete Pour - Grid A1-A6',
    plannedQty: 50, todayQty: 45, cumulativeQty: 220, labourCount: 48,
    equipmentUsed: ['Concrete Mixer M1', 'Vibrator V2', 'Transit Mixer TM-3'],
    materialsUsed: [
      { materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', qty: 100, unit: 'Bags' },
      { materialId: 'mat-sand', materialName: 'River Sand', qty: 20, unit: 'm3' },
      { materialId: 'mat-aggregate', materialName: 'Coarse Aggregate 20mm', qty: 30, unit: 'm3' },
    ],
    safetyIssues: 'None reported. All workers wore PPE.', siteIssues: 'Minor delay due to pump breakdown (30 mins).',
    delayReason: 'Concrete pump breakdown - resolved on site within 30 minutes.', drawingRef: 'DRG-STR-001 Rev A',
    photos: ['dpr-0001-pour-1.jpg', 'dpr-0001-pour-2.jpg'], remarks: 'Pour completed successfully, cubes cast for testing.',
    preparedBy: 'user-pe', status: 'APPROVED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 5), step('PE', 'Arjun Verma', 'VERIFIED', 4, 'Site verification done'), step('PM', 'Suresh Nair', 'APPROVED', 4)],
  },
  {
    id: 'dpr-0002', dprNumber: 'DPR-0002', projectId: 'proj-001', siteId: 'site-001', date: D(-1), shift: 'DAY',
    weather: 'Cloudy', workArea: 'Foundation - Block A, Grid A7-A10', boqItemId: 'boq-001', activity: 'Column Reinforcement Fixing',
    plannedQty: 12, todayQty: 8, cumulativeQty: 228, labourCount: 22, equipmentUsed: ['Bar Bending Machine'],
    materialsUsed: [{ materialId: 'mat-steel', materialName: 'Reinforcement Steel (TMT)', qty: 2, unit: 'MT' }],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-STR-002 Rev B',
    photos: [], remarks: 'On track, awaiting PE review.', preparedBy: 'user-pe', status: 'SUBMITTED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1)],
  },
]

const laborCategories: { category: string; count: number; wage: number }[] = [
  { category: 'Mason', count: 10, wage: 750 },
  { category: 'Helper', count: 18, wage: 550 },
  { category: 'Carpenter', count: 8, wage: 700 },
  { category: 'Electrician', count: 4, wage: 800 },
  { category: 'Plumber', count: 3, wage: 800 },
  { category: 'Operator', count: 3, wage: 900 },
  { category: 'Supervisor', count: 2, wage: 1100 },
]

export const ATTENDANCE: AttendanceRecord[] = laborCategories.flatMap((cat, ci) =>
  Array.from({ length: cat.count }).map((_, i) => ({
    id: `att-${ci}-${i}`, personName: `${cat.category} ${i + 1}`, category: cat.category, isEmployee: false,
    projectId: 'proj-001', siteId: 'site-001', date: D(-5), inTime: '08:00', outTime: '18:00',
    status: 'PRESENT' as const, overtimeHours: i % 5 === 0 ? 2 : 0, wageRate: cat.wage, remarks: '',
  }))
)

export const EQUIPMENT_LOGS: EquipmentLog[] = [
  { id: 'eq-001', equipmentName: 'Concrete Mixer M1', equipmentType: 'Mixer', projectId: 'proj-001', siteId: 'site-001', date: D(-5), operator: 'Operator 1', hoursUsed: 8, status: 'RUNNING', remarks: 'Used for foundation pour' },
  { id: 'eq-002', equipmentName: 'Tower Crane TC-1', equipmentType: 'Crane', projectId: 'proj-001', siteId: 'site-001', date: D(-5), operator: 'Operator 2', hoursUsed: 6, status: 'RUNNING', remarks: '' },
  { id: 'eq-003', equipmentName: 'Transit Mixer TM-3', equipmentType: 'Transit Mixer', projectId: 'proj-001', siteId: 'site-001', date: D(-2), operator: 'Operator 3', hoursUsed: 0, status: 'BREAKDOWN', remarks: 'Hydraulic hose leak - under repair' },
]

export const SITE_ISSUES: SiteIssue[] = [
  { id: 'sissue-001', issueNumber: 'SI-0001', projectId: 'proj-001', siteId: 'site-001', title: 'Concrete pump breakdown during pour', description: 'Pump failed for 30 minutes during Grid A1-A6 pour, resolved on site.', category: 'Equipment', severity: 'LOW', raisedBy: 'user-pe', status: 'RESOLVED', dueDate: D(-4), resolution: 'Backup pump arranged, pour completed without cold joint.', createdAt: D(-5) },
  { id: 'sissue-002', issueNumber: 'SI-0002', projectId: 'proj-001', siteId: 'site-001', title: 'Water logging near Block A entrance', description: 'Rainwater accumulation blocking material movement path.', category: 'Site Condition', severity: 'MEDIUM', raisedBy: 'user-pe', assignedTo: 'user-store', status: 'OPEN', dueDate: D(2), createdAt: D(-1) },
]

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------
export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  { id: 'tmpl-material', name: 'Material Receiving Checklist', category: 'Store', active: true, items: [
    { id: 'i1', question: 'Delivery challan matches PO', required: true },
    { id: 'i2', question: 'Quantity verified against PO', required: true },
    { id: 'i3', question: 'Material quality visually acceptable', required: true },
    { id: 'i4', question: 'Vehicle/driver details recorded', required: false },
  ]},
  { id: 'tmpl-safety', name: 'Safety Checklist', category: 'Safety', active: true, items: [
    { id: 'i1', question: 'All workers wearing PPE (helmet, shoes, vest)', required: true },
    { id: 'i2', question: 'Fire extinguisher available at site', required: true },
    { id: 'i3', question: 'Barricading in place around excavation/openings', required: true },
    { id: 'i4', question: 'First-aid kit accessible', required: true },
  ]},
  { id: 'tmpl-siteopen', name: 'Site Opening Checklist', category: 'Site', active: true, items: [
    { id: 'i1', question: 'Site fencing/security in place', required: true },
    { id: 'i2', question: 'Approved drawings available at site', required: true },
    { id: 'i3', question: 'Statutory approvals displayed', required: false },
  ]},
  { id: 'tmpl-concrete', name: 'Concrete Work Checklist', category: 'Quality', active: true, items: [
    { id: 'i1', question: 'Formwork inspected and approved', required: true },
    { id: 'i2', question: 'Reinforcement placement verified against drawing', required: true },
    { id: 'i3', question: 'Concrete mix ratio / grade verified', required: true },
    { id: 'i4', question: 'Cube samples taken for testing', required: true },
    { id: 'i5', question: 'Curing arrangement in place', required: true },
    { id: 'i6', question: 'Safety barricading around pour area', required: false },
  ]},
  { id: 'tmpl-daily', name: 'Daily Site Checklist', category: 'Site', active: true, items: [
    { id: 'i1', question: 'Housekeeping done', required: true },
    { id: 'i2', question: 'Toolbox talk conducted', required: true },
  ]},
  { id: 'tmpl-equipment', name: 'Equipment Checklist', category: 'Equipment', active: true, items: [
    { id: 'i1', question: 'Equipment inspected before use', required: true },
    { id: 'i2', question: 'Operator license verified', required: true },
  ]},
  { id: 'tmpl-storeaudit', name: 'Store Audit Checklist', category: 'Store', active: true, items: [
    { id: 'i1', question: 'Physical stock matches system stock', required: true },
    { id: 'i2', question: 'Storage location labeled correctly', required: false },
  ]},
]

export const CHECKLIST_INSTANCES: ChecklistInstance[] = [
  {
    id: 'chk-0001', checklistNumber: 'CHK-0001', templateId: 'tmpl-concrete', templateName: 'Concrete Work Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-pe', createdAt: D(-5),
    relatedModule: 'dpr', relatedRecordId: 'dpr-0001',
    items: [
      { itemId: 'i1', question: 'Formwork inspected and approved', required: true, result: 'PASS', comment: 'Verified by PE before pour' },
      { itemId: 'i2', question: 'Reinforcement placement verified against drawing', required: true, result: 'PASS', comment: 'Matches DRG-STR-001' },
      { itemId: 'i3', question: 'Concrete mix ratio / grade verified', required: true, result: 'PASS', comment: 'M25 confirmed with batching slip' },
      { itemId: 'i4', question: 'Cube samples taken for testing', required: true, result: 'PASS', comment: '6 cubes cast' },
      { itemId: 'i5', question: 'Curing arrangement in place', required: true, result: 'FAIL', comment: 'Curing sheets not laid initially', correctiveAction: 'Curing sheets and water sprinkling arrangement added same evening', rechecked: true },
      { itemId: 'i6', question: 'Safety barricading around pour area', required: false, result: 'PASS', comment: '' },
    ],
    status: 'CLOSED', supervisorVerifiedBy: 'user-store', peApprovedBy: 'user-pe',
  },
  {
    id: 'chk-0002', checklistNumber: 'CHK-0002', templateId: 'tmpl-safety', templateName: 'Safety Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-store', createdAt: D(-1),
    items: [
      { itemId: 'i1', question: 'All workers wearing PPE (helmet, shoes, vest)', required: true, result: 'PASS', comment: '' },
      { itemId: 'i2', question: 'Fire extinguisher available at site', required: true, result: 'FAIL', comment: 'Extinguisher near store shed found expired' },
      { itemId: 'i3', question: 'Barricading in place around excavation/openings', required: true, result: 'PASS', comment: '' },
      { itemId: 'i4', question: 'First-aid kit accessible', required: true, result: 'PASS', comment: '' },
    ],
    status: 'FAILED_PENDING_CORRECTION',
  },
]

// ---------------------------------------------------------------------------
// Delegation
// ---------------------------------------------------------------------------
export const DELEGATIONS: Delegation[] = [
  { id: 'task-0001', taskId: 'TASK-0001', title: 'Submit concrete cube test report (7-day)', description: 'Submit lab report for cubes cast during DPR-0001 pour.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-pm', assignedTo: 'user-pe', priority: 'HIGH', startDate: D(-5), dueDate: D(2), relatedModule: 'dpr', relatedRecordId: 'dpr-0001', status: 'IN_PROGRESS', progressPct: 60, escalated: false, createdAt: D(-5) },
  { id: 'task-0002', taskId: 'TASK-0002', title: 'Follow up steel delivery schedule with ABC Steel Traders', description: 'Confirm next TMT steel delivery date for Block A columns.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-pm', assignedTo: 'user-proc', priority: 'NORMAL', startDate: D(-2), dueDate: D(3), relatedModule: 'vendors', status: 'ASSIGNED', progressPct: 0, escalated: false, createdAt: D(-2) },
  { id: 'task-0003', taskId: 'TASK-0003', title: 'Complete monthly stock audit for Store', description: 'Physical stock verification for all civil materials at Raipur site.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-pm', assignedTo: 'user-store', priority: 'NORMAL', startDate: D(-15), dueDate: D(-10), relatedModule: 'stockAudit', status: 'OVERDUE', progressPct: 20, escalated: true, reminderSentAt: D(-9), createdAt: D(-15) },
  { id: 'task-0004', taskId: 'TASK-0004', title: 'Reconcile Debit Note DN-0001 with vendor ledger', description: 'Confirm debit note adjustment reflected in Shree Cement Supplier ledger.', projectId: 'proj-001', assignedBy: 'user-md', assignedTo: 'user-acc', priority: 'LOW', startDate: D(-6), dueDate: D(-1), relatedModule: 'debitNotes', relatedRecordId: 'dn-0001', status: 'COMPLETED', progressPct: 100, escalated: false, createdAt: D(-6) },
]

// ---------------------------------------------------------------------------
// Documents / Subscriptions / Loans
// ---------------------------------------------------------------------------
export const DOCUMENTS: AppDocument[] = [
  { id: 'doc-0001', docNumber: 'DOC-0001', name: 'ISO 9001:2015 Certification', type: 'Certificate', version: 1, issueDate: D(-300), expiryDate: D(400), uploadedBy: 'user-md', approvedBy: 'user-md', status: 'APPROVED' },
  { id: 'doc-0002', docNumber: 'DOC-0002', name: 'Approved GFC Drawing Set - Foundation', type: 'Drawing', projectId: 'proj-001', relatedModule: 'drawings', relatedRecordId: 'drw-001', version: 1, issueDate: D(-190), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'doc-0003', docNumber: 'DOC-0003', name: 'Shree Cement Supplier - GST Certificate', type: 'Vendor Compliance', vendorId: 'ven-shree-cement', version: 2, issueDate: D(-350), expiryDate: D(6), uploadedBy: 'user-proc', status: 'EXPIRING_SOON' },
  { id: 'doc-0004', docNumber: 'DOC-0004', name: 'ABC Civil Works - Work Order Agreement', type: 'Contract', subcontractorId: 'sub-abc-civil', relatedModule: 'workOrders', relatedRecordId: 'wo-0001', projectId: 'proj-001', version: 1, issueDate: D(-190), uploadedBy: 'user-pm', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'doc-0005', docNumber: 'DOC-0005', name: 'Contractor All Risk (CAR) Insurance Policy', type: 'Insurance', projectId: 'proj-001', version: 1, issueDate: D(-180), expiryDate: D(25), uploadedBy: 'user-acc', approvedBy: 'user-md', status: 'APPROVED' },
  { id: 'doc-0006', docNumber: 'DOC-0006', name: 'Client Contract Agreement - Skyline Developers', type: 'Legal Contract', projectId: 'proj-001', relatedModule: 'contracts', relatedRecordId: 'contract-001', version: 1, issueDate: D(-198), uploadedBy: 'user-bill', approvedBy: 'user-md', status: 'APPROVED' },
]

export const SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-0001', name: 'Tally Prime ERP License', provider: 'Tally Solutions', type: 'Software License', startDate: D(-353), endDate: D(12), renewalDate: D(12), cost: 24000, frequency: 'YEARLY', owner: 'user-acc', status: 'RENEWAL_DUE' },
  { id: 'sub-0002', name: 'AutoCAD Subscription', provider: 'Autodesk', type: 'Software License', startDate: D(-90), endDate: D(275), renewalDate: D(275), cost: 45000, frequency: 'YEARLY', owner: 'user-pe', projectId: 'proj-001', status: 'ACTIVE' },
  { id: 'sub-0003', name: 'Site Vehicle Insurance AMC', provider: 'ICICI Lombard', type: 'Insurance', startDate: D(-361), endDate: D(4), renewalDate: D(4), cost: 18500, frequency: 'YEARLY', owner: 'user-acc', projectId: 'proj-001', status: 'RENEWAL_DUE' },
  { id: 'sub-0004', name: 'Tower Crane AMC Service Contract', provider: 'L&T Construction Equipment', type: 'AMC', startDate: D(-185), endDate: D(180), renewalDate: D(180), cost: 120000, frequency: 'YEARLY', owner: 'user-pm', projectId: 'proj-001', status: 'ACTIVE' },
]

const loanInstallments: LoanInstallment[] = Array.from({ length: 60 }).map((_, i) => {
  const dueOffset = -190 + i * 30
  let status: LoanInstallment['status'] = 'PENDING'
  if (i < 6) status = 'PAID'
  else if (i === 6) status = 'OVERDUE'
  return { id: `li-${i + 1}`, loanId: 'loan-0001', installmentNo: i + 1, dueDate: D(dueOffset), amount: 168000, paidDate: i < 6 ? D(dueOffset + 2) : undefined, status }
})

export const LOANS: Loan[] = [
  { id: 'loan-0001', loanNumber: 'LOAN-0001', name: 'Concrete Batching Plant Equipment Loan', lender: 'HDFC Bank', principal: 8000000, interestRate: 9.5, startDate: D(-190), tenureMonths: 60, emiAmount: 168000, outstanding: 8000000 - 6 * 168000, status: 'ACTIVE', nocIssued: false },
]
export const LOAN_INSTALLMENTS: LoanInstallment[] = loanInstallments

// ---------------------------------------------------------------------------
// Seeded notifications (unresolved items existing at "today")
// ---------------------------------------------------------------------------
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'ntf-0001', toUserId: 'user-store', title: 'Low stock alert', message: 'Fly Ash Bricks stock (3,000 Nos) is below reorder level (5,000 Nos) at Raipur Main Site.', module: 'inventory', relatedRecordId: 'mat-bricks', severity: 'WARNING', read: false, createdAt: D(-1) },
  { id: 'ntf-0002', toUserId: 'user-pe', title: 'Checklist failed', message: 'Safety Checklist CHK-0002 has a failed item: Fire extinguisher expired. Corrective action required.', module: 'checklist', relatedRecordId: 'chk-0002', severity: 'CRITICAL', read: false, createdAt: D(-1) },
  { id: 'ntf-0003', toUserId: 'user-pm', title: 'Delegation overdue', message: 'TASK-0003 (Monthly stock audit) is overdue by 10 days. Escalated.', module: 'delegation', relatedRecordId: 'task-0003', severity: 'WARNING', read: false, createdAt: D(-9) },
  { id: 'ntf-0004', toUserId: 'user-acc', title: 'Document expiring soon', message: 'Shree Cement Supplier GST Certificate expires in 6 days.', module: 'documents', relatedRecordId: 'doc-0003', severity: 'WARNING', read: false, createdAt: D(-1) },
  { id: 'ntf-0005', toUserId: 'user-md', title: 'Payment completed', message: 'PAY-0001 to Shree Cement Supplier posted to Tally (TV-0001).', module: 'payments', relatedRecordId: 'pay-0001', severity: 'INFO', read: true, createdAt: D(-5) },
]

// ---------------------------------------------------------------------------
// Audit log for the full connected chain
// ---------------------------------------------------------------------------
function audit(recordType: string, recordId: string, recordNumber: string, action: string, userId: string, userName: string, role: AuditEntry['role'], daysAgo: number, oldValue?: string, newValue?: string, reason?: string): AuditEntry {
  return { id: `aud-${Math.random().toString(36).slice(2, 9)}`, recordType, recordId, recordNumber, action, oldValue, newValue, userId, userName, role, timestamp: D(-daysAgo), reason }
}

export const AUDIT_LOG: AuditEntry[] = [
  audit('MaterialIndent', 'ind-0001', 'IND-0001', 'Created & Submitted', 'user-pe', 'Arjun Verma', 'PE', 19, undefined, 'SUBMITTED'),
  audit('MaterialIndent', 'ind-0001', 'IND-0001', 'Approved', 'user-pm', 'Suresh Nair', 'PM', 18, 'SUBMITTED', 'APPROVED', 'Net requirement verified: 1000 required - 200 stock - 300 open PO = 500'),
  audit('Enquiry', 'rfq-0001', 'RFQ-0001', 'RFQ Created & Sent', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 17, undefined, 'SENT', '3 vendors selected for quotation'),
  audit('VendorQuotation', 'vq-0003', 'RFQ-0001 / ABC Steel Traders', 'Technical Review - Rejected', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 14, 'PENDING', 'REJECTED', 'Mill test certificate not submitted'),
  audit('Enquiry', 'rfq-0001', 'RFQ-0001', 'Vendor Selected', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 14, undefined, 'Shree Cement Supplier', 'Lowest landed cost with compliant technical spec'),
  audit('PurchaseOrder', 'po-0001', 'PO-0001', 'PO Created & Submitted', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 14, undefined, 'SUBMITTED'),
  audit('PurchaseOrder', 'po-0001', 'PO-0001', 'Technical Approval', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 13, 'SUBMITTED', 'TECHNICAL_APPROVED'),
  audit('PurchaseOrder', 'po-0001', 'PO-0001', 'Management Approval', 'user-pm', 'Suresh Nair', 'PM', 13, 'TECHNICAL_APPROVED', 'APPROVED', 'Within PM+Accounts threshold ₹1,00,000-₹5,00,000'),
  audit('PurchaseOrder', 'po-0001', 'PO-0001', 'PO Issued to Vendor', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 12, 'APPROVED', 'ISSUED'),
  audit('Dispatch', 'dsp-0001', 'DSP-0001', 'Dispatch Created by Vendor', 'user-vendor', 'Ramesh Gupta', 'VENDOR', 11, undefined, 'DISPATCHED'),
  audit('Dispatch', 'dsp-0001', 'DSP-0001', 'Marked Received at Site', 'user-store', 'Deepak Chauhan', 'STORE', 10, 'IN_TRANSIT', 'RECEIVED'),
  audit('GRN', 'grn-0001', 'GRN-0001', 'GRN Created', 'user-store', 'Deepak Chauhan', 'STORE', 10, undefined, 'INSPECTION'),
  audit('GRN', 'grn-0001', 'GRN-0001', 'HOD Check & Accepted', 'user-pe', 'Arjun Verma', 'PE', 10, 'INSPECTION', 'ACCEPTED', '495 accepted, 5 rejected - moisture damage'),
  audit('DebitNote', 'dn-0001', 'DN-0001', 'Debit Note Raised', 'user-acc', 'Priya Menon', 'ACCOUNTS', 9, undefined, 'DRAFT', 'Against 5 rejected bags at GRN-0001'),
  audit('DebitNote', 'dn-0001', 'DN-0001', 'Adjusted against vendor payment', 'user-acc', 'Priya Menon', 'ACCOUNTS', 6, 'APPROVED', 'ADJUSTED'),
  audit('StockLedger', 'sl-grn-0001', 'GRN-0001', 'Stock In', 'user-store', 'Deepak Chauhan', 'STORE', 10, '200', '695', 'Cement +495 bags from GRN-0001'),
  audit('StoreIssue', 'iss-0001', 'ISS-0001', 'Material Issued to Site', 'user-store', 'Deepak Chauhan', 'STORE', 5, '695', '595', 'Cement -100 bags to Block A foundation pour'),
  audit('DailyReport', 'dpr-0001', 'DPR-0001', 'Submitted', 'user-pe', 'Arjun Verma', 'PE', 5, undefined, 'SUBMITTED'),
  audit('DailyReport', 'dpr-0001', 'DPR-0001', 'PE Reviewed', 'user-pe', 'Arjun Verma', 'PE', 4, 'SUBMITTED', 'PE_REVIEW'),
  audit('DailyReport', 'dpr-0001', 'DPR-0001', 'PM Approved', 'user-pm', 'Suresh Nair', 'PM', 4, 'PE_REVIEW', 'APPROVED'),
  audit('Checklist', 'chk-0001', 'CHK-0001', 'Item Failed: Curing arrangement', 'user-store', 'Deepak Chauhan', 'STORE', 5, 'PENDING', 'FAIL', 'Curing sheets not laid initially'),
  audit('Checklist', 'chk-0001', 'CHK-0001', 'Corrective Action & Recheck Passed', 'user-pe', 'Arjun Verma', 'PE', 5, 'FAIL', 'PASS'),
  audit('Checklist', 'chk-0001', 'CHK-0001', 'PE Approved & Closed', 'user-pe', 'Arjun Verma', 'PE', 4, 'SUPERVISOR_VERIFIED', 'CLOSED'),
  audit('Measurement', 'meas-0001', 'MEAS-0001', 'Measurement Recorded', 'user-pe', 'Arjun Verma', 'PE', 4, undefined, 'SUBMITTED'),
  audit('Measurement', 'meas-0001', 'MEAS-0001', 'PM Verified & Approved', 'user-pm', 'Suresh Nair', 'PM', 3, 'PE_VERIFIED', 'APPROVED'),
  audit('SubcontractorBill', 'scb-0001', 'SCB-0001', 'Bill Submitted', 'user-sub', 'Manoj Tiwari', 'SUBCONTRACTOR', 3, undefined, 'SUBMITTED'),
  audit('SubcontractorBill', 'scb-0001', 'SCB-0001', 'PE + PM Verified', 'user-pm', 'Suresh Nair', 'PM', 2, 'SUBMITTED', 'PM_VERIFIED'),
  audit('SubcontractorBill', 'scb-0001', 'SCB-0001', 'Accounts Verified', 'user-acc', 'Priya Menon', 'ACCOUNTS', 2, 'PM_VERIFIED', 'ACCOUNTS_VERIFIED'),
  audit('SubcontractorBill', 'scb-0001', 'SCB-0001', 'MD Approved', 'user-md', 'Rajesh Agarwal', 'MD', 1, 'ACCOUNTS_VERIFIED', 'MD_APPROVED'),
  audit('VendorBill', 'vb-0001', 'VB-0001', '3-Way Match: Mismatch detected', 'user-acc', 'Priya Menon', 'ACCOUNTS', 7, 'PENDING', 'MISMATCH', 'Invoice qty 500 vs GRN accepted 495'),
  audit('VendorBill', 'vb-0001', 'VB-0001', 'MD Approved for Payment', 'user-md', 'Rajesh Agarwal', 'MD', 5, 'MD_APPROVAL_PENDING', 'PAID'),
  audit('Payment', 'pay-0001', 'PAY-0001', 'MD Approved Payment', 'user-md', 'Rajesh Agarwal', 'MD', 5, 'MD_APPROVAL_PENDING', 'PAID'),
  audit('Payment', 'pay-0001', 'PAY-0001', 'Tally Entry Posted', 'user-acc', 'Priya Menon', 'ACCOUNTS', 5, 'PAID', 'TALLY_POSTED', 'Voucher TV-0001'),
  audit('Payment', 'pay-0002', 'PAY-0002', 'MD Approved Payment', 'user-md', 'Rajesh Agarwal', 'MD', 1, 'MD_APPROVAL_PENDING', 'PAID'),
  audit('Payment', 'pay-0002', 'PAY-0002', 'Tally Entry Posted', 'user-acc', 'Priya Menon', 'ACCOUNTS', 1, 'PAID', 'TALLY_POSTED', 'Voucher TV-0002'),
]

export const SEED_COUNTERS: Record<string, number> = {
  IND: 2, RFQ: 2, PO: 2, DSP: 2, GRN: 2, ISS: 5, RET: 1, AUD: 2, WO: 3, MEAS: 2, SCB: 2,
  VB: 2, PAY: 3, FRT: 2, DN: 2, RA: 2, DPR: 3, SI: 3, CHK: 3, TASK: 5, DOC: 7, SUB: 5, LOAN: 2,
}
