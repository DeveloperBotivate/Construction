import type {
  User, Project, Site, BOQItem, Drawing, Material, Vendor, Subcontractor, Client, Contract,
  MaterialIndent, Enquiry, VendorQuotation, PurchaseOrder, Dispatch, GRN, StockLedgerEntry,
  StoreIssue, StoreReturn, StockAudit, WorkOrder, Measurement, SubcontractorBill, RABill,
  VendorBill, Freight, DebitNote, Payment, AppDocument, Subscription, Loan, LoanInstallment,
  DailyReport, AttendanceRecord, EquipmentLog, SiteIssue, ChecklistTemplate, ChecklistInstance,
  Delegation, AuditEntry, AppNotification, ApprovalStep, ApprovalTask, Role,
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
  { id: 'user-md', employeeId: 'MD001', name: 'Rajesh Agarwal', email: 'md@constructionerp.demo', password: 'MD@123', role: 'MD', phone: '+91 98230 11001', designation: 'Managing Director', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-pm', employeeId: 'PM001', name: 'Suresh Nair', email: 'pm@constructionerp.demo', password: 'PM@123', role: 'PM', reportsTo: 'user-md', designation: 'HQ Project Manager', phone: '+91 98230 11002', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-acc', employeeId: 'ACC001', name: 'Priya Menon', email: 'accounts@constructionerp.demo', password: 'ACC@123', role: 'ACCOUNTS', reportsTo: 'user-md', designation: 'HQ Accounts Manager', phone: '+91 98230 11003', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-bill', employeeId: 'BILL001', name: 'Anita Rao', email: 'billing@constructionerp.demo', password: 'BILL@123', role: 'BILLING', reportsTo: 'user-pm', designation: 'HQ Billing & Liaison Engineer', phone: '+91 98230 11004', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-proc', employeeId: 'PROC001', name: 'Vikram Singh', email: 'procurement@constructionerp.demo', password: 'PROC@123', role: 'PROCUREMENT', reportsTo: 'user-pm', designation: 'HQ Procurement Executive', phone: '+91 98230 11005', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-pe', employeeId: 'PE001', name: 'Arjun Verma', email: 'pe@constructionerp.demo', password: 'PE@123', role: 'PE', reportsTo: 'user-pm', designation: 'Site Project Engineer', phone: '+91 98230 11006', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-store', employeeId: 'STORE001', name: 'Deepak Chauhan', email: 'store@constructionerp.demo', password: 'STORE@123', role: 'STORE', reportsTo: 'user-pe', designation: 'Site Supervisor / Store Keeper', phone: '+91 98230 11007', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
  { id: 'user-vendor', employeeId: 'VENDOR001', name: 'Ramesh Gupta', email: 'vendor@constructionerp.demo', password: 'VENDOR@123', role: 'VENDOR', designation: 'Vendor - Shree Cement Supplier', phone: '+91 98230 11008', projectIds: ['proj-001', 'proj-002'], siteIds: [], active: true },
  { id: 'user-sub', employeeId: 'SUB001', name: 'Manoj Tiwari', email: 'subcontractor@constructionerp.demo', password: 'SUB@123', role: 'SUBCONTRACTOR', designation: 'Subcontractor - ABC Civil Works', phone: '+91 98230 11009', projectIds: ['proj-001', 'proj-002'], siteIds: ['site-001', 'site-002'], active: true },
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
  { id: 'ven-crescent-paints', name: 'Crescent Paints & Coatings', category: 'Finishing Materials', contactPerson: 'Rohit Malhotra', phone: '+91 90000 10005', email: 'sales@crescentpaints.demo', gstin: '22CRESC7890E1Z4', rating: 4.1, status: 'ACTIVE' },
  { id: 'ven-apex-hardware', name: 'Apex Hardware Traders', category: 'General Building Materials', contactPerson: 'Devendra Sahu', phone: '+91 90000 10006', email: 'orders@apexhardware.demo', gstin: '22APEXH2345F1Z9', rating: 3.8, status: 'ACTIVE' },
]

export const SUBCONTRACTORS: Subcontractor[] = [
  { id: 'sub-abc-civil', name: 'ABC Civil Works', trade: 'Civil & Structural', contactPerson: 'Manoj Tiwari', phone: '+91 91000 20001', email: 'manoj@abccivil.demo', status: 'ACTIVE' },
  { id: 'sub-shree-elec', name: 'Shree Electrical Contractors', trade: 'Electrical', contactPerson: 'Kishore Patil', phone: '+91 91000 20002', email: 'kishore@shreeelectrical.demo', status: 'ACTIVE' },
  { id: 'sub-modern-plumb', name: 'Modern Plumbing Works', trade: 'Plumbing & Fire Fighting', contactPerson: 'Iqbal Ahmed', phone: '+91 91000 20003', email: 'iqbal@modernplumbing.demo', status: 'ACTIVE' },
  { id: 'sub-royal-tiles', name: 'Royal Tiling & Flooring Works', trade: 'Tiling & Flooring', contactPerson: 'Ganesh Yadav', phone: '+91 91000 20004', email: 'ganesh@royaltiling.demo', status: 'ACTIVE' },
]

export const CLIENTS: Client[] = [
  { id: 'client-skyline', name: 'Skyline Developers Pvt Ltd', contactPerson: 'Mr. Ashok Bansal', phone: '+91 99000 30001', email: 'ashok@skylinedevelopers.demo', address: 'Fafadih, Raipur, Chhattisgarh' },
  { id: 'client-greenfield', name: 'Greenfield Realty LLP', contactPerson: 'Ms. Neha Kulkarni', phone: '+91 99000 30002', email: 'neha@greenfieldrealty.demo', address: 'Civil Lines, Raipur, Chhattisgarh' },
  { id: 'client-metro', name: 'Metro Infra Ventures', contactPerson: 'Mr. Sandeep Rathore', phone: '+91 99000 30003', email: 'sandeep@metroinfra.demo', address: 'Telibandha, Raipur, Chhattisgarh' },
]

export const CONTRACTS: Contract[] = [
  { id: 'contract-002', clientId: 'client-skyline', projectId: 'proj-002', contractNumber: 'CNT-SKY-2026-002', value: 150000000, startDate: D(-10), retentionPct: 5 },
  { id: 'contract-001', clientId: 'client-skyline', projectId: 'proj-001', contractNumber: 'CNT-SKY-2026-001', value: 50000000, startDate: D(-198), retentionPct: 5 },
]

// ---------------------------------------------------------------------------
// Project / Site / BOQ / Drawings
// ---------------------------------------------------------------------------
export const PROJECTS: Project[] = [
  {
    id: 'proj-002', code: 'PRJ-002', name: 'XYZ Residential Tower', client: 'Skyline Developers Pvt Ltd',
    contractValue: 150000000, budget: 140000000, actualCost: 0, startDate: D(-10), endDate: D(700),
    status: 'ACTIVE', progressPct: 0, pmId: 'user-pm', location: 'Bhilai, Chhattisgarh',
    description: 'G+15 residential tower with premium amenities.',
  },
  {
    id: 'proj-001', code: 'PRJ-001', name: 'ABC Commercial Complex', client: 'Skyline Developers Pvt Ltd',
    contractValue: 50000000, budget: 47000000, actualCost: 12550000, startDate: D(-198), endDate: D(365),
    status: 'ACTIVE', progressPct: 24, pmId: 'user-pm', location: 'Raipur, Chhattisgarh',
    description: 'G+8 commercial complex with retail podium, office floors, and rooftop amenities.',
  },
]

export const SITES: Site[] = [
  { id: 'site-002', projectId: 'proj-002', name: 'Bhilai Site', code: 'SITE-BHL-01', address: 'Bhilai, Chhattisgarh', geoLocation: '21.1938 N, 81.3509 E', peId: 'user-pe', storeKeeperId: 'user-store', status: 'ACTIVE' },
  { id: 'site-001', projectId: 'proj-001', name: 'Raipur Main Site', code: 'SITE-RPR-01', address: 'Plot 45, Fafadih Industrial Area, Raipur', geoLocation: '21.2514 N, 81.6296 E', peId: 'user-pe', storeKeeperId: 'user-store', status: 'ACTIVE' },
]

export const BOQ_ITEMS: BOQItem[] = [
  { id: 'boq-007', boqNumber: 'BOQ-007', projectId: 'proj-002', section: 'Civil - Structure', itemCode: 'CIV-001', description: 'Concrete M30 (RCC)', unit: 'm3', contractQty: 5000, rate: 6500, contractAmount: 32500000, revisedQty: 5000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-001', boqNumber: 'BOQ-001', projectId: 'proj-001', section: 'Civil - Structure', itemCode: 'CIV-001', description: 'Concrete M25 (RCC Foundation, Columns, Slabs)', unit: 'm3', contractQty: 1000, rate: 6200, contractAmount: 6200000, revisedQty: 1000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-002', boqNumber: 'BOQ-002', projectId: 'proj-001', section: 'Civil - Structure', itemCode: 'CIV-002', description: 'Reinforcement Steel (TMT Fe 500)', unit: 'MT', contractQty: 150, rate: 68000, contractAmount: 10200000, revisedQty: 150, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-003', boqNumber: 'BOQ-003', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-003', description: 'Cement (OPC 53 Grade)', unit: 'Bags', contractQty: 10000, rate: 380, contractAmount: 3800000, revisedQty: 10000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-004', boqNumber: 'BOQ-004', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-004', description: 'River Sand', unit: 'm3', contractQty: 800, rate: 1800, contractAmount: 1440000, revisedQty: 800, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-005', boqNumber: 'BOQ-005', projectId: 'proj-001', section: 'Material - Civil', itemCode: 'MAT-005', description: 'Coarse Aggregate 20mm', unit: 'm3', contractQty: 1200, rate: 1600, contractAmount: 1920000, revisedQty: 1200, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-006', boqNumber: 'BOQ-006', projectId: 'proj-001', section: 'Civil - Masonry', itemCode: 'CIV-006', description: 'Fly Ash Brickwork', unit: 'Nos', contractQty: 200000, rate: 8, contractAmount: 1600000, revisedQty: 200000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-014', boqNumber: 'BOQ-0014', projectId: 'proj-001', section: 'Electrical', itemCode: 'ELE-001', description: 'Electrical Cable Wiring (1.5-4 sqmm XLPE)', unit: 'Mtr', contractQty: 15000, rate: 45, contractAmount: 675000, revisedQty: 15000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-008', boqNumber: 'BOQ-0008', projectId: 'proj-001', section: 'Plumbing', itemCode: 'PLB-001', description: 'PVC Plumbing Pipework & Fittings', unit: 'Nos', contractQty: 800, rate: 350, contractAmount: 280000, revisedQty: 800, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-009', boqNumber: 'BOQ-0009', projectId: 'proj-001', section: 'Finishing', itemCode: 'FIN-001', description: 'Vitrified Tile Flooring', unit: 'Sqm', contractQty: 4500, rate: 850, contractAmount: 3825000, revisedQty: 4500, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-010', boqNumber: 'BOQ-0010', projectId: 'proj-001', section: 'Finishing', itemCode: 'FIN-002', description: 'Exterior & Interior Painting', unit: 'Sqm', contractQty: 8000, rate: 180, contractAmount: 1440000, revisedQty: 8000, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-011', boqNumber: 'BOQ-0011', projectId: 'proj-001', section: 'Civil - Structure', itemCode: 'CIV-011', description: 'Structural Steel Fabrication (Roof Trusses)', unit: 'MT', contractQty: 25, rate: 92000, contractAmount: 2300000, revisedQty: 25, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-012', boqNumber: 'BOQ-0012', projectId: 'proj-001', section: 'Finishing', itemCode: 'FIN-003', description: 'Aluminium Glazing & Windows', unit: 'Sqm', contractQty: 1200, rate: 4200, contractAmount: 5040000, revisedQty: 1200, consumedQty: 0, status: 'ACTIVE' },
  { id: 'boq-013', boqNumber: 'BOQ-0013', projectId: 'proj-001', section: 'General', itemCode: 'GEN-001', description: 'General Hardware & Consumables', unit: 'Lot', contractQty: 50, rate: 15000, contractAmount: 750000, revisedQty: 50, consumedQty: 0, status: 'ACTIVE' },
]

export const DRAWINGS: Drawing[] = [
  { id: 'drw-004', drawingNumber: 'DRG-STR-004', projectId: 'proj-002', name: 'Foundation Layout Plan', discipline: 'Structural', revision: 'Rev A', issueDate: D(-5), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-001', drawingNumber: 'DRG-STR-001', projectId: 'proj-001', name: 'Foundation Layout Plan', discipline: 'Structural', revision: 'Rev A', issueDate: D(-190), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-002', drawingNumber: 'DRG-STR-002', projectId: 'proj-001', name: 'Column Layout & Reinforcement Detail', discipline: 'Structural', revision: 'Rev B', issueDate: D(-30), uploadedBy: 'user-pe', status: 'UNDER_REVIEW' },
  { id: 'drw-003', drawingNumber: 'DRG-ARC-001', projectId: 'proj-001', name: 'Ground Floor Architectural GA', discipline: 'Architectural', revision: 'Rev A', issueDate: D(-150), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-010', drawingNumber: 'DRG-ELE-001', projectId: 'proj-001', name: 'Electrical Single Line Diagram', discipline: 'Electrical', revision: 'Rev A', issueDate: D(-160), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-005', drawingNumber: 'DRG-PLB-001', projectId: 'proj-001', name: 'Plumbing Layout - Ground & First Floor', discipline: 'Plumbing', revision: 'Rev A', issueDate: D(-25), uploadedBy: 'user-pe', status: 'UNDER_REVIEW' },
  { id: 'drw-006', drawingNumber: 'DRG-MEP-001', projectId: 'proj-001', name: 'MEP Coordination Drawing - Podium', discipline: 'MEP', revision: 'Rev A', issueDate: D(-10), uploadedBy: 'user-pe', status: 'DRAFT' },
  { id: 'drw-007', drawingNumber: 'DRG-ARC-002', projectId: 'proj-001', name: 'First Floor Architectural GA', discipline: 'Architectural', revision: 'Rev B', issueDate: D(-140), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'drw-008', drawingNumber: 'DRG-STR-003', projectId: 'proj-001', name: 'Roof Truss Structural Detail', discipline: 'Structural', revision: 'Rev A', issueDate: D(-20), uploadedBy: 'user-pe', status: 'UNDER_REVIEW' },
  { id: 'drw-009', drawingNumber: 'DRG-ARC-003', projectId: 'proj-001', name: 'Landscape & Site Development Plan', discipline: 'Architectural', revision: 'Rev A', issueDate: D(-8), uploadedBy: 'user-pe', status: 'DRAFT' },
]

// ---------------------------------------------------------------------------
// Opening stock + one prior open PO (establishes indent math: 200 stock + 300 open PO)
// ---------------------------------------------------------------------------
export const STOCK_LEDGER: StockLedgerEntry[] = [
  { id: 'sl-open-cement-2', date: D(-2), materialId: 'mat-cement', projectId: 'proj-002', siteId: 'site-002', txnType: 'GRN', qty: 50, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 50 },
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
  {
    id: 'ind-0002', indentNumber: 'IND-0002', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-002', materialId: 'mat-steel', requiredDate: D(10), requiredQty: 20, unit: 'MT',
    priority: 'NORMAL', purpose: 'Column reinforcement - Grid A7-A10, First Floor', workArea: 'Block A - First Floor',
    drawingRef: 'DRG-STR-002 Rev B', remarks: 'Draft - awaiting site quantity confirmation before submission.', attachments: [],
    status: 'DRAFT', createdBy: 'user-pe', createdAt: D(-1), approvalHistory: [],
  },
  {
    id: 'ind-0003', indentNumber: 'IND-0003', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-004', materialId: 'mat-sand', requiredDate: D(7), requiredQty: 150, unit: 'm3',
    priority: 'NORMAL', purpose: 'Plaster work - Ground Floor', workArea: 'Block A - Ground Floor',
    drawingRef: 'DRG-ARC-001 Rev A', remarks: 'Required for internal plastering to commence on schedule.', attachments: [],
    status: 'PM_REVIEW', createdBy: 'user-pe', createdAt: D(-2),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 2)],
  },
  {
    id: 'ind-0004', indentNumber: 'IND-0004', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-005', materialId: 'mat-aggregate', requiredDate: D(9), requiredQty: 200, unit: 'm3',
    priority: 'HIGH', purpose: 'First floor slab concreting', workArea: 'Block A - First Floor',
    drawingRef: 'DRG-STR-002 Rev B', remarks: 'Approved - ready for enquiry/RFQ.', attachments: [],
    status: 'PROCUREMENT_PENDING', createdBy: 'user-pe', createdAt: D(-6),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 6), step('PM', 'Suresh Nair', 'APPROVED', 5, 'Approved - required for upcoming slab pour')],
  },
  {
    id: 'ind-0005', indentNumber: 'IND-0005', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-006', materialId: 'mat-bricks', requiredDate: D(14), requiredQty: 80000, unit: 'Nos',
    priority: 'LOW', purpose: 'Blockwork - Ground & First Floor', workArea: 'Block A',
    drawingRef: 'DRG-ARC-001 Rev A', remarks: '', attachments: [],
    status: 'REJECTED', createdBy: 'user-pe', createdAt: D(-8),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 8), step('PM', 'Suresh Nair', 'REJECTED', 7, 'Quantity exceeds monthly consumption rate - revise and split into phased indents')],
  },
  {
    id: 'ind-0006', indentNumber: 'IND-0006', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-014', materialId: 'mat-cable', requiredDate: D(12), requiredQty: 8000, unit: 'Mtr',
    priority: 'NORMAL', purpose: 'Electrical conduit wiring - Ground Floor', workArea: 'Block A - Ground Floor',
    drawingRef: 'DRG-ELE-001 Rev A', remarks: '', attachments: [],
    status: 'CORRECTION_REQUIRED', createdBy: 'user-pe', createdAt: D(-4),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 4), step('PM', 'Suresh Nair', 'SENT_BACK', 3, 'Please specify cable gauge breakdown (1.5/2.5/4 sqmm) before approval')],
  },
  {
    id: 'ind-0007', indentNumber: 'IND-0007', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-008', materialId: 'mat-pvc', requiredDate: D(11), requiredQty: 300, unit: 'Nos',
    priority: 'NORMAL', purpose: 'Plumbing rough-in - First Floor', workArea: 'Block A - First Floor',
    drawingRef: 'DRG-PLB-001 Rev A', remarks: 'RFQ already in progress with two vendors.', attachments: [],
    status: 'PROCUREMENT_PENDING', createdBy: 'user-pe', createdAt: D(-9),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 9), step('PM', 'Suresh Nair', 'APPROVED', 8, 'Approved for procurement')],
  },
  {
    id: 'ind-0008', indentNumber: 'IND-0008', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-009', materialId: 'mat-tiles', requiredDate: D(-2), requiredQty: 400, unit: 'Box',
    priority: 'NORMAL', purpose: 'Advance procurement - flooring work, ground floor lobby', workArea: 'Block A - Ground Floor',
    drawingRef: 'DRG-ARC-002 Rev B', remarks: 'Fully procured and closed.', attachments: [],
    status: 'CLOSED', createdBy: 'user-pe', createdAt: D(-40),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 40), step('PM', 'Suresh Nair', 'APPROVED', 39, 'Approved - advance rate lock recommended')],
  },
  {
    id: 'ind-0009', indentNumber: 'IND-0009', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-010', materialId: 'mat-paint', requiredDate: D(30), requiredQty: 1200, unit: 'Litre',
    priority: 'LOW', purpose: 'Exterior painting - advance procurement', workArea: 'Block A - Exterior',
    drawingRef: 'DRG-ARC-002 Rev B', remarks: '', attachments: [],
    status: 'PM_REVIEW', createdBy: 'user-pe', createdAt: D(-1),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1)],
  },
  {
    id: 'ind-0010', indentNumber: 'IND-0010', projectId: 'proj-001', siteId: 'site-001',
    boqItemId: 'boq-013', materialId: 'mat-hardware', requiredDate: D(-5), requiredQty: 12, unit: 'Lot',
    priority: 'NORMAL', purpose: 'General consumables - site-wide', workArea: 'Block A',
    drawingRef: '', remarks: 'Delivered, pending store inspection.', attachments: [],
    status: 'PROCUREMENT_PENDING', createdBy: 'user-pe', createdAt: D(-15),
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 15), step('PM', 'Suresh Nair', 'APPROVED', 14, 'Approved - routine consumables')],
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
  {
    id: 'rfq-0002', rfqNumber: 'RFQ-0002', indentId: 'ind-0007', materialId: 'mat-pvc', qty: 300, unit: 'Nos',
    vendorIds: ['ven-buildmart', 'ven-national-elec'], requiredDate: D(11), quotationDueDate: D(-1),
    technicalRequirements: '4 inch PVC pipe, ISI marked, for plumbing rough-in.', remarks: 'Quotes received, awaiting technical review and vendor selection.',
    status: 'QUOTATION_RECEIVED', createdBy: 'user-proc', createdAt: D(-6),
  },
  {
    id: 'rfq-0003', rfqNumber: 'RFQ-0003', indentId: 'ind-0008', materialId: 'mat-tiles', qty: 400, unit: 'Box',
    vendorIds: ['ven-buildmart', 'ven-abc-steel'], requiredDate: D(-4), quotationDueDate: D(-35),
    technicalRequirements: '600x600mm vitrified tiles, matte finish, ISI marked.', remarks: 'Advance procurement for flooring work.',
    status: 'VENDOR_SELECTED', selectedVendorId: 'ven-buildmart', createdBy: 'user-proc', createdAt: D(-38),
  },
  {
    id: 'rfq-0004', rfqNumber: 'RFQ-0004', indentId: 'ind-0010', materialId: 'mat-hardware', qty: 12, unit: 'Lot',
    vendorIds: ['ven-apex-hardware', 'ven-buildmart'], requiredDate: D(-8), quotationDueDate: D(-13),
    technicalRequirements: 'Assorted fasteners, anchors and general hardware consumables per site BOM.', remarks: '',
    status: 'VENDOR_SELECTED', selectedVendorId: 'ven-apex-hardware', createdBy: 'user-proc', createdAt: D(-14),
  },
]

export const VENDOR_QUOTATIONS: VendorQuotation[] = [
  { id: 'vq-0001', rfqId: 'rfq-0001', vendorId: 'ven-shree-cement', rate: 350, tax: 5, freight: 2000, deliveryDays: 5, brand: 'Ultratech / Ambuja', specification: 'OPC 53 Grade IS 12269', validity: D(15), paymentTerms: '30 days from GRN', documents: ['shree-cement-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Meets IS 12269 spec, brand approved.', submittedAt: D(-15) },
  { id: 'vq-0002', rfqId: 'rfq-0001', vendorId: 'ven-buildmart', rate: 355, tax: 5, freight: 1200, deliveryDays: 4, brand: 'ACC', specification: 'OPC 53 Grade IS 12269', validity: D(15), paymentTerms: '45 days from GRN', documents: ['buildmart-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Compliant.', submittedAt: D(-15) },
  { id: 'vq-0003', rfqId: 'rfq-0001', vendorId: 'ven-abc-steel', rate: 360, tax: 5, freight: 0, deliveryDays: 7, brand: 'Local', specification: 'OPC 53 Grade - unverified mill certificate', validity: D(10), paymentTerms: '15 days advance', technicalStatus: 'REJECTED', technicalRemarks: 'Mill test certificate not submitted.', documents: [], submittedAt: D(-14) },
  { id: 'vq-0004', rfqId: 'rfq-0002', vendorId: 'ven-buildmart', rate: 320, tax: 18, freight: 500, deliveryDays: 6, brand: 'Supreme', specification: '4 inch PVC, ISI marked', validity: D(20), paymentTerms: '30 days from GRN', documents: ['buildmart-pvc-quote.pdf'], technicalStatus: 'PENDING', submittedAt: D(-2) },
  { id: 'vq-0005', rfqId: 'rfq-0002', vendorId: 'ven-national-elec', rate: 310, tax: 18, freight: 700, deliveryDays: 8, brand: 'Finolex', specification: '4 inch PVC, ISI marked', validity: D(20), paymentTerms: '45 days from GRN', documents: ['nationalelec-pvc-quote.pdf'], technicalStatus: 'PENDING', submittedAt: D(-1) },
  { id: 'vq-0006', rfqId: 'rfq-0003', vendorId: 'ven-buildmart', rate: 720, tax: 18, freight: 3000, deliveryDays: 10, brand: 'Kajaria', specification: '600x600mm vitrified, matte finish', validity: D(-20), paymentTerms: '30 days from GRN', documents: ['buildmart-tiles-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Sample approved by site engineer.', submittedAt: D(-37) },
  { id: 'vq-0007', rfqId: 'rfq-0003', vendorId: 'ven-abc-steel', rate: 745, tax: 18, freight: 0, deliveryDays: 14, brand: 'Somany', specification: '600x600mm vitrified', validity: D(-20), paymentTerms: '15 days advance', technicalStatus: 'REJECTED', technicalRemarks: 'Higher rate, longer lead time.', documents: [], submittedAt: D(-37) },
  { id: 'vq-0008', rfqId: 'rfq-0004', vendorId: 'ven-apex-hardware', rate: 14500, tax: 18, freight: 500, deliveryDays: 3, brand: 'Assorted (Hettich, Dorset)', specification: 'Per site BOM', validity: D(-5), paymentTerms: '30 days from GRN', documents: ['apex-hardware-quote.pdf'], technicalStatus: 'APPROVED', technicalRemarks: 'Standard consumables, approved.', submittedAt: D(-13) },
  { id: 'vq-0009', rfqId: 'rfq-0004', vendorId: 'ven-buildmart', rate: 15200, tax: 18, freight: 800, deliveryDays: 5, brand: 'Assorted', specification: 'Per site BOM', validity: D(-5), paymentTerms: '45 days from GRN', technicalStatus: 'APPROVED', technicalRemarks: 'Compliant, higher rate.', documents: [], submittedAt: D(-13) },
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
  {
    id: 'po-0002', poNumber: 'PO-0002', rfqId: 'rfq-0003', indentId: 'ind-0008', vendorId: 'ven-buildmart',
    projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-tiles', materialName: 'Vitrified Tiles', qty: 400, unit: 'Box', rate: 720, tax: 18, receivedQty: 400 }],
    freight: 3000, total: 400 * 720 * 1.18 + 3000, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(-8),
    paymentTerms: '30 days from GRN', warranty: 'NA', terms: 'Standard purchase terms apply.',
    documents: ['PO-0002.pdf'], status: 'FULLY_RECEIVED', createdBy: 'user-proc', createdAt: D(-34),
    approvalHistory: [
      step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 34),
      step('PROCUREMENT', 'Vikram Singh', 'APPROVED', 33, 'Technical approval - sample matched approved specification'),
      step('PM', 'Suresh Nair', 'APPROVED', 33, 'Management approval - within PM+Accounts threshold'),
      step('ACCOUNTS', 'Priya Menon', 'APPROVED', 32, 'Accounts review complete - advance rate lock approved'),
    ],
  },
  {
    id: 'po-0003', poNumber: 'PO-0003', vendorId: 'ven-abc-steel', projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-steel', materialName: 'Reinforcement Steel (TMT)', qty: 10, unit: 'MT', rate: 69000, tax: 18, receivedQty: 0 }],
    freight: 5000, total: 10 * 69000 * 1.18 + 5000, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(6),
    paymentTerms: '30 days from GRN', warranty: 'Mill test certificate to accompany delivery.', terms: 'Standard purchase terms apply.',
    documents: ['PO-0003.pdf'], status: 'ISSUED', createdBy: 'user-proc', createdAt: D(-5),
    approvalHistory: [
      step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 5),
      step('PROCUREMENT', 'Vikram Singh', 'APPROVED', 4, 'Technical approval - mill certificate on file'),
      step('PM', 'Suresh Nair', 'APPROVED', 4, 'Management approval - within PM+MD threshold'),
      step('MD', 'Rajesh Agarwal', 'APPROVED', 3, 'Approved - routine restocking for upcoming first floor work'),
    ],
  },
  {
    id: 'po-0004', poNumber: 'PO-0004', indentId: 'ind-0003', vendorId: 'ven-buildmart', projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-sand', materialName: 'River Sand', qty: 90, unit: 'm3', rate: 1850, tax: 5, receivedQty: 0 }],
    freight: 1500, total: 90 * 1850 * 1.05 + 1500, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(9),
    paymentTerms: '30 days from GRN', warranty: 'NA', terms: 'Standard purchase terms apply.',
    documents: [], status: 'MGMT_APPROVAL_PENDING', createdBy: 'user-proc', createdAt: D(-1),
    approvalHistory: [step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 1)],
  },
  {
    id: 'po-0005', poNumber: 'PO-0005', vendorId: 'ven-buildmart', projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-aggregate', materialName: 'Coarse Aggregate 20mm', qty: 350, unit: 'm3', rate: 1650, tax: 5, receivedQty: 0 }],
    freight: 6000, total: 350 * 1650 * 1.05 + 6000, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(12),
    paymentTerms: '45 days from GRN', warranty: 'NA', terms: 'Standard purchase terms apply.',
    documents: [], status: 'MGMT_APPROVAL_PENDING', createdBy: 'user-proc', createdAt: D(-1),
    approvalHistory: [step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 1)],
  },
  {
    id: 'po-0006', poNumber: 'PO-0006', rfqId: 'rfq-0004', indentId: 'ind-0010', vendorId: 'ven-apex-hardware',
    projectId: 'proj-001', siteId: 'site-001',
    items: [{ materialId: 'mat-hardware', materialName: 'Hardware & Fasteners', qty: 12, unit: 'Lot', rate: 14500, tax: 18, receivedQty: 0 }],
    freight: 500, total: 12 * 14500 * 1.18 + 500, deliveryLocation: 'Raipur Main Site', expectedDelivery: D(-2),
    paymentTerms: '30 days from GRN', warranty: 'NA', terms: 'Standard purchase terms apply.',
    documents: ['PO-0006.pdf'], status: 'ISSUED', createdBy: 'user-proc', createdAt: D(-13),
    approvalHistory: [
      step('PROCUREMENT', 'Vikram Singh', 'SUBMITTED', 13),
      step('PROCUREMENT', 'Vikram Singh', 'APPROVED', 12, 'Technical approval - standard consumables'),
      step('PM', 'Suresh Nair', 'APPROVED', 12, 'Management approval - within PM threshold'),
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
  {
    id: 'dsp-0002', dispatchNumber: 'DSP-0002', poId: 'po-0002', vendorId: 'ven-buildmart', materialId: 'mat-tiles',
    qty: 400, vehicleNumber: 'CG04 CD 5678', driver: 'Suresh Patel', transporter: 'Bharat Road Carriers',
    dispatchDate: D(-8), challanNumber: 'CH-9012', lrNumber: 'LR-33500', expectedArrival: D(-7),
    documents: ['challan-9012.pdf'], photos: [], status: 'RECEIVED',
  },
  {
    id: 'dsp-0003', dispatchNumber: 'DSP-0003', poId: 'po-0006', vendorId: 'ven-apex-hardware', materialId: 'mat-hardware',
    qty: 12, vehicleNumber: 'CG04 EF 9012', driver: 'Manish Verma', transporter: 'Apex Logistics',
    dispatchDate: D(-2), challanNumber: 'CH-9033', lrNumber: 'LR-33580', expectedArrival: D(-1),
    documents: ['challan-9033.pdf'], photos: [], status: 'RECEIVED',
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
  {
    id: 'grn-0002', grnNumber: 'GRN-0002', poId: 'po-0002', dispatchId: 'dsp-0002', vendorId: 'ven-buildmart',
    projectId: 'proj-001', siteId: 'site-001', vehicle: 'CG04 CD 5678', challan: 'CH-9012',
    items: [{ materialId: 'mat-tiles', materialName: 'Vitrified Tiles', unit: 'Box', orderedQty: 400, receivedQty: 400, acceptedQty: 400, rejectedQty: 0, damagedQty: 0, batch: 'BATCH-TIL-01', location: 'Store Shed B' }],
    inspection: 'All boxes intact, batch numbers verified against invoice. No damage found.',
    photos: [], remarks: 'Clean receipt, advance procurement for flooring work.',
    status: 'ACCEPTED', createdBy: 'user-store', hodCheckedBy: 'user-pe', createdAt: D(-6),
  },
  {
    id: 'grn-0003', grnNumber: 'GRN-0003', poId: 'po-0006', dispatchId: 'dsp-0003', vendorId: 'ven-apex-hardware',
    projectId: 'proj-001', siteId: 'site-001', vehicle: 'CG04 EF 9012', challan: 'CH-9033',
    items: [{ materialId: 'mat-hardware', materialName: 'Hardware & Fasteners', unit: 'Lot', orderedQty: 12, receivedQty: 12, acceptedQty: 12, rejectedQty: 0, damagedQty: 0, batch: 'BATCH-HW-01', location: 'Store Shed A' }],
    inspection: 'Quantity and packaging verified by store. Pending PE sign-off.',
    photos: [], remarks: 'Awaiting HOD check before posting to stock.',
    status: 'HOD_CHECK', createdBy: 'user-store', createdAt: D(-1),
  },
]

export const STOCK_LEDGER_CHAIN: StockLedgerEntry[] = [
  { id: 'sl-grn-0001', date: D(-10), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 495, refDoc: 'GRN-0001', refId: 'grn-0001', userId: 'user-store', balanceAfter: 695 },
  { id: 'sl-iss-0001', date: D(-5), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -100, refDoc: 'ISS-0001', refId: 'iss-0001', userId: 'user-store', balanceAfter: 595 },
  { id: 'sl-iss-0002', date: D(-5), materialId: 'mat-steel', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -5, refDoc: 'ISS-0002', refId: 'iss-0002', userId: 'user-store', balanceAfter: 15 },
  { id: 'sl-iss-0003', date: D(-5), materialId: 'mat-sand', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -20, refDoc: 'ISS-0003', refId: 'iss-0003', userId: 'user-store', balanceAfter: 130 },
  { id: 'sl-iss-0004', date: D(-5), materialId: 'mat-aggregate', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -30, refDoc: 'ISS-0004', refId: 'iss-0004', userId: 'user-store', balanceAfter: 170 },
  { id: 'sl-grn-0002', date: D(-6), materialId: 'mat-tiles', projectId: 'proj-001', siteId: 'site-001', txnType: 'GRN', qty: 400, refDoc: 'GRN-0002', refId: 'grn-0002', userId: 'user-store', balanceAfter: 400 },
  { id: 'sl-ret-0001', date: D(-4), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'RETURN', qty: 10, refDoc: 'RET-0001', refId: 'ret-0001', userId: 'user-store', balanceAfter: 605 },
  { id: 'sl-iss-0005', date: D(-3), materialId: 'mat-cement', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -80, refDoc: 'ISS-0006', refId: 'iss-0006', userId: 'user-store', balanceAfter: 525 },
  { id: 'sl-iss-0006', date: D(-3), materialId: 'mat-steel', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -3, refDoc: 'ISS-0007', refId: 'iss-0007', userId: 'user-store', balanceAfter: 12 },
  { id: 'sl-ret-0002', date: D(-3), materialId: 'mat-sand', projectId: 'proj-001', siteId: 'site-001', txnType: 'RETURN', qty: 5, refDoc: 'RET-0003', refId: 'ret-0003', userId: 'user-store', balanceAfter: 135 },
  { id: 'sl-iss-0007', date: D(-2), materialId: 'mat-tiles', projectId: 'proj-001', siteId: 'site-001', txnType: 'ISSUE', qty: -50, refDoc: 'ISS-0005', refId: 'iss-0005', userId: 'user-store', balanceAfter: 350 },
]

export const STORE_ISSUES: StoreIssue[] = [
  { id: 'iss-0001', issueNumber: 'ISS-0001', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-003', materialId: 'mat-cement', qty: 100, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0002', issueNumber: 'ISS-0002', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-002', materialId: 'mat-steel', qty: 5, purpose: 'Column reinforcement - stirrups', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0003', issueNumber: 'ISS-0003', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-004', materialId: 'mat-sand', qty: 20, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0004', issueNumber: 'ISS-0004', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-005', materialId: 'mat-aggregate', qty: 30, purpose: 'Foundation concrete pour - Grid A1-A6', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-5), status: 'ISSUED' },
  { id: 'iss-0005', issueNumber: 'ISS-0005', projectId: 'proj-001', siteId: 'site-001', department: 'Finishing - Ground Floor', boqItemId: 'boq-009', materialId: 'mat-tiles', qty: 50, purpose: 'Flooring work - Lobby area', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-2), status: 'ISSUED' },
  { id: 'iss-0006', issueNumber: 'ISS-0006', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-003', materialId: 'mat-cement', qty: 80, purpose: 'Slab casting - First Floor', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-3), status: 'ISSUED' },
  { id: 'iss-0007', issueNumber: 'ISS-0007', projectId: 'proj-001', siteId: 'site-001', department: 'Site Execution - Block A', boqItemId: 'boq-002', materialId: 'mat-steel', qty: 3, purpose: 'First floor column reinforcement', requestedBy: 'user-pe', approvedBy: 'user-pe', issuedBy: 'user-store', date: D(-3), status: 'ISSUED' },
]

export const STORE_RETURNS: StoreReturn[] = [
  { id: 'ret-0001', returnNumber: 'RET-0001', projectId: 'proj-001', siteId: 'site-001', materialId: 'mat-cement', qty: 10, condition: 'GOOD', reason: 'Excess material from foundation pour returned to store', returnedBy: 'user-pe', receivedBy: 'user-store', status: 'RECEIVED', date: D(-4) },
  { id: 'ret-0002', returnNumber: 'RET-0002', projectId: 'proj-001', siteId: 'site-001', materialId: 'mat-steel', qty: 1, condition: 'GOOD', reason: 'Excess cut steel offcuts returned from column work', returnedBy: 'user-pe', status: 'REQUESTED', date: D(-1) },
  { id: 'ret-0003', returnNumber: 'RET-0003', projectId: 'proj-001', siteId: 'site-001', materialId: 'mat-sand', qty: 5, condition: 'GOOD', reason: 'Surplus sand from plaster mix returned to store', returnedBy: 'user-pe', receivedBy: 'user-store', status: 'RECEIVED', date: D(-3) },
]

export const STOCK_AUDITS: StockAudit[] = [
  { id: 'aud-0001', auditNumber: 'AUD-0001', projectId: 'proj-001', siteId: 'site-001', date: D(-30), auditedBy: 'user-store', lines: [ { materialId: 'mat-cement', systemQty: 200, physicalQty: 198, variance: -2 }, { materialId: 'mat-bricks', systemQty: 3000, physicalQty: 3000, variance: 0 } ], status: 'COMPLETED' },
  { id: 'aud-0002', auditNumber: 'AUD-0002', projectId: 'proj-001', siteId: 'site-001', date: D(-15), auditedBy: 'user-store', lines: [ { materialId: 'mat-sand', systemQty: 130, physicalQty: 128, variance: -2 }, { materialId: 'mat-aggregate', systemQty: 170, physicalQty: 170, variance: 0 }, { materialId: 'mat-steel', systemQty: 15, physicalQty: 15, variance: 0 } ], status: 'COMPLETED' },
]

export const DEBIT_NOTES: DebitNote[] = [
  { id: 'dn-0001', debitNoteNumber: 'DN-0001', vendorId: 'ven-shree-cement', grnId: 'grn-0001', poId: 'po-0001', reason: 'REJECTED_MATERIAL', amount: 5 * po1Rate, status: 'ADJUSTED', createdAt: D(-9), remarks: '5 bags of cement rejected at GRN due to moisture damage in transit. Amount adjusted against vendor payment.' },
  { id: 'dn-0002', debitNoteNumber: 'DN-0002', vendorId: 'ven-buildmart', poId: 'po-0004', reason: 'RATE_DIFFERENCE', amount: 8500, status: 'DRAFT', createdAt: D(-1), remarks: 'Rate discrepancy identified between quoted and invoiced sand rate on a prior delivery - pending approval.' },
]

export const FREIGHT_RECORDS: Freight[] = [
  { id: 'frt-0001', freightNumber: 'FRT-0001', poId: 'po-0001', vendorId: 'ven-shree-cement', transporter: 'Bharat Road Carriers', vehicle: 'CG04 AB 1234', distance: 45, freightRate: 44.4, amount: 2000, invoiceNumber: 'FRT-INV-0452', approvalStatus: 'APPROVED', paymentStatus: 'PAID' },
  { id: 'frt-0002', freightNumber: 'FRT-0002', poId: 'po-0002', vendorId: 'ven-buildmart', transporter: 'Bharat Road Carriers', vehicle: 'CG04 CD 5678', distance: 45, freightRate: 7.5, amount: 3000, invoiceNumber: 'FRT-INV-0501', approvalStatus: 'APPROVED', paymentStatus: 'PAID' },
  { id: 'frt-0003', freightNumber: 'FRT-0003', poId: 'po-0006', vendorId: 'ven-apex-hardware', transporter: 'Apex Logistics', vehicle: 'CG04 EF 9012', distance: 12, freightRate: 41.7, amount: 500, invoiceNumber: 'FRT-INV-0522', approvalStatus: 'PENDING', paymentStatus: 'PENDING' },
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
  {
    id: 'vb-0002', billNumber: 'VB-0002', poId: 'po-0002', grnId: 'grn-0002', vendorId: 'ven-buildmart', projectId: 'proj-001',
    invoiceNumber: 'BM/2026/1187', invoiceAmount: 400 * 720 * 1.18, poAmount: 400 * 720 * 1.18, grnAmount: 400 * 720 * 1.18,
    matchStatus: 'MATCHED', status: 'ACCOUNTS_VERIFIED', createdAt: D(-5),
    approvalHistory: [
      step('ACCOUNTS', 'Priya Menon', 'SUBMITTED', 5, 'Vendor invoice received'),
      step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 4, '3-way match clean - quantities and amount matched exactly'),
    ],
  },
]

export const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo-0003', woNumber: 'WO-0003', subcontractorId: 'sub-abc-civil', projectId: 'proj-002', siteId: 'site-002', workPackage: 'Foundation & Civil Structure - Tower 1', scope: 'RCC foundation for Tower 1.', value: 12000000, startDate: D(-5), endDate: D(300), status: 'ACTIVE' },
  { id: 'wo-0001', woNumber: 'WO-0001', subcontractorId: 'sub-abc-civil', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Foundation & Civil Structure - Block A', scope: 'RCC foundation, columns and slab work for Block A as per approved drawings and BOQ items CIV-001/CIV-002.', value: 4500000, startDate: D(-190), endDate: D(120), status: 'ACTIVE' },
  { id: 'wo-0002', woNumber: 'WO-0002', subcontractorId: 'sub-shree-elec', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Electrical Rough-in - Block A', scope: 'Conduit laying and cabling for ground and first floor.', value: 1800000, startDate: D(-30), endDate: D(150), status: 'DRAFT' },
  { id: 'wo-0005', woNumber: 'WO-0005', subcontractorId: 'sub-modern-plumb', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Plumbing Rough-in - Block A', scope: 'Plumbing rough-in piping for ground and first floor as per approved layout.', value: 1200000, startDate: D(-25), endDate: D(160), status: 'ACTIVE' },
  { id: 'wo-0006', woNumber: 'WO-0006', subcontractorId: 'sub-royal-tiles', projectId: 'proj-001', siteId: 'site-001', workPackage: 'Tile Flooring - Ground & First Floor', scope: 'Vitrified tile flooring for lobby, common areas and first floor per BOQ FIN-001.', value: 2200000, startDate: D(-15), endDate: D(180), status: 'ACTIVE' },
]

export const MEASUREMENTS: Measurement[] = [
  { id: 'meas-0001', measurementNumber: 'MEAS-0001', projectId: 'proj-001', boqItemId: 'boq-001', subcontractorId: 'sub-abc-civil', workOrderId: 'wo-0001', previousQty: 175, currentQty: 45, cumulativeQty: 220, rate: 6200, amount: 45 * 6200, date: D(-4), measuredBy: 'user-pe', verifiedBy: 'user-pm', attachments: ['mb-page-22.pdf'], status: 'APPROVED' },
  { id: 'meas-0002', measurementNumber: 'MEAS-0002', projectId: 'proj-001', boqItemId: 'boq-001', subcontractorId: 'sub-abc-civil', workOrderId: 'wo-0001', previousQty: 220, currentQty: 38, cumulativeQty: 258, rate: 6200, amount: 38 * 6200, date: D(-2), measuredBy: 'user-pe', verifiedBy: 'user-pm', attachments: ['mb-page-23.pdf'], status: 'APPROVED' },
  { id: 'meas-0003', measurementNumber: 'MEAS-0003', projectId: 'proj-001', boqItemId: 'boq-001', subcontractorId: 'sub-abc-civil', workOrderId: 'wo-0001', previousQty: 258, currentQty: 25, cumulativeQty: 283, rate: 6200, amount: 25 * 6200, date: D(-1), measuredBy: 'user-pe', attachments: ['mb-page-24.pdf'], status: 'PE_VERIFIED' },
  { id: 'meas-0004', measurementNumber: 'MEAS-0004', projectId: 'proj-001', boqItemId: 'boq-008', subcontractorId: 'sub-modern-plumb', workOrderId: 'wo-0005', previousQty: 0, currentQty: 200, cumulativeQty: 200, rate: 350, amount: 200 * 350, date: D(-3), measuredBy: 'user-pe', verifiedBy: 'user-pm', attachments: [], status: 'APPROVED' },
  { id: 'meas-0005', measurementNumber: 'MEAS-0005', projectId: 'proj-001', boqItemId: 'boq-009', subcontractorId: 'sub-royal-tiles', workOrderId: 'wo-0006', previousQty: 0, currentQty: 150, cumulativeQty: 150, rate: 850, amount: 150 * 850, date: D(-2), measuredBy: 'user-pm', attachments: [], status: 'SUBMITTED' },
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
  {
    id: 'scb-0002', billNumber: 'SCB-0002', workOrderId: 'wo-0001', subcontractorId: 'sub-abc-civil', projectId: 'proj-001',
    measurementIds: ['meas-0002'], grossAmount: 38 * 6200, retention: Math.round(38 * 6200 * 0.05), advanceRecovery: 5000, penalty: 0, otherDeduction: 0, tax: 0,
    netPayable: 38 * 6200 - Math.round(38 * 6200 * 0.05) - 5000,
    status: 'ACCOUNTS_VERIFIED', createdAt: D(-2),
    approvalHistory: [
      step('SUBCONTRACTOR', 'Manoj Tiwari', 'SUBMITTED', 2),
      step('PE', 'Arjun Verma', 'VERIFIED', 2),
      step('PM', 'Suresh Nair', 'VERIFIED', 1),
      step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 1),
    ],
  },
  {
    id: 'scb-0003', billNumber: 'SCB-0003', workOrderId: 'wo-0005', subcontractorId: 'sub-modern-plumb', projectId: 'proj-001',
    measurementIds: ['meas-0004'], grossAmount: 200 * 350, retention: Math.round(200 * 350 * 0.05), advanceRecovery: 0, penalty: 0, otherDeduction: 0, tax: 0,
    netPayable: 200 * 350 - Math.round(200 * 350 * 0.05),
    status: 'SUBMITTED', createdAt: D(-2),
    approvalHistory: [step('PM', 'Suresh Nair', 'SUBMITTED', 2, 'Submitted on behalf of Modern Plumbing Works')],
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
  {
    id: 'pay-0003', paymentNumber: 'PAY-0003', type: 'SUBCONTRACTOR', refBillId: 'scb-0002', projectId: 'proj-001', payeeName: 'ABC Civil Works',
    amount: 38 * 6200 - Math.round(38 * 6200 * 0.05) - 5000, status: 'MD_APPROVAL_PENDING', createdAt: D(-1),
    approvalHistory: [step('ACCOUNTS', 'Priya Menon', 'VERIFIED', 1, 'Sent to payment queue for MD approval')],
  },
]

export const RA_BILLS: RABill[] = [
  { id: 'ra-0001', raNumber: 'RA-0001', projectId: 'proj-001', contractId: 'contract-001', measurementIds: ['meas-0001'], billedAmount: 4500000, certifiedAmount: 4300000, retention: 215000, deductions: 50000, netAmount: 4300000 - 215000 - 50000, invoiceNumber: 'INV-SKY-0001', receivedAmount: 3000000, status: 'RECEIVED', createdAt: D(-25) },
  { id: 'ra-0002', raNumber: 'RA-0002', projectId: 'proj-001', contractId: 'contract-001', measurementIds: ['meas-0002', 'meas-0004'], billedAmount: 850000, certifiedAmount: 800000, retention: 40000, deductions: 20000, netAmount: 800000 - 40000 - 20000, receivedAmount: 0, status: 'CERTIFIED', createdAt: D(-10) },
]

// ---------------------------------------------------------------------------
// Site Execution: DPR / Attendance / Equipment / Site Issues
// ---------------------------------------------------------------------------
export const DAILY_REPORTS: DailyReport[] = [
  {
    id: 'dpr-0003', dprNumber: 'DPR-0003', projectId: 'proj-002', siteId: 'site-002', date: D(-1), shift: 'DAY',
    weather: 'Clear', workArea: 'Excavation Area', boqItemId: 'boq-007', activity: 'Earthwork Excavation',
    plannedQty: 100, todayQty: 80, cumulativeQty: 80, labourCount: 15,
    equipmentUsed: ['Excavator EX-1'], materialsUsed: [],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-STR-004 Rev A',
    photos: [], remarks: 'Excavation started.', preparedBy: 'user-pe', status: 'APPROVED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1), step('PM', 'Suresh Nair', 'APPROVED', 1)],
  },
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
  {
    id: 'dpr-0004', dprNumber: 'DPR-0004', projectId: 'proj-001', siteId: 'site-001', date: D(-3), shift: 'DAY',
    weather: 'Clear', workArea: 'Foundation - Block A, Grid A1-A6', boqItemId: 'boq-001', activity: 'Slab Casting - First Floor',
    plannedQty: 40, todayQty: 35, cumulativeQty: 263, labourCount: 44,
    equipmentUsed: ['Concrete Mixer M1', 'Transit Mixer TM-3'],
    materialsUsed: [
      { materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', qty: 80, unit: 'Bags' },
      { materialId: 'mat-steel', materialName: 'Reinforcement Steel (TMT)', qty: 3, unit: 'MT' },
    ],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-STR-002 Rev B',
    photos: ['dpr-0004-slab-1.jpg'], remarks: 'First floor slab casting in progress, self-verified and submitted for PM review.',
    preparedBy: 'user-pe', status: 'PM_REVIEW',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 3), step('PE', 'Arjun Verma', 'VERIFIED', 3, 'Self-verified at site before submission')],
  },
  {
    id: 'dpr-0005', dprNumber: 'DPR-0005', projectId: 'proj-001', siteId: 'site-001', date: D(-2), shift: 'DAY',
    weather: 'Clear', workArea: 'Block A - First Floor', boqItemId: 'boq-001', activity: 'First Floor Column Casting',
    plannedQty: 30, todayQty: 28, cumulativeQty: 291, labourCount: 40, equipmentUsed: ['Concrete Mixer M1', 'Vibrator V2'],
    materialsUsed: [{ materialId: 'mat-cement', materialName: 'Cement (OPC 53 Grade)', qty: 60, unit: 'Bags' }],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-STR-002 Rev B',
    photos: [], remarks: 'Column casting completed for Grid A1-A6, first floor.', preparedBy: 'user-pe', status: 'APPROVED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 2), step('PE', 'Arjun Verma', 'VERIFIED', 2, 'Self-verified at site before submission'), step('PM', 'Suresh Nair', 'APPROVED', 1)],
  },
  {
    id: 'dpr-0006', dprNumber: 'DPR-0006', projectId: 'proj-001', siteId: 'site-001', date: D(-1), shift: 'DAY',
    weather: 'Clear', workArea: 'Block A - Ground Floor', boqItemId: 'boq-014', activity: 'Electrical Conduit Laying - Ground Floor',
    plannedQty: 500, todayQty: 420, cumulativeQty: 420, labourCount: 15, equipmentUsed: [],
    materialsUsed: [{ materialId: 'mat-cable', materialName: 'Electrical Cable (XLPE)', qty: 420, unit: 'Mtr' }],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-ELE-001 Rev A',
    photos: [], remarks: 'Conduit laying progressing on schedule.', preparedBy: 'user-pe', status: 'APPROVED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1), step('PE', 'Arjun Verma', 'VERIFIED', 1, 'Self-verified at site before submission'), step('PM', 'Suresh Nair', 'APPROVED', 1)],
  },
  {
    id: 'dpr-0007', dprNumber: 'DPR-0007', projectId: 'proj-001', siteId: 'site-001', date: D(-1), shift: 'DAY',
    weather: 'Cloudy', workArea: 'Block A - First Floor', boqItemId: 'boq-008', activity: 'Plumbing Rough-in - First Floor',
    plannedQty: 100, todayQty: 60, cumulativeQty: 60, labourCount: 10, equipmentUsed: [],
    materialsUsed: [{ materialId: 'mat-pvc', materialName: 'PVC Pipe 4 inch', qty: 40, unit: 'Nos' }],
    safetyIssues: 'None', siteIssues: 'Layout mismatch found against drawing near shaft 2.', delayReason: 'Awaiting revised plumbing layout clarification.',
    drawingRef: 'DRG-PLB-001 Rev A', photos: [], remarks: 'Progress slower than planned pending drawing clarification.',
    preparedBy: 'user-pe', status: 'CORRECTION_REQUIRED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1), step('PE', 'Arjun Verma', 'VERIFIED', 1, 'Self-verified at site before submission'), step('PM', 'Suresh Nair', 'SENT_BACK', 1, 'Please clarify shaft 2 layout mismatch with drawing DRG-PLB-001 before resubmitting')],
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

const laborCategoriesRecent: { category: string; count: number; wage: number }[] = [
  { category: 'Mason', count: 8, wage: 750 },
  { category: 'Helper', count: 14, wage: 550 },
  { category: 'Carpenter', count: 6, wage: 700 },
  { category: 'Electrician', count: 3, wage: 800 },
  { category: 'Plumber', count: 4, wage: 800 },
  { category: 'Operator', count: 2, wage: 900 },
]

export const ATTENDANCE: AttendanceRecord[] = [
  ...laborCategories.flatMap((cat, ci) =>
    Array.from({ length: cat.count }).map((_, i) => ({
      id: `att-${ci}-${i}`, personName: `${cat.category} ${i + 1}`, category: cat.category, isEmployee: false,
      projectId: 'proj-001', siteId: 'site-001', date: D(-5), inTime: '08:00', outTime: '18:00',
      status: 'PRESENT' as const, overtimeHours: i % 5 === 0 ? 2 : 0, wageRate: cat.wage, remarks: '',
    }))
  ),
  ...[-3, -2, -1].flatMap(offset =>
    laborCategoriesRecent.flatMap((cat, ci) =>
      Array.from({ length: cat.count }).map((_, i) => ({
        id: `att-d${Math.abs(offset)}-${ci}-${i}`, personName: `${cat.category} ${i + 1}`, category: cat.category, isEmployee: false,
        projectId: 'proj-001', siteId: 'site-001', date: D(offset), inTime: '08:00', outTime: '18:00',
        status: (i === 0 && offset === -1 ? 'LEAVE' : 'PRESENT') as AttendanceRecord['status'],
        overtimeHours: i % 6 === 0 ? 1.5 : 0, wageRate: cat.wage, remarks: '',
      }))
    )
  ),
]

export const EQUIPMENT_LOGS: EquipmentLog[] = [
  { id: 'eq-001', equipmentName: 'Concrete Mixer M1', equipmentType: 'Mixer', projectId: 'proj-001', siteId: 'site-001', date: D(-5), operator: 'Operator 1', hoursUsed: 8, status: 'RUNNING', remarks: 'Used for foundation pour' },
  { id: 'eq-002', equipmentName: 'Tower Crane TC-1', equipmentType: 'Crane', projectId: 'proj-001', siteId: 'site-001', date: D(-5), operator: 'Operator 2', hoursUsed: 6, status: 'RUNNING', remarks: '' },
  { id: 'eq-003', equipmentName: 'Transit Mixer TM-3', equipmentType: 'Transit Mixer', projectId: 'proj-001', siteId: 'site-001', date: D(-2), operator: 'Operator 3', hoursUsed: 0, status: 'BREAKDOWN', remarks: 'Hydraulic hose leak - under repair' },
  { id: 'eq-004', equipmentName: 'Concrete Mixer M1', equipmentType: 'Mixer', projectId: 'proj-001', siteId: 'site-001', date: D(-3), operator: 'Operator 1', hoursUsed: 7, status: 'RUNNING', remarks: 'Slab casting - First Floor' },
  { id: 'eq-005', equipmentName: 'Tower Crane TC-1', equipmentType: 'Crane', projectId: 'proj-001', siteId: 'site-001', date: D(-2), operator: 'Operator 2', hoursUsed: 5, status: 'RUNNING', remarks: 'Material hoisting - First Floor' },
  { id: 'eq-006', equipmentName: 'Bar Bending Machine', equipmentType: 'Reinforcement', projectId: 'proj-001', siteId: 'site-001', date: D(-2), operator: 'Operator 4', hoursUsed: 6, status: 'RUNNING', remarks: '' },
  { id: 'eq-007', equipmentName: 'Diesel Generator DG-1', equipmentType: 'Generator', projectId: 'proj-001', siteId: 'site-001', date: D(-1), operator: 'Operator 5', hoursUsed: 0, status: 'IDLE', remarks: 'On standby, grid power available' },
]

export const SITE_ISSUES: SiteIssue[] = [
  { id: 'sissue-001', issueNumber: 'SI-0001', projectId: 'proj-001', siteId: 'site-001', title: 'Concrete pump breakdown during pour', description: 'Pump failed for 30 minutes during Grid A1-A6 pour, resolved on site.', category: 'Equipment', severity: 'LOW', raisedBy: 'user-pe', status: 'RESOLVED', dueDate: D(-4), resolution: 'Backup pump arranged, pour completed without cold joint.', createdAt: D(-5) },
  { id: 'sissue-002', issueNumber: 'SI-0002', projectId: 'proj-001', siteId: 'site-001', title: 'Water logging near Block A entrance', description: 'Rainwater accumulation blocking material movement path.', category: 'Site Condition', severity: 'MEDIUM', raisedBy: 'user-pe', assignedTo: 'user-store', status: 'OPEN', dueDate: D(2), createdAt: D(-1) },
  { id: 'sissue-003', issueNumber: 'SI-0003', projectId: 'proj-001', siteId: 'site-001', title: 'Shaft 2 plumbing layout mismatch', description: 'Site-measured shaft dimensions do not match DRG-PLB-001 Rev A layout.', category: 'Design Query', severity: 'MEDIUM', raisedBy: 'user-pe', assignedTo: 'user-pm', status: 'IN_PROGRESS', dueDate: D(3), createdAt: D(-1) },
  { id: 'sissue-004', issueNumber: 'SI-0004', projectId: 'proj-001', siteId: 'site-001', title: 'Near-miss: unsecured scaffolding plank', description: 'Loose plank identified on first floor scaffolding during safety walk-around.', category: 'Safety', severity: 'HIGH', raisedBy: 'user-store', assignedTo: 'user-pe', status: 'RESOLVED', dueDate: D(-1), resolution: 'Plank secured and additional clamps installed same day.', createdAt: D(-2) },
  { id: 'sissue-005', issueNumber: 'SI-0005', projectId: 'proj-001', siteId: 'site-001', title: 'Access road blocked by material delivery truck', description: 'Truck parked at site entrance blocking movement of concrete pump for 45 minutes.', category: 'Site Condition', severity: 'LOW', raisedBy: 'user-store', status: 'RESOLVED', dueDate: D(-3), resolution: 'Truck relocated, site traffic plan shared with all vendors.', createdAt: D(-4) },
  { id: 'sissue-006', issueNumber: 'SI-0006', projectId: 'proj-001', siteId: 'site-001', title: 'Cement stock running low ahead of next pour', description: 'Current cement stock may fall short of the next scheduled slab pour if PO-0004 is delayed.', category: 'Material', severity: 'MEDIUM', raisedBy: 'user-store', assignedTo: 'user-proc', status: 'OPEN', dueDate: D(4), createdAt: D(-1) },
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
  {
    id: 'chk-0003', checklistNumber: 'CHK-0003', templateId: 'tmpl-siteopen', templateName: 'Site Opening Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-pe', createdAt: D(-190),
    items: [
      { itemId: 'i1', question: 'Site fencing/security in place', required: true, result: 'PASS', comment: '' },
      { itemId: 'i2', question: 'Approved drawings available at site', required: true, result: 'PASS', comment: '' },
      { itemId: 'i3', question: 'Statutory approvals displayed', required: false, result: 'PASS', comment: '' },
    ],
    status: 'CLOSED', supervisorVerifiedBy: 'user-store', peApprovedBy: 'user-pe',
  },
  {
    id: 'chk-0004', checklistNumber: 'CHK-0004', templateId: 'tmpl-daily', templateName: 'Daily Site Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-pe', createdAt: D(-1),
    items: [
      { itemId: 'i1', question: 'Housekeeping done', required: true, result: 'PASS', comment: '' },
      { itemId: 'i2', question: 'Toolbox talk conducted', required: true, result: 'PASS', comment: 'Conducted before shift start' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'chk-0005', checklistNumber: 'CHK-0005', templateId: 'tmpl-equipment', templateName: 'Equipment Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-store', createdAt: D(-1),
    items: [
      { itemId: 'i1', question: 'Equipment inspected before use', required: true, result: 'PENDING', comment: '' },
      { itemId: 'i2', question: 'Operator license verified', required: true, result: 'PENDING', comment: '' },
    ],
    status: 'ASSIGNED',
  },
  {
    id: 'chk-0006', checklistNumber: 'CHK-0006', templateId: 'tmpl-storeaudit', templateName: 'Store Audit Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-store', createdAt: D(-2),
    items: [
      { itemId: 'i1', question: 'Physical stock matches system stock', required: true, result: 'PASS', comment: 'Minor variance noted in AUD-0002' },
      { itemId: 'i2', question: 'Storage location labeled correctly', required: false, result: 'PENDING', comment: '' },
    ],
    status: 'IN_PROGRESS',
  },
  {
    id: 'chk-0007', checklistNumber: 'CHK-0007', templateId: 'tmpl-material', templateName: 'Material Receiving Checklist',
    projectId: 'proj-001', siteId: 'site-001', assignedTo: 'user-store', createdAt: D(-1),
    relatedModule: 'grn', relatedRecordId: 'grn-0003',
    items: [
      { itemId: 'i1', question: 'Delivery challan matches PO', required: true, result: 'PENDING', comment: '' },
      { itemId: 'i2', question: 'Quantity verified against PO', required: true, result: 'PENDING', comment: '' },
      { itemId: 'i3', question: 'Material quality visually acceptable', required: true, result: 'PENDING', comment: '' },
      { itemId: 'i4', question: 'Vehicle/driver details recorded', required: false, result: 'PENDING', comment: '' },
    ],
    status: 'ASSIGNED',
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
  { id: 'task-0005', taskId: 'TASK-0005', title: 'Organize hardware GRN inspection', description: 'Coordinate PE sign-off for GRN-0003 hardware delivery.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-pm', assignedTo: 'user-store', priority: 'HIGH', startDate: D(-1), dueDate: D(1), relatedModule: 'grn', relatedRecordId: 'grn-0003', status: 'ASSIGNED', progressPct: 0, escalated: false, createdAt: D(-1) },
  { id: 'task-0006', taskId: 'TASK-0006', title: 'Prepare RA-0002 documentation for client submission', description: 'Compile measurement sheets and cover letter for RA-0002 client certification.', projectId: 'proj-001', assignedBy: 'user-pm', assignedTo: 'user-bill', priority: 'NORMAL', startDate: D(-3), dueDate: D(4), relatedModule: 'raBills', relatedRecordId: 'ra-0002', status: 'IN_PROGRESS', progressPct: 40, escalated: false, createdAt: D(-3) },
  { id: 'task-0007', taskId: 'TASK-0007', title: 'Update drawing register with Rev B structural details', description: 'Log DRG-STR-002 Rev B and notify affected work orders.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-pm', assignedTo: 'user-pe', priority: 'NORMAL', startDate: D(-2), dueDate: D(5), relatedModule: 'drawings', relatedRecordId: 'drw-002', status: 'ACCEPTED', progressPct: 10, escalated: false, createdAt: D(-2) },
  { id: 'task-0008', taskId: 'TASK-0008', title: 'Negotiate revised rates with Apex Hardware Traders', description: 'Discuss volume discount for upcoming hardware requirements.', projectId: 'proj-001', assignedBy: 'user-pm', assignedTo: 'user-proc', priority: 'LOW', startDate: D(-1), dueDate: D(10), relatedModule: 'vendors', status: 'ASSIGNED', progressPct: 0, escalated: false, createdAt: D(-1) },
  { id: 'task-0009', taskId: 'TASK-0009', title: 'Reconcile Tally entries for September', description: 'Cross-check all posted vouchers against bank statement.', projectId: 'proj-001', assignedBy: 'user-md', assignedTo: 'user-acc', priority: 'NORMAL', startDate: D(-5), dueDate: D(-1), relatedModule: 'tally', status: 'COMPLETED', progressPct: 100, escalated: false, createdAt: D(-5) },
  { id: 'task-0010', taskId: 'TASK-0010', title: 'Review and close overdue site issues', description: 'Follow up on all site issues past due date and update status.', projectId: 'proj-001', siteId: 'site-001', assignedBy: 'user-md', assignedTo: 'user-pm', priority: 'URGENT', startDate: D(-6), dueDate: D(-2), relatedModule: 'siteIssues', status: 'OVERDUE', progressPct: 30, escalated: true, reminderSentAt: D(-1), createdAt: D(-6) },
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
  { id: 'doc-0007', docNumber: 'DOC-0007', name: 'Royal Tiling & Flooring - Work Order Agreement', type: 'Contract', subcontractorId: 'sub-royal-tiles', relatedModule: 'workOrders', relatedRecordId: 'wo-0006', projectId: 'proj-001', version: 1, issueDate: D(-15), uploadedBy: 'user-pm', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'doc-0008', docNumber: 'DOC-0008', name: 'Modern Plumbing Works - Work Order Agreement', type: 'Contract', subcontractorId: 'sub-modern-plumb', relatedModule: 'workOrders', relatedRecordId: 'wo-0005', projectId: 'proj-001', version: 1, issueDate: D(-25), uploadedBy: 'user-pm', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'doc-0009', docNumber: 'DOC-0009', name: 'BuildMart Materials - GST Certificate', type: 'Vendor Compliance', vendorId: 'ven-buildmart', version: 1, issueDate: D(-200), expiryDate: D(45), uploadedBy: 'user-proc', approvedBy: 'user-pm', status: 'APPROVED' },
  { id: 'doc-0010', docNumber: 'DOC-0010', name: 'Apex Hardware Traders - PAN & GST Registration', type: 'Vendor Compliance', vendorId: 'ven-apex-hardware', version: 1, issueDate: D(-14), expiryDate: D(200), uploadedBy: 'user-proc', status: 'PENDING_APPROVAL' },
  { id: 'doc-0011', docNumber: 'DOC-0011', name: 'Fire NOC - Site Safety Compliance Certificate', type: 'Certificate', projectId: 'proj-001', version: 1, issueDate: D(-363), expiryDate: D(2), uploadedBy: 'user-acc', approvedBy: 'user-md', status: 'APPROVED' },
  { id: 'doc-0012', docNumber: 'DOC-0012', name: 'Structural Stability Certificate', type: 'Certificate', projectId: 'proj-001', relatedModule: 'drawings', relatedRecordId: 'drw-008', version: 1, issueDate: D(-20), expiryDate: D(500), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },
]

export const SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-0001', name: 'Tally Prime ERP License', provider: 'Tally Solutions', type: 'Software License', startDate: D(-353), endDate: D(12), renewalDate: D(12), cost: 24000, frequency: 'YEARLY', owner: 'user-acc', status: 'RENEWAL_DUE' },
  { id: 'sub-0002', name: 'AutoCAD Subscription', provider: 'Autodesk', type: 'Software License', startDate: D(-90), endDate: D(275), renewalDate: D(275), cost: 45000, frequency: 'YEARLY', owner: 'user-pe', projectId: 'proj-001', status: 'ACTIVE' },
  { id: 'sub-0003', name: 'Site Vehicle Insurance AMC', provider: 'ICICI Lombard', type: 'Insurance', startDate: D(-361), endDate: D(4), renewalDate: D(4), cost: 18500, frequency: 'YEARLY', owner: 'user-acc', projectId: 'proj-001', status: 'RENEWAL_DUE' },
  { id: 'sub-0004', name: 'Tower Crane AMC Service Contract', provider: 'L&T Construction Equipment', type: 'AMC', startDate: D(-185), endDate: D(180), renewalDate: D(180), cost: 120000, frequency: 'YEARLY', owner: 'user-pm', projectId: 'proj-001', status: 'ACTIVE' },
  { id: 'sub-0005', name: 'Microsoft 365 Business License', provider: 'Microsoft', type: 'Software License', startDate: D(-100), endDate: D(20), renewalDate: D(20), cost: 15000, frequency: 'MONTHLY', owner: 'user-acc', status: 'ACTIVE' },
  { id: 'sub-0006', name: 'Site CCTV Surveillance Service', provider: 'SecureView Systems', type: 'Service Contract', startDate: D(-356), endDate: D(9), renewalDate: D(9), cost: 36000, frequency: 'YEARLY', owner: 'user-acc', projectId: 'proj-001', status: 'RENEWAL_DUE' },
  { id: 'sub-0007', name: 'Diesel Generator AMC', provider: 'Kirloskar Power', type: 'AMC', startDate: D(-65), endDate: D(300), renewalDate: D(300), cost: 60000, frequency: 'YEARLY', owner: 'user-pm', projectId: 'proj-001', status: 'ACTIVE' },
]

const loanInstallments: LoanInstallment[] = Array.from({ length: 60 }).map((_, i) => {
  const dueOffset = -190 + i * 30
  let status: LoanInstallment['status'] = 'PENDING'
  if (i < 6) status = 'PAID'
  else if (i === 6) status = 'OVERDUE'
  return { id: `li-${i + 1}`, loanId: 'loan-0001', installmentNo: i + 1, dueDate: D(dueOffset), amount: 168000, paidDate: i < 6 ? D(dueOffset + 2) : undefined, status }
})

const loan2Installments: LoanInstallment[] = Array.from({ length: 36 }).map((_, i) => {
  const dueOffset = -90 + i * 30
  const status: LoanInstallment['status'] = i < 3 ? 'PAID' : 'PENDING'
  return { id: `li2-${i + 1}`, loanId: 'loan-0002', installmentNo: i + 1, dueDate: D(dueOffset), amount: 487000, paidDate: i < 3 ? D(dueOffset + 1) : undefined, status }
})

export const LOANS: Loan[] = [
  { id: 'loan-0001', loanNumber: 'LOAN-0001', name: 'Concrete Batching Plant Equipment Loan', lender: 'HDFC Bank', principal: 8000000, interestRate: 9.5, startDate: D(-190), tenureMonths: 60, emiAmount: 168000, outstanding: 8000000 - 6 * 168000, status: 'ACTIVE', nocIssued: false },
  { id: 'loan-0002', loanNumber: 'LOAN-0002', name: 'Working Capital Term Loan', lender: 'State Bank of India', principal: 15000000, interestRate: 10.5, startDate: D(-90), tenureMonths: 36, emiAmount: 487000, outstanding: 15000000 - 3 * 487000, status: 'ACTIVE', nocIssued: false },
]
export const LOAN_INSTALLMENTS: LoanInstallment[] = [...loanInstallments, ...loan2Installments]

// ---------------------------------------------------------------------------
// Seeded notifications (unresolved items existing at "today")
// ---------------------------------------------------------------------------
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'ntf-0001', toUserId: 'user-store', title: 'Low stock alert', message: 'Fly Ash Bricks stock (3,000 Nos) is below reorder level (5,000 Nos) at Raipur Main Site.', module: 'inventory', relatedRecordId: 'mat-bricks', severity: 'WARNING', read: false, createdAt: D(-1) },
  { id: 'ntf-0002', toUserId: 'user-pe', title: 'Checklist failed', message: 'Safety Checklist CHK-0002 has a failed item: Fire extinguisher expired. Corrective action required.', module: 'checklist', relatedRecordId: 'chk-0002', severity: 'CRITICAL', read: false, createdAt: D(-1) },
  { id: 'ntf-0003', toUserId: 'user-pm', title: 'Delegation overdue', message: 'TASK-0003 (Monthly stock audit) is overdue by 10 days. Escalated.', module: 'delegation', relatedRecordId: 'task-0003', severity: 'WARNING', read: false, createdAt: D(-9) },
  { id: 'ntf-0004', toUserId: 'user-acc', title: 'Document expiring soon', message: 'Shree Cement Supplier GST Certificate expires in 6 days.', module: 'documents', relatedRecordId: 'doc-0003', severity: 'WARNING', read: false, createdAt: D(-1) },
  { id: 'ntf-0005', toUserId: 'user-md', title: 'Payment completed', message: 'PAY-0001 to Shree Cement Supplier posted to Tally (TV-0001).', module: 'payments', relatedRecordId: 'pay-0001', severity: 'INFO', read: true, createdAt: D(-5) },
  { id: 'ntf-0006', toRole: 'PM', title: 'Material indent pending approval', message: 'IND-0003 (River Sand) submitted by Arjun Verma awaiting your approval.', module: 'indents', relatedRecordId: 'ind-0003', severity: 'INFO', read: false, createdAt: D(-2) },
  { id: 'ntf-0007', toRole: 'PM', title: 'DPR pending approval', message: 'DPR-0004 (Slab Casting - First Floor) submitted for review.', module: 'dpr', relatedRecordId: 'dpr-0004', severity: 'INFO', read: false, createdAt: D(-3) },
  { id: 'ntf-0008', toRole: 'MD', title: 'Payment pending approval', message: 'PAY-0003 of ₹2,18,820 to ABC Civil Works is awaiting your approval.', module: 'payments', relatedRecordId: 'pay-0003', severity: 'WARNING', read: false, createdAt: D(-1) },
  { id: 'ntf-0009', toUserId: 'user-pe', title: 'Bill pending your verification', message: 'SCB-0003 (Modern Plumbing Works) submitted, awaiting PE verification.', module: 'subcontractorBills', relatedRecordId: 'scb-0003', severity: 'INFO', read: false, createdAt: D(-2) },
  { id: 'ntf-0010', toUserId: 'user-store', title: 'GRN pending inspection', message: 'GRN-0003 (Hardware & Fasteners) awaiting HOD check before posting to stock.', module: 'grn', relatedRecordId: 'grn-0003', severity: 'WARNING', read: false, createdAt: D(-1) },
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
  audit('MaterialIndent', 'ind-0004', 'IND-0004', 'Approved', 'user-pm', 'Suresh Nair', 'PM', 5, 'SUBMITTED', 'APPROVED', 'Required for upcoming slab pour'),
  audit('MaterialIndent', 'ind-0005', 'IND-0005', 'Rejected', 'user-pm', 'Suresh Nair', 'PM', 7, 'SUBMITTED', 'REJECTED', 'Quantity exceeds monthly consumption rate'),
  audit('MaterialIndent', 'ind-0006', 'IND-0006', 'Sent Back for Correction', 'user-pm', 'Suresh Nair', 'PM', 3, 'SUBMITTED', 'CORRECTION_REQUIRED', 'Cable gauge breakdown required'),
  audit('MaterialIndent', 'ind-0003', 'IND-0003', 'Created & Submitted', 'user-pe', 'Arjun Verma', 'PE', 2, undefined, 'PM_REVIEW'),
  audit('Enquiry', 'rfq-0003', 'RFQ-0003', 'Vendor Selected', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 37, undefined, 'BuildMart Materials', 'Lowest landed cost, sample approved'),
  audit('PurchaseOrder', 'po-0002', 'PO-0002', 'Fully Received', 'user-store', 'Deepak Chauhan', 'STORE', 6, 'ISSUED', 'FULLY_RECEIVED'),
  audit('GRN', 'grn-0002', 'GRN-0002', 'HOD Check & Accepted', 'user-pe', 'Arjun Verma', 'PE', 6, 'INSPECTION', 'ACCEPTED', 'All 400 boxes accepted, no damage'),
  audit('StockLedger', 'sl-grn-0002', 'GRN-0002', 'Stock In', 'user-store', 'Deepak Chauhan', 'STORE', 6, '0', '400', 'Vitrified Tiles +400 boxes from GRN-0002'),
  audit('GRN', 'grn-0003', 'GRN-0003', 'GRN Created', 'user-store', 'Deepak Chauhan', 'STORE', 1, undefined, 'HOD_CHECK', 'Awaiting PE sign-off'),
  audit('PurchaseOrder', 'po-0003', 'PO-0003', 'PO Issued to Vendor', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 3, 'APPROVED', 'ISSUED'),
  audit('PurchaseOrder', 'po-0004', 'PO-0004', 'Created & Submitted', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 1, undefined, 'MGMT_APPROVAL_PENDING', 'Routed to PM+Accounts threshold'),
  audit('PurchaseOrder', 'po-0005', 'PO-0005', 'Created & Submitted', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 1, undefined, 'MGMT_APPROVAL_PENDING', 'Routed to PM+MD threshold'),
  audit('Measurement', 'meas-0002', 'MEAS-0002', 'PM Verified & Approved', 'user-pm', 'Suresh Nair', 'PM', 2, 'PE_VERIFIED', 'APPROVED'),
  audit('Measurement', 'meas-0003', 'MEAS-0003', 'Recorded (Self-Verified by PE)', 'user-pe', 'Arjun Verma', 'PE', 1, undefined, 'PE_VERIFIED'),
  audit('Measurement', 'meas-0004', 'MEAS-0004', 'PM Verified & Approved', 'user-pm', 'Suresh Nair', 'PM', 3, 'PE_VERIFIED', 'APPROVED'),
  audit('Measurement', 'meas-0005', 'MEAS-0005', 'Recorded by PM, Pending PE Verification', 'user-pm', 'Suresh Nair', 'PM', 2, undefined, 'SUBMITTED'),
  audit('SubcontractorBill', 'scb-0002', 'SCB-0002', 'Accounts Verified', 'user-acc', 'Priya Menon', 'ACCOUNTS', 1, 'PM_VERIFIED', 'ACCOUNTS_VERIFIED'),
  audit('SubcontractorBill', 'scb-0003', 'SCB-0003', 'Submitted', 'user-pm', 'Suresh Nair', 'PM', 2, undefined, 'SUBMITTED'),
  audit('VendorBill', 'vb-0002', 'VB-0002', '3-Way Match: Clean Match', 'user-acc', 'Priya Menon', 'ACCOUNTS', 4, 'PENDING', 'MATCHED'),
  audit('Payment', 'pay-0003', 'PAY-0003', 'Sent to Payment Queue', 'user-acc', 'Priya Menon', 'ACCOUNTS', 1, 'BILL_RECEIVED', 'MD_APPROVAL_PENDING'),
  audit('RABill', 'ra-0002', 'RA-0002', 'Certified by Client', 'user-bill', 'Anita Rao', 'BILLING', 10, 'SUBMITTED_TO_CLIENT', 'CERTIFIED'),
  audit('DebitNote', 'dn-0002', 'DN-0002', 'Debit Note Raised', 'user-acc', 'Priya Menon', 'ACCOUNTS', 1, undefined, 'DRAFT', 'Rate discrepancy on sand delivery'),
  audit('Document', 'doc-0010', 'DOC-0010', 'Uploaded', 'user-proc', 'Vikram Singh', 'PROCUREMENT', 14, undefined, 'PENDING_APPROVAL'),
  audit('Checklist', 'chk-0002', 'CHK-0002', 'Item Failed: Fire extinguisher expired', 'user-store', 'Deepak Chauhan', 'STORE', 1, 'PENDING', 'FAIL', 'Extinguisher near store shed found expired'),
  audit('Delegation', 'task-0010', 'TASK-0010', 'Escalated - Overdue', 'user-pm', 'Suresh Nair', 'PM', 1, 'IN_PROGRESS', 'OVERDUE', 'Due date passed without closure'),
]

// ---------------------------------------------------------------------------
// Live pending approvals — items actually sitting in the Approval Center /
// role dashboards today, so evaluators have real work to act on immediately.
// ---------------------------------------------------------------------------
function pendingTask(module: string, recordType: string, recordId: string, docNumber: string, title: string, amount: number | undefined, projectId: string, requesterId: string, requesterName: string, currentApproverRole: Role, priority: ApprovalTask['priority'], daysAgo: number): ApprovalTask {
  return { id: `apr-${recordId}-${currentApproverRole}`, module, recordType, recordId, docNumber, title, amount, projectId, requesterId, requesterName, currentApproverRole, priority, status: 'PENDING', createdAt: D(-daysAgo), history: [] }
}

export const APPROVAL_TASKS: ApprovalTask[] = [
  pendingTask('indent', 'MaterialIndent', 'ind-0003', 'IND-0003', 'Material Indent - River Sand (150 m3)', undefined, 'proj-001', 'user-pe', 'Arjun Verma', 'PM', 'NORMAL', 2),
  pendingTask('indent', 'MaterialIndent', 'ind-0009', 'IND-0009', 'Material Indent - Exterior Emulsion Paint (1200 Litre)', undefined, 'proj-001', 'user-pe', 'Arjun Verma', 'PM', 'LOW', 1),
  pendingTask('po', 'PurchaseOrder', 'po-0004', 'PO-0004', 'PO Approval - PO-0004 (₹1,76,325)', 176325, 'proj-001', 'user-proc', 'Vikram Singh', 'PM', 'HIGH', 1),
  pendingTask('po', 'PurchaseOrder', 'po-0004', 'PO-0004', 'PO Approval - PO-0004 (₹1,76,325)', 176325, 'proj-001', 'user-proc', 'Vikram Singh', 'ACCOUNTS', 'HIGH', 1),
  pendingTask('po', 'PurchaseOrder', 'po-0005', 'PO-0005', 'PO Approval - PO-0005 (₹6,12,375)', 612375, 'proj-001', 'user-proc', 'Vikram Singh', 'PM', 'URGENT', 1),
  pendingTask('po', 'PurchaseOrder', 'po-0005', 'PO-0005', 'PO Approval - PO-0005 (₹6,12,375)', 612375, 'proj-001', 'user-proc', 'Vikram Singh', 'MD', 'URGENT', 1),
  pendingTask('payment', 'Payment', 'pay-0003', 'PAY-0003', 'Payment Approval - PAY-0003 to ABC Civil Works (₹2,18,820)', 218820, 'proj-001', 'user-acc', 'Priya Menon', 'MD', 'HIGH', 1),
  pendingTask('dpr', 'DailyReport', 'dpr-0004', 'DPR-0004', 'DPR Review - DPR-0004 (Slab Casting - First Floor)', undefined, 'proj-001', 'user-pe', 'Arjun Verma', 'PM', 'NORMAL', 3),
  pendingTask('measurement', 'Measurement', 'meas-0003', 'MEAS-0003', 'Measurement Verification - MEAS-0003', 25 * 6200, 'proj-001', 'user-pe', 'Arjun Verma', 'PM', 'NORMAL', 1),
  pendingTask('measurement', 'Measurement', 'meas-0005', 'MEAS-0005', 'Measurement Verification - MEAS-0005', 150 * 850, 'proj-001', 'user-pm', 'Suresh Nair', 'PE', 'NORMAL', 2),
  pendingTask('subcontractorBill', 'SubcontractorBill', 'scb-0003', 'SCB-0003', 'Subcontractor Bill Verification - SCB-0003 (₹66,500)', 66500, 'proj-001', 'user-pm', 'Suresh Nair', 'PE', 'NORMAL', 2),
]

export const SEED_COUNTERS: Record<string, number> = {
  IND: 11, RFQ: 5, PO: 7, DSP: 4, GRN: 4, ISS: 8, RET: 4, AUD: 3, WO: 7, MEAS: 6, SCB: 4,
  VB: 3, PAY: 4, FRT: 4, DN: 3, RA: 3, DPR: 8, SI: 7, CHK: 8, TASK: 11, DOC: 13, LOAN: 3, BOQ: 15,
}
