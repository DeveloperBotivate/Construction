// ============================================================================
// Construction ERP — Core Domain Types
// ============================================================================

export type Role =
  | 'MD'
  | 'PM'
  | 'ACCOUNTS'
  | 'BILLING'
  | 'PROCUREMENT'
  | 'PE'
  | 'STORE'
  | 'VENDOR'
  | 'SUBCONTRACTOR'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export interface User {
  id: string
  employeeId: string
  name: string
  email: string
  password: string
  role: Role
  phone: string
  designation: string
  reportsTo?: string
  projectIds: string[]
  siteIds: string[]
  active: boolean
}

export interface Comment {
  id: string
  recordType: string
  recordId: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

export interface AuditEntry {
  id: string
  recordType: string
  recordId: string
  recordNumber?: string
  action: string
  oldValue?: string
  newValue?: string
  userId: string
  userName: string
  role: Role
  timestamp: string
  reason?: string
}

export interface ApprovalStep {
  id: string
  approverRole: Role
  approverId?: string
  approverName?: string
  action: 'APPROVED' | 'REJECTED' | 'SENT_BACK' | 'SUBMITTED' | 'VERIFIED'
  comment?: string
  timestamp: string
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT_BACK'

export interface ApprovalTask {
  id: string
  module: string
  recordType: string
  recordId: string
  docNumber: string
  title: string
  amount?: number
  projectId?: string
  requesterId: string
  requesterName: string
  currentApproverRole: Role
  priority: Priority
  status: ApprovalStatus
  createdAt: string
  resolvedAt?: string
  history: ApprovalStep[]
}

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface AppNotification {
  id: string
  toRole?: Role
  toUserId?: string
  title: string
  message: string
  module: string
  relatedRecordId?: string
  relatedRecordType?: string
  severity: NotificationSeverity
  read: boolean
  createdAt: string
}

export type ExceptionType =
  | 'MATERIAL_REJECTION'
  | 'PO_GRN_MISMATCH'
  | 'INVOICE_MISMATCH'
  | 'OVER_PROCUREMENT'
  | 'DELAYED_DELIVERY'
  | 'FAILED_CHECKLIST'
  | 'OVERDUE_DELEGATION'
  | 'EXPIRED_DOCUMENT'
  | 'EXPIRED_SUBSCRIPTION'
  | 'BUDGET_OVERRUN'
  | 'LOW_STOCK'
  | 'PAYMENT_PENDING'
  | 'DPR_PENDING'

export interface ExceptionRecord {
  id: string
  type: ExceptionType
  severity: Severity
  module: string
  recordId?: string
  recordType?: string
  projectId?: string
  description: string
  owner: Role
  dueDate?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

// ---------------------------------------------------------------------------
// Project / Site / BOQ / Drawings
// ---------------------------------------------------------------------------

export type ProjectStatus = 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'DELAYED' | 'COMPLETED' | 'CLOSED'

export interface Project {
  id: string
  code: string
  name: string
  client: string
  contractValue: number
  budget: number
  actualCost: number
  startDate: string
  endDate: string
  status: ProjectStatus
  progressPct: number
  pmId: string
  location: string
  description: string
}

export type SiteStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED'

export interface Site {
  id: string
  projectId: string
  name: string
  code: string
  address: string
  geoLocation: string
  peId: string
  storeKeeperId: string
  status: SiteStatus
}

export type BOQStatus = 'ACTIVE' | 'REVISED' | 'CLOSED'

export interface BOQItem {
  id: string
  boqNumber: string
  projectId: string
  section: string
  itemCode: string
  description: string
  unit: string
  contractQty: number
  rate: number
  contractAmount: number
  revisedQty: number
  consumedQty: number
  status: BOQStatus
}

export type DrawingStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'SUPERSEDED'

export interface Drawing {
  id: string
  drawingNumber: string
  projectId: string
  name: string
  discipline: string
  revision: string
  issueDate: string
  uploadedBy: string
  approvedBy?: string
  status: DrawingStatus
  supersedes?: string
}

// ---------------------------------------------------------------------------
// Site Execution: DPR, Attendance, Labour/Equipment, Site Issues
// ---------------------------------------------------------------------------

export type DPRStatus = 'DRAFT' | 'SUBMITTED' | 'PE_REVIEW' | 'PM_REVIEW' | 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED'

export interface MaterialUsageLine {
  materialId: string
  materialName: string
  qty: number
  unit: string
}

export interface DailyReport {
  id: string
  dprNumber: string
  projectId: string
  siteId: string
  date: string
  shift: 'DAY' | 'NIGHT'
  weather: string
  workArea: string
  boqItemId: string
  activity: string
  plannedQty: number
  todayQty: number
  cumulativeQty: number
  labourCount: number
  equipmentUsed: string[]
  materialsUsed: MaterialUsageLine[]
  safetyIssues: string
  siteIssues: string
  delayReason: string
  drawingRef: string
  photos: string[]
  remarks: string
  preparedBy: string
  status: DPRStatus
  approvalHistory: ApprovalStep[]
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY'

export interface AttendanceRecord {
  id: string
  personName: string
  category: string
  isEmployee: boolean
  projectId: string
  siteId: string
  date: string
  inTime?: string
  outTime?: string
  status: AttendanceStatus
  overtimeHours: number
  wageRate: number
  remarks: string
}

export interface EquipmentLog {
  id: string
  equipmentName: string
  equipmentType: string
  projectId: string
  siteId: string
  date: string
  operator: string
  hoursUsed: number
  status: 'IDLE' | 'RUNNING' | 'MAINTENANCE' | 'BREAKDOWN'
  remarks: string
}

export type SiteIssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SiteIssue {
  id: string
  issueNumber: string
  projectId: string
  siteId: string
  title: string
  description: string
  category: string
  severity: Severity
  raisedBy: string
  assignedTo?: string
  status: SiteIssueStatus
  dueDate: string
  resolution?: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export interface ChecklistTemplateItem {
  id: string
  question: string
  required: boolean
}

export interface ChecklistTemplate {
  id: string
  name: string
  category: string
  items: ChecklistTemplateItem[]
  active: boolean
}

export type ChecklistItemResult = 'PENDING' | 'PASS' | 'FAIL' | 'NA'

export interface ChecklistItemExecution {
  itemId: string
  question: string
  required: boolean
  result: ChecklistItemResult
  comment: string
  photo?: string
  correctiveAction?: string
  rechecked?: boolean
}

export type ChecklistInstanceStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED_PENDING_CORRECTION'
  | 'SUPERVISOR_VERIFIED'
  | 'PE_APPROVED'
  | 'CLOSED'

export interface ChecklistInstance {
  id: string
  checklistNumber: string
  templateId: string
  templateName: string
  projectId: string
  siteId: string
  assignedTo: string
  items: ChecklistItemExecution[]
  status: ChecklistInstanceStatus
  supervisorVerifiedBy?: string
  peApprovedBy?: string
  createdAt: string
  relatedModule?: string
  relatedRecordId?: string
}

// ---------------------------------------------------------------------------
// Delegation / Tasks
// ---------------------------------------------------------------------------

export type DelegationStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'OVERDUE'

export interface Delegation {
  id: string
  taskId: string
  title: string
  description: string
  projectId?: string
  siteId?: string
  assignedBy: string
  assignedTo: string
  priority: Priority
  startDate: string
  dueDate: string
  relatedModule?: string
  relatedRecordId?: string
  status: DelegationStatus
  progressPct: number
  escalated: boolean
  reminderSentAt?: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Procurement Chain
// ---------------------------------------------------------------------------

export interface Material {
  id: string
  code: string
  name: string
  unit: string
  category: string
  reorderLevel: number
}

export type IndentStatus = 'DRAFT' | 'SUBMITTED' | 'PM_REVIEW' | 'APPROVED' | 'PROCUREMENT_PENDING' | 'REJECTED' | 'CORRECTION_REQUIRED' | 'CLOSED'

export interface MaterialIndent {
  id: string
  indentNumber: string
  projectId: string
  siteId: string
  boqItemId: string
  materialId: string
  requiredDate: string
  requiredQty: number
  unit: string
  priority: Priority
  purpose: string
  workArea: string
  drawingRef: string
  remarks: string
  attachments: string[]
  status: IndentStatus
  createdBy: string
  approvalHistory: ApprovalStep[]
  createdAt: string
}

export type RFQStatus = 'DRAFT' | 'SENT' | 'QUOTATION_RECEIVED' | 'TECHNICAL_REVIEW' | 'COMMERCIAL_REVIEW' | 'COMPARED' | 'VENDOR_SELECTED' | 'CLOSED'

export interface Enquiry {
  id: string
  rfqNumber: string
  indentId: string
  materialId: string
  qty: number
  unit: string
  vendorIds: string[]
  requiredDate: string
  quotationDueDate: string
  technicalRequirements: string
  remarks: string
  status: RFQStatus
  selectedVendorId?: string
  createdBy: string
  createdAt: string
}

export type QuotationTechStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface VendorQuotation {
  id: string
  rfqId: string
  vendorId: string
  rate: number
  tax: number
  freight: number
  deliveryDays: number
  brand: string
  specification: string
  validity: string
  paymentTerms: string
  documents: string[]
  technicalStatus: QuotationTechStatus
  technicalRemarks?: string
  submittedAt: string
}

export type POStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'TECHNICAL_APPROVED'
  | 'MGMT_APPROVAL_PENDING'
  | 'APPROVED'
  | 'ISSUED'
  | 'PARTIALLY_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CANCELLED'
  | 'CLOSED'
  | 'REJECTED'

export interface POLine {
  materialId: string
  materialName: string
  qty: number
  unit: string
  rate: number
  tax: number
  receivedQty: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  rfqId?: string
  indentId?: string
  vendorId: string
  projectId: string
  siteId: string
  items: POLine[]
  freight: number
  total: number
  deliveryLocation: string
  expectedDelivery: string
  paymentTerms: string
  warranty: string
  terms: string
  documents: string[]
  status: POStatus
  createdBy: string
  approvalHistory: ApprovalStep[]
  createdAt: string
}

export type DispatchStatus = 'READY_FOR_LIFTING' | 'LIFTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'AT_SITE' | 'RECEIVED'

export interface Dispatch {
  id: string
  dispatchNumber: string
  poId: string
  vendorId: string
  materialId: string
  qty: number
  vehicleNumber: string
  driver: string
  transporter: string
  dispatchDate: string
  challanNumber: string
  lrNumber: string
  expectedArrival: string
  documents: string[]
  photos: string[]
  status: DispatchStatus
}

// ---------------------------------------------------------------------------
// Store: GRN / Inventory / Issue / Return
// ---------------------------------------------------------------------------

export type GRNStatus = 'DRAFT' | 'INSPECTION' | 'HOD_CHECK' | 'ACCEPTED' | 'REJECTED' | 'RETURN' | 'DEBIT_NOTE_RAISED'

export interface GRNLine {
  materialId: string
  materialName: string
  unit: string
  orderedQty: number
  receivedQty: number
  acceptedQty: number
  rejectedQty: number
  damagedQty: number
  batch: string
  location: string
}

export interface GRN {
  id: string
  grnNumber: string
  poId: string
  dispatchId: string
  vendorId: string
  projectId: string
  siteId: string
  vehicle: string
  challan: string
  items: GRNLine[]
  inspection: string
  photos: string[]
  remarks: string
  status: GRNStatus
  createdBy: string
  hodCheckedBy?: string
  createdAt: string
}

export type StockTxnType = 'GRN' | 'TRANSFER_IN' | 'RETURN' | 'ISSUE' | 'TRANSFER_OUT' | 'DAMAGE'

export interface StockLedgerEntry {
  id: string
  date: string
  materialId: string
  projectId: string
  siteId: string
  txnType: StockTxnType
  qty: number
  refDoc: string
  refId: string
  userId: string
  balanceAfter: number
}

export type StoreIssueStatus = 'REQUESTED' | 'APPROVED' | 'ISSUED'

export interface StoreIssue {
  id: string
  issueNumber: string
  projectId: string
  siteId: string
  department: string
  boqItemId: string
  materialId: string
  qty: number
  purpose: string
  requestedBy: string
  approvedBy?: string
  issuedBy?: string
  date: string
  status: StoreIssueStatus
}

export type StoreReturnStatus = 'REQUESTED' | 'RECEIVED'

export interface StoreReturn {
  id: string
  returnNumber: string
  projectId: string
  siteId: string
  materialId: string
  qty: number
  condition: 'GOOD' | 'DAMAGED'
  reason: string
  returnedBy: string
  receivedBy?: string
  status: StoreReturnStatus
  date: string
}

export interface StockAudit {
  id: string
  auditNumber: string
  projectId: string
  siteId: string
  date: string
  auditedBy: string
  lines: { materialId: string; systemQty: number; physicalQty: number; variance: number }[]
  status: 'DRAFT' | 'COMPLETED'
}

// ---------------------------------------------------------------------------
// Subcontractors
// ---------------------------------------------------------------------------

export interface Subcontractor {
  id: string
  name: string
  trade: string
  contactPerson: string
  phone: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
}

export type WorkOrderStatus = 'DRAFT' | 'ISSUED' | 'ACTIVE' | 'COMPLETED' | 'CLOSED'

export interface WorkOrder {
  id: string
  woNumber: string
  subcontractorId: string
  projectId: string
  siteId: string
  workPackage: string
  scope: string
  value: number
  startDate: string
  endDate: string
  status: WorkOrderStatus
}

export type MeasurementStatus = 'DRAFT' | 'SUBMITTED' | 'PE_VERIFIED' | 'PM_VERIFIED' | 'APPROVED'

export interface Measurement {
  id: string
  measurementNumber: string
  projectId: string
  boqItemId: string
  subcontractorId?: string
  workOrderId?: string
  previousQty: number
  currentQty: number
  cumulativeQty: number
  rate: number
  amount: number
  date: string
  measuredBy: string
  verifiedBy?: string
  attachments: string[]
  status: MeasurementStatus
}

export type SubcontractorBillStatus = 'DRAFT' | 'SUBMITTED' | 'PE_VERIFIED' | 'PM_VERIFIED' | 'ACCOUNTS_VERIFIED' | 'MD_APPROVED' | 'PAID' | 'REJECTED'

export interface SubcontractorBill {
  id: string
  billNumber: string
  workOrderId: string
  subcontractorId: string
  projectId: string
  measurementIds: string[]
  grossAmount: number
  retention: number
  advanceRecovery: number
  penalty: number
  otherDeduction: number
  tax: number
  netPayable: number
  status: SubcontractorBillStatus
  approvalHistory: ApprovalStep[]
  createdAt: string
}

// ---------------------------------------------------------------------------
// Billing (Client side)
// ---------------------------------------------------------------------------

export interface Client {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
}

export interface Contract {
  id: string
  clientId: string
  projectId: string
  contractNumber: string
  value: number
  startDate: string
  retentionPct: number
}

export type RABillStatus = 'DRAFT' | 'INTERNAL_VERIFICATION' | 'SUBMITTED_TO_CLIENT' | 'CERTIFIED' | 'INVOICED' | 'RECEIVED'

export interface RABill {
  id: string
  raNumber: string
  projectId: string
  contractId: string
  measurementIds: string[]
  billedAmount: number
  certifiedAmount: number
  retention: number
  deductions: number
  netAmount: number
  invoiceNumber?: string
  receivedAmount: number
  status: RABillStatus
  createdAt: string
}

// ---------------------------------------------------------------------------
// Accounts: Vendor Bills / Freight / Debit Notes / Payments
// ---------------------------------------------------------------------------

export type MatchStatus = 'PENDING' | 'MATCHED' | 'MISMATCH'
export type VendorBillStatus =
  | 'RECEIVED'
  | 'DOCUMENT_CHECK'
  | 'THREE_WAY_MATCH'
  | 'HOLD'
  | 'ACCOUNTS_VERIFIED'
  | 'MD_APPROVAL_PENDING'
  | 'PAID'
  | 'TALLY_POSTED'
  | 'CLOSED'
  | 'REJECTED'

export interface VendorBill {
  id: string
  billNumber: string
  poId: string
  grnId: string
  vendorId: string
  projectId: string
  invoiceNumber: string
  invoiceAmount: number
  poAmount: number
  grnAmount: number
  matchStatus: MatchStatus
  mismatchReason?: string
  status: VendorBillStatus
  approvalHistory: ApprovalStep[]
  createdAt: string
}

export interface Freight {
  id: string
  freightNumber: string
  poId: string
  vendorId: string
  transporter: string
  vehicle: string
  distance: number
  freightRate: number
  amount: number
  invoiceNumber: string
  approvalStatus: ApprovalStatus
  paymentStatus: 'PENDING' | 'PAID'
}

export type DebitNoteReason = 'REJECTED_MATERIAL' | 'SHORTAGE' | 'DAMAGE' | 'PENALTY' | 'RATE_DIFFERENCE' | 'QUALITY_ISSUE'
export type DebitNoteStatus = 'DRAFT' | 'APPROVED' | 'VENDOR_NOTIFIED' | 'ADJUSTED' | 'CLOSED'

export interface DebitNote {
  id: string
  debitNoteNumber: string
  vendorId: string
  grnId?: string
  poId?: string
  reason: DebitNoteReason
  amount: number
  status: DebitNoteStatus
  createdAt: string
  remarks: string
}

export type PaymentType = 'VENDOR' | 'SUBCONTRACTOR' | 'CLIENT_RECEIPT'
export type PaymentStatus =
  | 'BILL_RECEIVED'
  | 'DOCUMENT_CHECK'
  | 'THREE_WAY_MATCH'
  | 'ACCOUNTS_VERIFIED'
  | 'MD_APPROVAL_PENDING'
  | 'PAID'
  | 'TALLY_POSTED'
  | 'CLOSED'

export interface Payment {
  id: string
  paymentNumber: string
  type: PaymentType
  refBillId: string
  projectId: string
  payeeName: string
  amount: number
  status: PaymentStatus
  paymentDate?: string
  paymentRef?: string
  tallyVoucherNumber?: string
  approvalHistory: ApprovalStep[]
  createdAt: string
}

// ---------------------------------------------------------------------------
// Documents / Subscriptions / Loans
// ---------------------------------------------------------------------------

export type DocumentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXPIRING_SOON' | 'EXPIRED' | 'ARCHIVED'

export interface AppDocument {
  id: string
  docNumber: string
  name: string
  type: string
  projectId?: string
  vendorId?: string
  subcontractorId?: string
  relatedModule?: string
  relatedRecordId?: string
  version: number
  issueDate: string
  expiryDate?: string
  uploadedBy: string
  approvedBy?: string
  status: DocumentStatus
}

export type SubscriptionStatus = 'ACTIVE' | 'RENEWAL_DUE' | 'EXPIRED' | 'RENEWED' | 'PENDING_APPROVAL'

export interface Subscription {
  id: string
  name: string
  provider: string
  type: string
  startDate: string
  endDate: string
  renewalDate: string
  cost: number
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME'
  owner: string
  projectId?: string
  status: SubscriptionStatus
}

export type LoanStatus = 'ACTIVE' | 'FORECLOSURE_REQUESTED' | 'FORECLOSURE_APPROVED' | 'CLOSED'

export interface Loan {
  id: string
  loanNumber: string
  name: string
  lender: string
  principal: number
  interestRate: number
  startDate: string
  tenureMonths: number
  emiAmount: number
  outstanding: number
  status: LoanStatus
  nocIssued: boolean
}

export interface LoanInstallment {
  id: string
  loanId: string
  installmentNo: number
  dueDate: string
  amount: number
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

export interface Vendor {
  id: string
  name: string
  category: string
  contactPerson: string
  phone: string
  email: string
  gstin: string
  rating: number
  status: 'ACTIVE' | 'INACTIVE'
}
