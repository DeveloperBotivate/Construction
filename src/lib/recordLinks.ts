// Central map of recordType -> detail route, used by Traceability, Global Search, and Related Records panels.
const ROUTE_MAP: Record<string, string> = {
  Project: '/projects',
  Site: '/sites',
  BOQItem: '/boq',
  Drawing: '/drawings',
  MaterialIndent: '/indents',
  Enquiry: '/enquiries',
  PurchaseOrder: '/po',
  Dispatch: '/dispatch',
  GRN: '/grn',
  StoreIssue: '/store-issue',
  StoreReturn: '/store-return',
  DailyReport: '/dpr',
  SiteIssue: '/site-issues',
  ChecklistInstance: '/checklist',
  Delegation: '/delegation',
  WorkOrder: '/work-orders',
  Measurement: '/measurements',
  SubcontractorBill: '/subcontractor-bills',
  VendorBill: '/vendor-bills',
  Freight: '/freight',
  DebitNote: '/debit-notes',
  Payment: '/payments',
  RABill: '/ra-bills',
  AppDocument: '/documents',
  Document: '/documents',
  Subscription: '/subscriptions',
  Loan: '/loans',
}

export function recordLink(recordType: string, recordId?: string): string | null {
  if (!recordId) return null
  const base = ROUTE_MAP[recordType]
  if (!base) return null
  return `${base}/${recordId}`
}
