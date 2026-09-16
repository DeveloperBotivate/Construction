const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/data/seed.ts');
let content = fs.readFileSync(file, 'utf8');

// Update Users
content = content.replace(/projectIds:\s*\['proj-001'\]/g, "projectIds: ['proj-001', 'proj-002']");
content = content.replace(/siteIds:\s*\['site-001'\]/g, "siteIds: ['site-001', 'site-002']");

// Add Project
const newProject = `  {
    id: 'proj-002', code: 'PRJ-002', name: 'XYZ Residential Tower', client: 'Skyline Developers Pvt Ltd',
    contractValue: 150000000, budget: 140000000, actualCost: 0, startDate: D(-10), endDate: D(700),
    status: 'ACTIVE', progressPct: 0, pmId: 'user-pm', location: 'Bhilai, Chhattisgarh',
    description: 'G+15 residential tower with premium amenities.',
  },
`;
content = content.replace(/export const PROJECTS: Project\[\] = \[\n/, "export const PROJECTS: Project[] = [\n" + newProject);

// Add Site
const newSite = `  { id: 'site-002', projectId: 'proj-002', name: 'Bhilai Site', code: 'SITE-BHL-01', address: 'Bhilai, Chhattisgarh', geoLocation: '21.1938 N, 81.3509 E', peId: 'user-pe', storeKeeperId: 'user-store', status: 'ACTIVE' },\n`;
content = content.replace(/export const SITES: Site\[\] = \[\n/, "export const SITES: Site[] = [\n" + newSite);

// Add Contract
const newContract = `  { id: 'contract-002', clientId: 'client-skyline', projectId: 'proj-002', contractNumber: 'CNT-SKY-2026-002', value: 150000000, startDate: D(-10), retentionPct: 5 },\n`;
content = content.replace(/export const CONTRACTS: Contract\[\] = \[\n/, "export const CONTRACTS: Contract[] = [\n" + newContract);

// Add BOQ
const newBoq = `  { id: 'boq-007', boqNumber: 'BOQ-007', projectId: 'proj-002', section: 'Civil - Structure', itemCode: 'CIV-001', description: 'Concrete M30 (RCC)', unit: 'm3', contractQty: 5000, rate: 6500, contractAmount: 32500000, revisedQty: 5000, consumedQty: 0, status: 'ACTIVE' },\n`;
content = content.replace(/export const BOQ_ITEMS: BOQItem\[\] = \[\n/, "export const BOQ_ITEMS: BOQItem[] = [\n" + newBoq);

// Add Drawings
const newDrawing = `  { id: 'drw-004', drawingNumber: 'DRG-STR-004', projectId: 'proj-002', name: 'Foundation Layout Plan', discipline: 'Structural', revision: 'Rev A', issueDate: D(-5), uploadedBy: 'user-pe', approvedBy: 'user-pm', status: 'APPROVED' },\n`;
content = content.replace(/export const DRAWINGS: Drawing\[\] = \[\n/, "export const DRAWINGS: Drawing[] = [\n" + newDrawing);

// Add Stock
const newStock = `  { id: 'sl-open-cement-2', date: D(-2), materialId: 'mat-cement', projectId: 'proj-002', siteId: 'site-002', txnType: 'GRN', qty: 50, refDoc: 'OPENING BALANCE', refId: 'OPENING', userId: 'user-store', balanceAfter: 50 },\n`;
content = content.replace(/export const STOCK_LEDGER: StockLedgerEntry\[\] = \[\n/, "export const STOCK_LEDGER: StockLedgerEntry[] = [\n" + newStock);

// Add Work Order
const newWO = `  { id: 'wo-0003', woNumber: 'WO-0003', subcontractorId: 'sub-abc-civil', projectId: 'proj-002', siteId: 'site-002', workPackage: 'Foundation & Civil Structure - Tower 1', scope: 'RCC foundation for Tower 1.', value: 12000000, startDate: D(-5), endDate: D(300), status: 'ACTIVE' },\n`;
content = content.replace(/export const WORK_ORDERS: WorkOrder\[\] = \[\n/, "export const WORK_ORDERS: WorkOrder[] = [\n" + newWO);

// Add Daily Report
const newDPR = `  {
    id: 'dpr-0003', dprNumber: 'DPR-0003', projectId: 'proj-002', siteId: 'site-002', date: D(-1), shift: 'DAY',
    weather: 'Clear', workArea: 'Excavation Area', boqItemId: 'boq-007', activity: 'Earthwork Excavation',
    plannedQty: 100, todayQty: 80, cumulativeQty: 80, labourCount: 15,
    equipmentUsed: ['Excavator EX-1'], materialsUsed: [],
    safetyIssues: 'None', siteIssues: '', delayReason: '', drawingRef: 'DRG-STR-004 Rev A',
    photos: [], remarks: 'Excavation started.', preparedBy: 'user-pe', status: 'APPROVED',
    approvalHistory: [step('PE', 'Arjun Verma', 'SUBMITTED', 1), step('PM', 'Suresh Nair', 'APPROVED', 1)],
  },\n`;
content = content.replace(/export const DAILY_REPORTS: DailyReport\[\] = \[\n/, "export const DAILY_REPORTS: DailyReport[] = [\n" + newDPR);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated seed.ts');
