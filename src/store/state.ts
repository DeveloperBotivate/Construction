import type {
  User, Project, Site, BOQItem, Drawing, Material, Vendor, Subcontractor, Client, Contract,
  MaterialIndent, Enquiry, VendorQuotation, PurchaseOrder, Dispatch, GRN, StockLedgerEntry,
  StoreIssue, StoreReturn, StockAudit, WorkOrder, Measurement, SubcontractorBill, RABill,
  VendorBill, Freight, DebitNote, Payment, AppDocument, Subscription, Loan, LoanInstallment,
  DailyReport, AttendanceRecord, EquipmentLog, SiteIssue, ChecklistTemplate, ChecklistInstance,
  Delegation, AuditEntry, AppNotification, Comment, ApprovalTask,
} from '../types'

export interface ExceptionOverride {
  status: 'IN_PROGRESS' | 'RESOLVED'
  resolution?: string
  resolvedAt?: string
}

export interface AppData {
  users: User[]
  projects: Project[]
  sites: Site[]
  boqItems: BOQItem[]
  drawings: Drawing[]
  materials: Material[]
  vendors: Vendor[]
  subcontractors: Subcontractor[]
  clients: Client[]
  contracts: Contract[]

  materialIndents: MaterialIndent[]
  enquiries: Enquiry[]
  vendorQuotations: VendorQuotation[]
  purchaseOrders: PurchaseOrder[]
  dispatches: Dispatch[]

  grns: GRN[]
  stockLedger: StockLedgerEntry[]
  storeIssues: StoreIssue[]
  storeReturns: StoreReturn[]
  stockAudits: StockAudit[]

  workOrders: WorkOrder[]
  measurements: Measurement[]
  subcontractorBills: SubcontractorBill[]
  raBills: RABill[]

  vendorBills: VendorBill[]
  freightRecords: Freight[]
  debitNotes: DebitNote[]
  payments: Payment[]

  documents: AppDocument[]
  subscriptions: Subscription[]
  loans: Loan[]
  loanInstallments: LoanInstallment[]

  dailyReports: DailyReport[]
  attendance: AttendanceRecord[]
  equipmentLogs: EquipmentLog[]
  siteIssues: SiteIssue[]
  checklistTemplates: ChecklistTemplate[]
  checklistInstances: ChecklistInstance[]
  delegations: Delegation[]

  auditLog: AuditEntry[]
  notifications: AppNotification[]
  comments: Comment[]
  approvalTasks: ApprovalTask[]
  exceptionOverrides: Record<string, ExceptionOverride>

  counters: Record<string, number>
}
