import type { Role } from '../types'

export type ModuleKey =
  | 'dashboard'
  | 'projects' | 'sites' | 'boq' | 'drawings' | 'planning'
  | 'dpr' | 'attendance' | 'labour' | 'equipment' | 'siteIssues'
  | 'indents' | 'enquiries' | 'quotations' | 'comparison' | 'techApproval' | 'mgmtApproval' | 'po' | 'lifting' | 'dispatch'
  | 'storeDashboard' | 'expectedDeliveries' | 'grn' | 'inventory' | 'stockLedger' | 'storeIssue' | 'storeReturn' | 'stockTransfer' | 'stockAudit'
  | 'subcontractors' | 'workOrders' | 'measurements'
  | 'clients' | 'contracts' | 'receivables'
  | 'threeWayMatch' | 'freight' | 'debitNotes' | 'expenses' | 'tally'
  | 'billsPayments'
  | 'documents' | 'documentApproval' | 'documentExpiry'
  | 'subscriptions' | 'loans'
  | 'checklist' | 'checklistTemplates' | 'delegation' | 'myTasks'
  | 'approvals'
  | 'reports'
  | 'traceability'
  | 'exceptions'
  | 'admin'

export const ALL_MODULES: ModuleKey[] = [
  'dashboard', 'projects', 'sites', 'boq', 'drawings', 'planning',
  'dpr', 'attendance', 'labour', 'equipment', 'siteIssues',
  'indents', 'enquiries', 'quotations', 'comparison', 'techApproval', 'mgmtApproval', 'po', 'lifting', 'dispatch',
  'storeDashboard', 'expectedDeliveries', 'grn', 'inventory', 'stockLedger', 'storeIssue', 'storeReturn', 'stockTransfer', 'stockAudit',
  'subcontractors', 'workOrders', 'measurements',
  'clients', 'contracts', 'receivables',
  'threeWayMatch', 'freight', 'debitNotes', 'expenses', 'tally',
  'billsPayments',
  'documents', 'documentApproval', 'documentExpiry',
  'subscriptions', 'loans',
  'checklist', 'checklistTemplates', 'delegation', 'myTasks',
  'approvals', 'reports', 'traceability', 'exceptions', 'admin',
]

// Modules visible to each role in the sidebar
export const ROLE_MODULES: Record<Role, ModuleKey[]> = {
  MD: ALL_MODULES,
  PM: [
    'dashboard', 'projects', 'sites', 'boq', 'drawings', 'planning',
    'dpr', 'attendance', 'labour', 'equipment', 'siteIssues',
    'indents', 'mgmtApproval', 'po',
    'subcontractors', 'workOrders', 'measurements', 'billsPayments',
    'checklist', 'checklistTemplates', 'delegation', 'myTasks',
    'approvals', 'reports', 'traceability', 'exceptions', 'documents',
  ],
  ACCOUNTS: [
    'dashboard', 'billsPayments', 'threeWayMatch', 'freight', 'debitNotes', 'expenses', 'tally',
    'receivables', 'loans', 'subscriptions',
    'approvals', 'reports', 'traceability', 'exceptions', 'documents', 'myTasks',
  ],
  BILLING: [
    'dashboard', 'clients', 'contracts', 'boq', 'measurements', 'billsPayments', 'receivables',
    'documents', 'reports', 'traceability', 'myTasks', 'approvals',
  ],
  PROCUREMENT: [
    'dashboard', 'indents', 'enquiries', 'quotations', 'comparison', 'techApproval', 'po', 'lifting', 'dispatch',
    'reports', 'traceability', 'myTasks', 'approvals', 'documents', 'exceptions',
  ],
  PE: [
    'dashboard', 'projects', 'sites', 'boq', 'drawings',
    'dpr', 'attendance', 'siteIssues', 'indents',
    'checklist', 'delegation', 'myTasks', 'measurements',
    'approvals', 'traceability', 'documents', 'reports',
  ],
  STORE: [
    'dashboard', 'storeDashboard', 'expectedDeliveries', 'grn', 'inventory', 'stockLedger',
    'storeIssue', 'storeReturn', 'stockTransfer', 'stockAudit',
    'attendance', 'checklist', 'myTasks', 'traceability', 'documents',
  ],
  VENDOR: ['dashboard', 'enquiries', 'quotations', 'po', 'dispatch', 'documents', 'myTasks'],
  SUBCONTRACTOR: ['dashboard', 'workOrders', 'measurements', 'billsPayments', 'documents', 'myTasks'],
}

export type Action = 'view' | 'create' | 'edit' | 'submit' | 'approve' | 'reject' | 'sendBack' | 'issue' | 'receive' | 'delete'

// Roles allowed to approve at each workflow gate (self-approval is blocked separately)
export const APPROVAL_GATES = {
  indentPM: ['PM', 'MD'] as Role[],
  poTechnical: ['PROCUREMENT', 'PM', 'MD'] as Role[],
  poManagement: ['PM', 'MD'] as Role[],
  poManagementHigh: ['MD'] as Role[],
  dprPE: ['PE'] as Role[],
  dprPM: ['PM', 'MD'] as Role[],
  measurementPE: ['PE'] as Role[],
  measurementPM: ['PM', 'MD'] as Role[],
  billAccounts: ['ACCOUNTS'] as Role[],
  billMD: ['MD'] as Role[],
  paymentMD: ['MD'] as Role[],
  documentApproval: ['PM', 'MD', 'ACCOUNTS'] as Role[],
  subscriptionApproval: ['MD', 'ACCOUNTS'] as Role[],
  loanApproval: ['MD'] as Role[],
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    MD: 'Managing Director',
    PM: 'Project Manager',
    ACCOUNTS: 'Accounts Manager',
    BILLING: 'Billing & Liaison Engineer',
    PROCUREMENT: 'Procurement Executive',
    PE: 'Project Engineer',
    STORE: 'Store Keeper / Supervisor',
    VENDOR: 'Vendor',
    SUBCONTRACTOR: 'Subcontractor',
  }
  return labels[role]
}

export function canAccessModule(role: Role, moduleKey: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(moduleKey)
}

// PO approval threshold routing per spec section 18
export function poApprovalRoute(total: number): 'PM' | 'PM_ACCOUNTS' | 'PM_MD' {
  if (total < 100000) return 'PM'
  if (total <= 500000) return 'PM_ACCOUNTS'
  return 'PM_MD'
}
