import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppData } from './state'
import * as seed from '../data/seed'
import { genId, nowIso, seqNumber } from '../lib/utils'
import { poApprovalRoute } from '../lib/permissions'
import { getStockBalance, getOpenPOQty } from './selectors'
import type {
  User, Role, AuditEntry, AppNotification, ApprovalTask, ApprovalStep, Priority,
  MaterialIndent, Enquiry, VendorQuotation, PurchaseOrder, Dispatch, GRN, GRNLine,
  StoreIssue, StoreReturn, StockAudit, DailyReport, AttendanceRecord, EquipmentLog, SiteIssue,
  ChecklistTemplate, ChecklistInstance, ChecklistItemResult, Delegation, WorkOrder, Measurement,
  SubcontractorBill, VendorBill, Freight, DebitNote, Payment, AppDocument, Subscription, Loan,
  Project, Site, BOQItem, Drawing, Subcontractor, RABill,
} from '../types'

function initialData(): AppData {
  return {
    users: seed.USERS, projects: seed.PROJECTS, sites: seed.SITES, boqItems: seed.BOQ_ITEMS,
    drawings: seed.DRAWINGS, materials: seed.MATERIALS, vendors: seed.VENDORS, subcontractors: seed.SUBCONTRACTORS,
    clients: seed.CLIENTS, contracts: seed.CONTRACTS,
    materialIndents: seed.MATERIAL_INDENTS, enquiries: seed.ENQUIRIES, vendorQuotations: seed.VENDOR_QUOTATIONS,
    purchaseOrders: seed.PURCHASE_ORDERS, dispatches: seed.DISPATCHES,
    grns: seed.GRNS, stockLedger: [...seed.STOCK_LEDGER, ...seed.STOCK_LEDGER_CHAIN],
    storeIssues: seed.STORE_ISSUES, storeReturns: seed.STORE_RETURNS, stockAudits: seed.STOCK_AUDITS,
    workOrders: seed.WORK_ORDERS, measurements: seed.MEASUREMENTS, subcontractorBills: seed.SUBCONTRACTOR_BILLS,
    raBills: seed.RA_BILLS,
    vendorBills: seed.VENDOR_BILLS, freightRecords: seed.FREIGHT_RECORDS, debitNotes: seed.DEBIT_NOTES, payments: seed.PAYMENTS,
    documents: seed.DOCUMENTS, subscriptions: seed.SUBSCRIPTIONS, loans: seed.LOANS, loanInstallments: seed.LOAN_INSTALLMENTS,
    dailyReports: seed.DAILY_REPORTS, attendance: seed.ATTENDANCE, equipmentLogs: seed.EQUIPMENT_LOGS, siteIssues: seed.SITE_ISSUES,
    checklistTemplates: seed.CHECKLIST_TEMPLATES, checklistInstances: seed.CHECKLIST_INSTANCES, delegations: seed.DELEGATIONS,
    auditLog: seed.AUDIT_LOG, notifications: seed.NOTIFICATIONS, comments: [], approvalTasks: seed.APPROVAL_TASKS,
    exceptionOverrides: {}, counters: { ...seed.SEED_COUNTERS },
  }
}

function mkAudit(recordType: string, recordId: string, recordNumber: string, action: string, user: User, oldValue?: string, newValue?: string, reason?: string): AuditEntry {
  return { id: genId('AUD'), recordType, recordId, recordNumber, action, oldValue, newValue, userId: user.id, userName: user.name, role: user.role, timestamp: nowIso(), reason }
}

function mkNotif(opts: { toRole?: Role; toUserId?: string; title: string; message: string; module: string; relatedRecordId?: string; relatedRecordType?: string; severity?: AppNotification['severity'] }): AppNotification {
  return { id: genId('NTF'), read: false, createdAt: nowIso(), severity: opts.severity ?? 'INFO', ...opts }
}

function priorityFromAmount(amount: number): Priority {
  if (amount >= 500000) return 'URGENT'
  if (amount >= 100000) return 'HIGH'
  return 'NORMAL'
}

interface Actions {
  currentUser: User | null
  selectedProjectId: string
  selectedSiteId: string
  login: (idOrEmail: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  setSelectedProject: (id: string) => void
  setSelectedSite: (id: string) => void

  addComment: (recordType: string, recordId: string, text: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  resolveException: (id: string, resolution: string) => void
  reopenException: (id: string) => void

  approveTask: (taskId: string, comment?: string) => void
  rejectTask: (taskId: string, reason: string) => void
  sendBackTask: (taskId: string, reason: string) => void

  createProject: (data: Partial<Project>) => Project
  createSite: (data: Partial<Site>) => Site
  createBOQItem: (data: Partial<BOQItem>) => BOQItem
  createDrawing: (data: Partial<Drawing>) => Drawing
  approveDrawing: (id: string) => void

  createDailyReport: (data: Partial<DailyReport>) => DailyReport
  submitDPR: (id: string) => void
  resubmitDPR: (id: string) => void
  addAttendance: (data: Partial<AttendanceRecord>) => AttendanceRecord
  addEquipmentLog: (data: Partial<EquipmentLog>) => EquipmentLog
  createSiteIssue: (data: Partial<SiteIssue>) => SiteIssue
  resolveSiteIssue: (id: string, resolution: string) => void

  createChecklistTemplate: (data: Partial<ChecklistTemplate>) => ChecklistTemplate
  assignChecklist: (templateId: string, projectId: string, siteId: string, assignedTo: string, relatedModule?: string, relatedRecordId?: string) => ChecklistInstance
  updateChecklistItem: (checklistId: string, itemId: string, result: ChecklistItemResult, comment: string) => void
  addCorrectiveAction: (checklistId: string, itemId: string, action: string) => void
  recheckChecklistItem: (checklistId: string, itemId: string, result: ChecklistItemResult) => void
  supervisorVerifyChecklist: (checklistId: string) => void
  peApproveChecklist: (checklistId: string) => void

  createDelegation: (data: Partial<Delegation>) => Delegation
  acceptDelegation: (id: string) => void
  updateDelegationProgress: (id: string, pct: number) => void
  submitDelegation: (id: string) => void
  verifyDelegation: (id: string) => void
  completeDelegation: (id: string) => void

  createIndent: (data: Partial<MaterialIndent>) => MaterialIndent
  submitIndent: (id: string) => void
  resubmitIndent: (id: string) => void

  createEnquiry: (indentId: string, vendorIds: string[], quotationDueDate: string, technicalRequirements: string, remarks: string) => Enquiry
  addVendorQuotation: (rfqId: string, data: Partial<VendorQuotation>) => VendorQuotation
  technicalReviewQuotation: (quotationId: string, decision: 'APPROVED' | 'REJECTED', remarks: string) => void
  selectVendor: (rfqId: string, vendorId: string) => void

  createPO: (data: Partial<PurchaseOrder>) => PurchaseOrder
  submitPO: (id: string) => void
  issuePO: (id: string) => void
  cancelPO: (id: string, reason: string) => void

  createDispatch: (data: Partial<Dispatch>) => Dispatch
  markDispatchAtSite: (id: string) => void

  createGRN: (data: Partial<GRN> & { items: GRNLine[] }) => GRN
  hodCheckGRN: (id: string, decision: 'ACCEPTED' | 'REJECTED') => void

  createStoreIssueRequest: (data: Partial<StoreIssue>) => StoreIssue
  approveStoreIssue: (id: string) => void
  issueStoreIssue: (id: string) => void
  createStoreReturn: (data: Partial<StoreReturn>) => StoreReturn
  receiveStoreReturn: (id: string) => void
  createStockTransfer: (materialId: string, fromSiteId: string, toSiteId: string, qty: number, projectId: string) => void
  createStockAudit: (data: Partial<StockAudit>) => StockAudit
  completeStockAudit: (id: string) => void

  createSubcontractor: (data: Partial<Subcontractor>) => Subcontractor
  createWorkOrder: (data: Partial<WorkOrder>) => WorkOrder
  issueWorkOrder: (id: string) => void

  createMeasurement: (data: Partial<Measurement>) => Measurement

  createSubcontractorBill: (workOrderId: string, measurementIds: string[], deductions: { retention: number; advanceRecovery: number; penalty: number; otherDeduction: number; tax: number }) => SubcontractorBill
  submitSubcontractorBill: (id: string) => void

  createVendorBill: (data: Partial<VendorBill>) => VendorBill
  runThreeWayMatch: (id: string) => void
  verifyVendorBillAccounts: (id: string, approveException?: boolean) => void
  holdVendorBill: (id: string, reason: string) => void

  createFreight: (data: Partial<Freight>) => Freight
  approveFreight: (id: string) => void
  payFreight: (id: string) => void

  createDebitNote: (data: Partial<DebitNote>) => DebitNote
  approveDebitNote: (id: string) => void
  closeDebitNote: (id: string) => void

  sendBillToPaymentQueue: (billType: 'VENDOR' | 'SUBCONTRACTOR', billId: string) => Payment
  postPaymentToTally: (id: string) => void
  closePayment: (id: string) => void

  createRABill: (data: Partial<RABill>) => RABill
  submitRABillToClient: (id: string) => void
  certifyRABill: (id: string, certifiedAmount: number) => void
  recordReceivable: (id: string, amount: number) => void

  createDocument: (data: Partial<AppDocument>) => AppDocument
  approveDocument: (id: string) => void
  renewDocument: (id: string, newExpiry: string) => void

  createSubscription: (data: Partial<Subscription>) => Subscription
  renewSubscription: (id: string, newEndDate: string) => void

  createLoan: (data: Partial<Loan>) => Loan
  payInstallment: (loanId: string, installmentId: string) => void
  requestForeclosure: (loanId: string) => void
  approveForeclosure: (loanId: string) => void
}

export type Store = AppData & Actions

function raiseApproval(module: string, recordType: string, recordId: string, docNumber: string, title: string, amount: number | undefined, projectId: string | undefined, requester: User, approverRole: Role): ApprovalTask {
  return {
    id: genId('APR'), module, recordType, recordId, docNumber, title, amount, projectId,
    requesterId: requester.id, requesterName: requester.name, currentApproverRole: approverRole,
    priority: amount ? priorityFromAmount(amount) : 'NORMAL', status: 'PENDING', createdAt: nowIso(), history: [],
  }
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialData(),
      currentUser: null,
      selectedProjectId: 'proj-001',
      selectedSiteId: 'site-001',

      login: (idOrEmail, password) => {
        const user = get().users.find(u => (u.employeeId.toLowerCase() === idOrEmail.toLowerCase() || u.email.toLowerCase() === idOrEmail.toLowerCase()) && u.password === password)
        if (!user) return { ok: false, error: 'Invalid Employee ID/Email or Password.' }
        if (!user.active) return { ok: false, error: 'This account is inactive. Contact your administrator.' }
        set({ currentUser: user, selectedProjectId: user.projectIds[0] ?? '', selectedSiteId: user.siteIds[0] ?? '' })
        return { ok: true }
      },
      logout: () => set({ currentUser: null }),
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setSelectedSite: (id) => set({ selectedSiteId: id }),

      addComment: (recordType, recordId, text) => {
        const user = get().currentUser
        if (!user) return
        set(state => ({ comments: [...state.comments, { id: genId('CMT'), recordType, recordId, userId: user.id, userName: user.name, text, timestamp: nowIso() }] }))
      },
      markNotificationRead: (id) => set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllNotificationsRead: () => {
        const user = get().currentUser
        set(state => ({ notifications: state.notifications.map(n => (!n.toUserId || n.toUserId === user?.id) ? { ...n, read: true } : n) }))
      },
      resolveException: (id, resolution) => set(state => ({ exceptionOverrides: { ...state.exceptionOverrides, [id]: { status: 'RESOLVED', resolution, resolvedAt: nowIso() } } })),
      reopenException: (id) => set(state => { const ov = { ...state.exceptionOverrides }; delete ov[id]; return { exceptionOverrides: ov } }),

      // -----------------------------------------------------------------
      // Universal Approval Center resolution
      // -----------------------------------------------------------------
      approveTask: (taskId, comment) => {
        const state = get()
        const user = state.currentUser!
        const task = state.approvalTasks.find(t => t.id === taskId)
        if (!task || task.status !== 'PENDING') return
        if (task.requesterId === user.id) return
        const historyStep: ApprovalStep = { id: genId('ST'), approverRole: user.role, approverId: user.id, approverName: user.name, action: 'APPROVED', comment, timestamp: nowIso() }

        set(s => ({ approvalTasks: s.approvalTasks.map(t => t.id === taskId ? { ...t, history: [...t.history, historyStep] } : t) }))
        resolveModuleApproval(get, set, task, 'APPROVED', user, comment)
      },
      rejectTask: (taskId, reason) => {
        const state = get()
        const user = state.currentUser!
        const task = state.approvalTasks.find(t => t.id === taskId)
        if (!task || task.status !== 'PENDING') return
        if (task.requesterId === user.id) return
        if (!reason) return
        const historyStep: ApprovalStep = { id: genId('ST'), approverRole: user.role, approverId: user.id, approverName: user.name, action: 'REJECTED', comment: reason, timestamp: nowIso() }
        set(s => ({ approvalTasks: s.approvalTasks.map(t => t.id === taskId ? { ...t, history: [...t.history, historyStep] } : t) }))
        resolveModuleApproval(get, set, task, 'REJECTED', user, reason)
      },
      sendBackTask: (taskId, reason) => {
        const state = get()
        const user = state.currentUser!
        const task = state.approvalTasks.find(t => t.id === taskId)
        if (!task || task.status !== 'PENDING') return
        if (task.requesterId === user.id) return
        if (!reason) return
        const historyStep: ApprovalStep = { id: genId('ST'), approverRole: user.role, approverId: user.id, approverName: user.name, action: 'SENT_BACK', comment: reason, timestamp: nowIso() }
        set(s => ({ approvalTasks: s.approvalTasks.map(t => t.id === taskId ? { ...t, history: [...t.history, historyStep] } : t) }))
        resolveModuleApproval(get, set, task, 'SENT_BACK', user, reason)
      },

      // -----------------------------------------------------------------
      // Project / Site / BOQ / Drawings
      // -----------------------------------------------------------------
      createProject: (data) => {
        const project: Project = { id: genId('proj'), code: data.code ?? `PRJ-${genId('')}`, name: data.name ?? 'Untitled Project', client: data.client ?? '', contractValue: data.contractValue ?? 0, budget: data.budget ?? 0, actualCost: 0, startDate: data.startDate ?? nowIso(), endDate: data.endDate ?? nowIso(), status: 'DRAFT', progressPct: 0, pmId: data.pmId ?? get().currentUser!.id, location: data.location ?? '', description: data.description ?? '' }
        set(s => ({ projects: [...s.projects, project], auditLog: [...s.auditLog, mkAudit('Project', project.id, project.code, 'Created', get().currentUser!)] }))
        return project
      },
      createSite: (data) => {
        const site: Site = { id: genId('site'), projectId: data.projectId!, name: data.name ?? 'New Site', code: data.code ?? `SITE-${genId('')}`, address: data.address ?? '', geoLocation: data.geoLocation ?? '', peId: data.peId ?? '', storeKeeperId: data.storeKeeperId ?? '', status: 'ACTIVE' }
        set(s => ({ sites: [...s.sites, site], auditLog: [...s.auditLog, mkAudit('Site', site.id, site.code, 'Created', get().currentUser!)] }))
        return site
      },
      createBOQItem: (data) => {
        const n = nextNumber(set, get, 'BOQ')
        const item: BOQItem = { id: genId('boq'), boqNumber: n, projectId: data.projectId!, section: data.section ?? '', itemCode: data.itemCode ?? '', description: data.description ?? '', unit: data.unit ?? '', contractQty: data.contractQty ?? 0, rate: data.rate ?? 0, contractAmount: (data.contractQty ?? 0) * (data.rate ?? 0), revisedQty: data.contractQty ?? 0, consumedQty: 0, status: 'ACTIVE' }
        set(s => ({ boqItems: [...s.boqItems, item], auditLog: [...s.auditLog, mkAudit('BOQItem', item.id, item.boqNumber, 'Created', get().currentUser!)] }))
        return item
      },
      createDrawing: (data) => {
        const drawing: Drawing = { id: genId('drw'), drawingNumber: data.drawingNumber ?? `DRG-${genId('')}`, projectId: data.projectId!, name: data.name ?? '', discipline: data.discipline ?? 'Structural', revision: data.revision ?? 'Rev A', issueDate: nowIso(), uploadedBy: get().currentUser!.id, status: 'DRAFT', supersedes: data.supersedes }
        set(s => ({ drawings: [...s.drawings, drawing], auditLog: [...s.auditLog, mkAudit('Drawing', drawing.id, drawing.drawingNumber, 'Uploaded', get().currentUser!)] }))
        return drawing
      },
      approveDrawing: (id) => {
        const user = get().currentUser!
        set(s => ({
          drawings: s.drawings.map(d => {
            if (d.id !== id) return d
            if (d.supersedes) {
              // handled below
            }
            return { ...d, status: 'APPROVED', approvedBy: user.id }
          }),
          auditLog: [...s.auditLog, mkAudit('Drawing', id, s.drawings.find(d => d.id === id)?.drawingNumber ?? '', 'Approved', user)],
        }))
        const drw = get().drawings.find(d => d.id === id)
        if (drw?.supersedes) {
          set(s => ({ drawings: s.drawings.map(d => d.id === drw.supersedes ? { ...d, status: 'SUPERSEDED' } : d) }))
        }
      },

      // -----------------------------------------------------------------
      // Daily Report
      // -----------------------------------------------------------------
      createDailyReport: (data) => {
        const n = nextNumber(set, get, 'DPR')
        const dpr: DailyReport = {
          id: genId('dpr'), dprNumber: n, projectId: data.projectId!, siteId: data.siteId!, date: data.date ?? nowIso(),
          shift: data.shift ?? 'DAY', weather: data.weather ?? '', workArea: data.workArea ?? '', boqItemId: data.boqItemId ?? '',
          activity: data.activity ?? '', plannedQty: data.plannedQty ?? 0, todayQty: data.todayQty ?? 0, cumulativeQty: data.cumulativeQty ?? 0,
          labourCount: data.labourCount ?? 0, equipmentUsed: data.equipmentUsed ?? [], materialsUsed: data.materialsUsed ?? [],
          safetyIssues: data.safetyIssues ?? '', siteIssues: data.siteIssues ?? '', delayReason: data.delayReason ?? '',
          drawingRef: data.drawingRef ?? '', photos: data.photos ?? [], remarks: data.remarks ?? '', preparedBy: get().currentUser!.id,
          status: 'DRAFT', approvalHistory: [],
        }
        set(s => ({ dailyReports: [...s.dailyReports, dpr], auditLog: [...s.auditLog, mkAudit('DailyReport', dpr.id, dpr.dprNumber, 'Created (Draft)', get().currentUser!)] }))
        return dpr
      },
      submitDPR: (id) => {
        // PE self-verifies at submission (auto-recorded below) then routes straight to PM —
        // the site only has one PE account, so a blocking "PE reviews PE" stage would deadlock.
        const user = get().currentUser!
        const dpr = get().dailyReports.find(d => d.id === id)!
        const steps: ApprovalStep[] = [
          { id: genId('ST'), approverRole: 'PE', approverName: user.name, action: 'SUBMITTED', timestamp: nowIso() },
          { id: genId('ST'), approverRole: 'PE', approverName: user.name, action: 'VERIFIED', comment: 'Self-verified at site before submission', timestamp: nowIso() },
        ]
        set(s => ({
          dailyReports: s.dailyReports.map(d => d.id === id ? { ...d, status: 'PM_REVIEW', approvalHistory: [...d.approvalHistory, ...steps] } : d),
          auditLog: [...s.auditLog, mkAudit('DailyReport', id, dpr.dprNumber, 'Submitted & Self-Verified', user, 'DRAFT', 'PM_REVIEW')],
          approvalTasks: [...s.approvalTasks, raiseApproval('dpr', 'DailyReport', id, dpr.dprNumber, `DPR Review - ${dpr.dprNumber} (${dpr.activity})`, undefined, dpr.projectId, user, 'PM')],
          notifications: [...s.notifications, mkNotif({ toRole: 'PM', title: 'DPR pending approval', message: `${dpr.dprNumber} submitted for review.`, module: 'dpr', relatedRecordId: id })],
        }))
      },
      resubmitDPR: (id) => {
        const user = get().currentUser!
        const dpr = get().dailyReports.find(d => d.id === id)!
        set(s => ({
          dailyReports: s.dailyReports.map(d => d.id === id ? { ...d, status: 'PM_REVIEW' } : d),
          auditLog: [...s.auditLog, mkAudit('DailyReport', id, dpr.dprNumber, 'Resubmitted', user, 'CORRECTION_REQUIRED', 'PM_REVIEW')],
          approvalTasks: [...s.approvalTasks, raiseApproval('dpr', 'DailyReport', id, dpr.dprNumber, `DPR Review - ${dpr.dprNumber} (${dpr.activity})`, undefined, dpr.projectId, user, 'PM')],
        }))
      },
      addAttendance: (data) => {
        const rec: AttendanceRecord = { id: genId('att'), personName: data.personName ?? '', category: data.category ?? '', isEmployee: data.isEmployee ?? false, projectId: data.projectId!, siteId: data.siteId!, date: data.date ?? nowIso(), inTime: data.inTime, outTime: data.outTime, status: data.status ?? 'PRESENT', overtimeHours: data.overtimeHours ?? 0, wageRate: data.wageRate ?? 0, remarks: data.remarks ?? '' }
        set(s => ({ attendance: [...s.attendance, rec] }))
        return rec
      },
      addEquipmentLog: (data) => {
        const log: EquipmentLog = { id: genId('eq'), equipmentName: data.equipmentName ?? '', equipmentType: data.equipmentType ?? '', projectId: data.projectId!, siteId: data.siteId!, date: data.date ?? nowIso(), operator: data.operator ?? '', hoursUsed: data.hoursUsed ?? 0, status: data.status ?? 'RUNNING', remarks: data.remarks ?? '' }
        set(s => ({ equipmentLogs: [...s.equipmentLogs, log] }))
        return log
      },
      createSiteIssue: (data) => {
        const n = nextNumber(set, get, 'SI')
        const issue: SiteIssue = { id: genId('sissue'), issueNumber: n, projectId: data.projectId!, siteId: data.siteId!, title: data.title ?? '', description: data.description ?? '', category: data.category ?? 'General', severity: data.severity ?? 'MEDIUM', raisedBy: get().currentUser!.id, assignedTo: data.assignedTo, status: 'OPEN', dueDate: data.dueDate ?? nowIso(), createdAt: nowIso() }
        set(s => ({ siteIssues: [...s.siteIssues, issue], auditLog: [...s.auditLog, mkAudit('SiteIssue', issue.id, issue.issueNumber, 'Raised', get().currentUser!)] }))
        return issue
      },
      resolveSiteIssue: (id, resolution) => {
        const user = get().currentUser!
        set(s => ({ siteIssues: s.siteIssues.map(i => i.id === id ? { ...i, status: 'RESOLVED', resolution } : i), auditLog: [...s.auditLog, mkAudit('SiteIssue', id, s.siteIssues.find(i => i.id === id)?.issueNumber ?? '', 'Resolved', user, 'OPEN', 'RESOLVED', resolution)] }))
      },

      // -----------------------------------------------------------------
      // Checklist
      // -----------------------------------------------------------------
      createChecklistTemplate: (data) => {
        const tmpl: ChecklistTemplate = { id: genId('tmpl'), name: data.name ?? 'New Checklist', category: data.category ?? 'General', active: true, items: data.items ?? [] }
        set(s => ({ checklistTemplates: [...s.checklistTemplates, tmpl] }))
        return tmpl
      },
      assignChecklist: (templateId, projectId, siteId, assignedTo, relatedModule, relatedRecordId) => {
        const tmpl = get().checklistTemplates.find(t => t.id === templateId)!
        const n = nextNumber(set, get, 'CHK')
        const instance: ChecklistInstance = {
          id: genId('chk'), checklistNumber: n, templateId, templateName: tmpl.name, projectId, siteId, assignedTo,
          items: tmpl.items.map(i => ({ itemId: i.id, question: i.question, required: i.required, result: 'PENDING', comment: '' })),
          status: 'ASSIGNED', createdAt: nowIso(), relatedModule, relatedRecordId,
        }
        set(s => ({ checklistInstances: [...s.checklistInstances, instance], auditLog: [...s.auditLog, mkAudit('ChecklistInstance', instance.id, instance.checklistNumber, 'Assigned', get().currentUser!)], notifications: [...s.notifications, mkNotif({ toUserId: assignedTo, title: 'Checklist assigned', message: `${n} (${tmpl.name}) assigned to you.`, module: 'checklist', relatedRecordId: instance.id })] }))
        return instance
      },
      updateChecklistItem: (checklistId, itemId, result, comment) => {
        set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id !== checklistId ? c : { ...c, status: c.status === 'ASSIGNED' ? 'IN_PROGRESS' : c.status, items: c.items.map(i => i.itemId === itemId ? { ...i, result, comment } : i) }) }))
      },
      addCorrectiveAction: (checklistId, itemId, action) => {
        set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id !== checklistId ? c : { ...c, items: c.items.map(i => i.itemId === itemId ? { ...i, correctiveAction: action } : i) }) }))
      },
      recheckChecklistItem: (checklistId, itemId, result) => {
        set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id !== checklistId ? c : { ...c, items: c.items.map(i => i.itemId === itemId ? { ...i, result, rechecked: true } : i) }) }))
        const chk = get().checklistInstances.find(c => c.id === checklistId)!
        const stillFailing = chk.items.some(i => i.result === 'FAIL' && !i.rechecked)
        if (!stillFailing) set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id === checklistId ? { ...c, status: 'COMPLETED' } : c) }))
      },
      supervisorVerifyChecklist: (checklistId) => {
        const user = get().currentUser!
        set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id === checklistId ? { ...c, status: 'SUPERVISOR_VERIFIED', supervisorVerifiedBy: user.id } : c) }))
      },
      peApproveChecklist: (checklistId) => {
        const user = get().currentUser!
        set(s => ({ checklistInstances: s.checklistInstances.map(c => c.id === checklistId ? { ...c, status: 'CLOSED', peApprovedBy: user.id } : c), auditLog: [...s.auditLog, mkAudit('ChecklistInstance', checklistId, s.checklistInstances.find(c => c.id === checklistId)?.checklistNumber ?? '', 'PE Approved & Closed', user)] }))
      },

      // -----------------------------------------------------------------
      // Delegation
      // -----------------------------------------------------------------
      createDelegation: (data) => {
        const n = nextNumber(set, get, 'TASK')
        const task: Delegation = { id: genId('task'), taskId: n, title: data.title ?? '', description: data.description ?? '', projectId: data.projectId, siteId: data.siteId, assignedBy: get().currentUser!.id, assignedTo: data.assignedTo!, priority: data.priority ?? 'NORMAL', startDate: data.startDate ?? nowIso(), dueDate: data.dueDate ?? nowIso(), relatedModule: data.relatedModule, relatedRecordId: data.relatedRecordId, status: 'ASSIGNED', progressPct: 0, escalated: false, createdAt: nowIso() }
        set(s => ({ delegations: [...s.delegations, task], auditLog: [...s.auditLog, mkAudit('Delegation', task.id, task.taskId, 'Assigned', get().currentUser!)], notifications: [...s.notifications, mkNotif({ toUserId: task.assignedTo, title: 'New task assigned', message: `${n}: ${task.title}`, module: 'delegation', relatedRecordId: task.id })] }))
        return task
      },
      acceptDelegation: (id) => set(s => ({ delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'ACCEPTED' } : d) })),
      updateDelegationProgress: (id, pct) => set(s => ({ delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'IN_PROGRESS', progressPct: pct } : d) })),
      submitDelegation: (id) => set(s => ({ delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'SUBMITTED', progressPct: 100 } : d) })),
      verifyDelegation: (id) => set(s => ({ delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'VERIFIED' } : d) })),
      completeDelegation: (id) => {
        const user = get().currentUser!
        set(s => ({ delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'COMPLETED' } : d), auditLog: [...s.auditLog, mkAudit('Delegation', id, s.delegations.find(d => d.id === id)?.taskId ?? '', 'Completed', user)] }))
      },

      // -----------------------------------------------------------------
      // Material Indent
      // -----------------------------------------------------------------
      createIndent: (data) => {
        const n = nextNumber(set, get, 'IND')
        const indent: MaterialIndent = {
          id: genId('ind'), indentNumber: n, projectId: data.projectId!, siteId: data.siteId!, boqItemId: data.boqItemId!,
          materialId: data.materialId!, requiredDate: data.requiredDate ?? nowIso(), requiredQty: data.requiredQty ?? 0,
          unit: data.unit ?? '', priority: data.priority ?? 'NORMAL', purpose: data.purpose ?? '', workArea: data.workArea ?? '',
          drawingRef: data.drawingRef ?? '', remarks: data.remarks ?? '', attachments: data.attachments ?? [],
          status: 'DRAFT', createdBy: get().currentUser!.id, approvalHistory: [], createdAt: nowIso(),
        }
        set(s => ({ materialIndents: [...s.materialIndents, indent], auditLog: [...s.auditLog, mkAudit('MaterialIndent', indent.id, indent.indentNumber, 'Created (Draft)', get().currentUser!)] }))
        return indent
      },
      submitIndent: (id) => {
        const user = get().currentUser!
        const indent = get().materialIndents.find(i => i.id === id)!
        const step: ApprovalStep = { id: genId('ST'), approverRole: 'PE', approverName: user.name, action: 'SUBMITTED', timestamp: nowIso() }
        const mat = get().materials.find(m => m.id === indent.materialId)
        set(s => ({
          materialIndents: s.materialIndents.map(i => i.id === id ? { ...i, status: 'PM_REVIEW', approvalHistory: [...i.approvalHistory, step] } : i),
          auditLog: [...s.auditLog, mkAudit('MaterialIndent', id, indent.indentNumber, 'Submitted for PM Approval', user, 'DRAFT', 'PM_REVIEW')],
          approvalTasks: [...s.approvalTasks, raiseApproval('indent', 'MaterialIndent', id, indent.indentNumber, `Material Indent - ${mat?.name ?? ''} (${indent.requiredQty} ${indent.unit})`, undefined, indent.projectId, user, 'PM')],
          notifications: [...s.notifications, mkNotif({ toRole: 'PM', title: 'Indent pending approval', message: `${indent.indentNumber} submitted by ${user.name} for approval.`, module: 'indents', relatedRecordId: id })],
        }))
      },
      resubmitIndent: (id) => {
        const user = get().currentUser!
        const indent = get().materialIndents.find(i => i.id === id)!
        const mat = get().materials.find(m => m.id === indent.materialId)
        set(s => ({
          materialIndents: s.materialIndents.map(i => i.id === id ? { ...i, status: 'PM_REVIEW' } : i),
          auditLog: [...s.auditLog, mkAudit('MaterialIndent', id, indent.indentNumber, 'Resubmitted', user, 'CORRECTION_REQUIRED', 'PM_REVIEW')],
          approvalTasks: [...s.approvalTasks, raiseApproval('indent', 'MaterialIndent', id, indent.indentNumber, `Material Indent - ${mat?.name ?? ''} (${indent.requiredQty} ${indent.unit})`, undefined, indent.projectId, user, 'PM')],
        }))
      },

      // -----------------------------------------------------------------
      // Enquiry / RFQ / Quotation
      // -----------------------------------------------------------------
      createEnquiry: (indentId, vendorIds, quotationDueDate, technicalRequirements, remarks) => {
        const user = get().currentUser!
        const indent = get().materialIndents.find(i => i.id === indentId)!
        const n = nextNumber(set, get, 'RFQ')
        const enquiry: Enquiry = { id: genId('rfq'), rfqNumber: n, indentId, materialId: indent.materialId, qty: netRequirement(get(), indent), unit: indent.unit, vendorIds, requiredDate: indent.requiredDate, quotationDueDate, technicalRequirements, remarks, status: 'SENT', createdBy: user.id, createdAt: nowIso() }
        set(s => ({
          enquiries: [...s.enquiries, enquiry],
          materialIndents: s.materialIndents.map(i => i.id === indentId ? { ...i, status: 'PROCUREMENT_PENDING' } : i),
          auditLog: [...s.auditLog, mkAudit('Enquiry', enquiry.id, enquiry.rfqNumber, 'RFQ Created & Sent to Vendors', user, undefined, `${vendorIds.length} vendors`)],
        }))
        return enquiry
      },
      addVendorQuotation: (rfqId, data) => {
        const quote: VendorQuotation = { id: genId('vq'), rfqId, vendorId: data.vendorId!, rate: data.rate ?? 0, tax: data.tax ?? 0, freight: data.freight ?? 0, deliveryDays: data.deliveryDays ?? 0, brand: data.brand ?? '', specification: data.specification ?? '', validity: data.validity ?? nowIso(), paymentTerms: data.paymentTerms ?? '', documents: data.documents ?? [], technicalStatus: 'PENDING', submittedAt: nowIso() }
        set(s => ({ vendorQuotations: [...s.vendorQuotations, quote], enquiries: s.enquiries.map(e => e.id === rfqId ? { ...e, status: 'QUOTATION_RECEIVED' } : e) }))
        return quote
      },
      technicalReviewQuotation: (quotationId, decision, remarks) => {
        const user = get().currentUser!
        set(s => ({ vendorQuotations: s.vendorQuotations.map(q => q.id === quotationId ? { ...q, technicalStatus: decision, technicalRemarks: remarks } : q) }))
        const q = get().vendorQuotations.find(v => v.id === quotationId)!
        set(s => ({ auditLog: [...s.auditLog, mkAudit('VendorQuotation', quotationId, q.rfqId, `Technical Review - ${decision}`, user, 'PENDING', decision, remarks)] }))
      },
      selectVendor: (rfqId, vendorId) => {
        const user = get().currentUser!
        set(s => ({ enquiries: s.enquiries.map(e => e.id === rfqId ? { ...e, status: 'VENDOR_SELECTED', selectedVendorId: vendorId } : e), auditLog: [...s.auditLog, mkAudit('Enquiry', rfqId, s.enquiries.find(e => e.id === rfqId)?.rfqNumber ?? '', 'Vendor Selected', user)] }))
      },

      // -----------------------------------------------------------------
      // Purchase Order
      // -----------------------------------------------------------------
      createPO: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'PO')
        const items = (data.items ?? []).map(i => ({ ...i, receivedQty: 0 }))
        const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate * (1 + i.tax / 100), 0)
        const total = subtotal + (data.freight ?? 0)
        const po: PurchaseOrder = {
          id: genId('po'), poNumber: n, rfqId: data.rfqId, indentId: data.indentId, vendorId: data.vendorId!, projectId: data.projectId!, siteId: data.siteId!,
          items, freight: data.freight ?? 0, total, deliveryLocation: data.deliveryLocation ?? '', expectedDelivery: data.expectedDelivery ?? nowIso(),
          paymentTerms: data.paymentTerms ?? '30 days from GRN', warranty: data.warranty ?? 'NA', terms: data.terms ?? 'Standard purchase terms apply.',
          documents: [], status: 'DRAFT', createdBy: user.id, approvalHistory: [], createdAt: nowIso(),
        }
        set(s => ({ purchaseOrders: [...s.purchaseOrders, po], auditLog: [...s.auditLog, mkAudit('PurchaseOrder', po.id, po.poNumber, 'Created (Draft)', user)] }))
        return po
      },
      submitPO: (id) => {
        const user = get().currentUser!
        const po = get().purchaseOrders.find(p => p.id === id)!
        const route = poApprovalRoute(po.total)
        const roles: Role[] = route === 'PM' ? ['PM'] : route === 'PM_ACCOUNTS' ? ['PM', 'ACCOUNTS'] : ['PM', 'MD']
        const step: ApprovalStep = { id: genId('ST'), approverRole: 'PROCUREMENT', approverName: user.name, action: 'SUBMITTED', timestamp: nowIso() }
        const tasks = roles.map(r => raiseApproval('po', 'PurchaseOrder', id, po.poNumber, `PO Approval - ${po.poNumber} (₹${Math.round(po.total).toLocaleString('en-IN')})`, po.total, po.projectId, user, r))
        set(s => ({
          purchaseOrders: s.purchaseOrders.map(p => p.id === id ? { ...p, status: 'MGMT_APPROVAL_PENDING', approvalHistory: [...p.approvalHistory, step] } : p),
          auditLog: [...s.auditLog, mkAudit('PurchaseOrder', id, po.poNumber, 'Submitted for Approval', user, 'DRAFT', 'MGMT_APPROVAL_PENDING', `Approval route: ${route}`)],
          approvalTasks: [...s.approvalTasks, ...tasks],
          notifications: [...s.notifications, ...roles.map(r => mkNotif({ toRole: r, title: 'PO pending approval', message: `${po.poNumber} (₹${Math.round(po.total).toLocaleString('en-IN')}) submitted for approval.`, module: 'po', relatedRecordId: id }))],
        }))
      },
      issuePO: (id) => {
        const user = get().currentUser!
        const po = get().purchaseOrders.find(p => p.id === id)!
        set(s => ({
          purchaseOrders: s.purchaseOrders.map(p => p.id === id ? { ...p, status: 'ISSUED' } : p),
          auditLog: [...s.auditLog, mkAudit('PurchaseOrder', id, po.poNumber, 'Issued to Vendor', user, 'APPROVED', 'ISSUED')],
          notifications: [...s.notifications, mkNotif({ toRole: 'VENDOR', title: 'New Purchase Order issued', message: `${po.poNumber} issued to you.`, module: 'po', relatedRecordId: id })],
        }))
      },
      cancelPO: (id, reason) => {
        const user = get().currentUser!
        set(s => ({ purchaseOrders: s.purchaseOrders.map(p => p.id === id ? { ...p, status: 'CANCELLED' } : p), auditLog: [...s.auditLog, mkAudit('PurchaseOrder', id, s.purchaseOrders.find(p => p.id === id)?.poNumber ?? '', 'Cancelled', user, undefined, undefined, reason)] }))
      },

      // -----------------------------------------------------------------
      // Dispatch / Lifting
      // -----------------------------------------------------------------
      createDispatch: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'DSP')
        const dispatch: Dispatch = { id: genId('dsp'), dispatchNumber: n, poId: data.poId!, vendorId: data.vendorId!, materialId: data.materialId!, qty: data.qty ?? 0, vehicleNumber: data.vehicleNumber ?? '', driver: data.driver ?? '', transporter: data.transporter ?? '', dispatchDate: nowIso(), challanNumber: data.challanNumber ?? '', lrNumber: data.lrNumber ?? '', expectedArrival: data.expectedArrival ?? nowIso(), documents: data.documents ?? [], photos: data.photos ?? [], status: 'IN_TRANSIT' }
        set(s => ({ dispatches: [...s.dispatches, dispatch], auditLog: [...s.auditLog, mkAudit('Dispatch', dispatch.id, dispatch.dispatchNumber, 'Dispatch Created by Vendor', user, undefined, 'IN_TRANSIT')], notifications: [...s.notifications, mkNotif({ toRole: 'STORE', title: 'Material dispatched', message: `${n} dispatched, expected ${new Date(dispatch.expectedArrival).toLocaleDateString('en-IN')}.`, module: 'dispatch', relatedRecordId: dispatch.id })] }))
        return dispatch
      },
      markDispatchAtSite: (id) => set(s => ({ dispatches: s.dispatches.map(d => d.id === id ? { ...d, status: 'AT_SITE' } : d) })),

      // -----------------------------------------------------------------
      // GRN / Store In
      // -----------------------------------------------------------------
      createGRN: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'GRN')
        const grn: GRN = { id: genId('grn'), grnNumber: n, poId: data.poId!, dispatchId: data.dispatchId!, vendorId: data.vendorId!, projectId: data.projectId!, siteId: data.siteId!, vehicle: data.vehicle ?? '', challan: data.challan ?? '', items: data.items, inspection: data.inspection ?? '', photos: data.photos ?? [], remarks: data.remarks ?? '', status: 'HOD_CHECK', createdBy: user.id, createdAt: nowIso() }
        set(s => ({
          grns: [...s.grns, grn],
          dispatches: s.dispatches.map(d => d.id === grn.dispatchId ? { ...d, status: 'RECEIVED' } : d),
          auditLog: [...s.auditLog, mkAudit('GRN', grn.id, grn.grnNumber, 'GRN Created - Pending HOD Check', user)],
          notifications: [...s.notifications, mkNotif({ toRole: 'PE', title: 'GRN pending HOD check', message: `${n} awaiting inspection sign-off.`, module: 'grn', relatedRecordId: grn.id })],
        }))
        return grn
      },
      hodCheckGRN: (id, decision) => {
        const user = get().currentUser!
        const grn = get().grns.find(g => g.id === id)!
        const po = get().purchaseOrders.find(p => p.id === grn.poId)!

        set(s => ({
          grns: s.grns.map(g => g.id === id ? { ...g, status: decision, hodCheckedBy: user.id } : g),
          auditLog: [...s.auditLog, mkAudit('GRN', id, grn.grnNumber, `HOD Check - ${decision}`, user, 'HOD_CHECK', decision)],
        }))

        if (decision === 'ACCEPTED') {
          let bal = 0
          const ledgerEntries = grn.items.filter(l => l.acceptedQty > 0).map(l => {
            bal = getStockBalance(get(), l.materialId, grn.siteId) + l.acceptedQty
            return { id: genId('sl'), date: nowIso(), materialId: l.materialId, projectId: grn.projectId, siteId: grn.siteId, txnType: 'GRN' as const, qty: l.acceptedQty, refDoc: grn.grnNumber, refId: grn.id, userId: user.id, balanceAfter: bal }
          })
          const updatedItems = po.items.map(pi => {
            const line = grn.items.find(l => l.materialId === pi.materialId)
            return line ? { ...pi, receivedQty: pi.receivedQty + line.receivedQty } : pi
          })
          const fullyReceived = updatedItems.every(i => i.receivedQty >= i.qty)
          set(s => ({
            stockLedger: [...s.stockLedger, ...ledgerEntries],
            purchaseOrders: s.purchaseOrders.map(p => p.id === po.id ? { ...p, items: updatedItems, status: fullyReceived ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED' } : p),
            auditLog: [...s.auditLog, mkAudit('StockLedger', grn.id, grn.grnNumber, 'Stock In', user, undefined, `+${grn.items.reduce((a, l) => a + l.acceptedQty, 0)}`)],
            notifications: [...s.notifications, mkNotif({ toRole: 'PROCUREMENT', title: 'GRN accepted', message: `${grn.grnNumber} accepted, stock updated.`, module: 'grn', relatedRecordId: id })],
          }))

          const rejectedLines = grn.items.filter(l => l.rejectedQty > 0)
          if (rejectedLines.length > 0) {
            const dn: DebitNote = { id: genId('dn'), debitNoteNumber: nextNumber(set, get, 'DN'), vendorId: grn.vendorId, grnId: grn.id, poId: grn.poId, reason: 'REJECTED_MATERIAL', amount: rejectedLines.reduce((sum, l) => { const poLine = po.items.find(pi => pi.materialId === l.materialId); return sum + l.rejectedQty * (poLine?.rate ?? 0) }, 0), status: 'DRAFT', createdAt: nowIso(), remarks: `Auto-generated from ${grn.grnNumber}: ${rejectedLines.reduce((a, l) => a + l.rejectedQty, 0)} unit(s) rejected.` }
            set(s => ({ debitNotes: [...s.debitNotes, dn], auditLog: [...s.auditLog, mkAudit('DebitNote', dn.id, dn.debitNoteNumber, 'Auto-raised from GRN rejection', user)], notifications: [...s.notifications, mkNotif({ toRole: 'ACCOUNTS', title: 'Debit note raised', message: `${dn.debitNoteNumber} raised for rejected material on ${grn.grnNumber}.`, module: 'debitNotes', relatedRecordId: dn.id, severity: 'WARNING' })] }))
          }
        }
      },

      // -----------------------------------------------------------------
      // Store Issue / Return / Audit
      // -----------------------------------------------------------------
      createStoreIssueRequest: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'ISS')
        const issue: StoreIssue = { id: genId('iss'), issueNumber: n, projectId: data.projectId!, siteId: data.siteId!, department: data.department ?? '', boqItemId: data.boqItemId ?? '', materialId: data.materialId!, qty: data.qty ?? 0, purpose: data.purpose ?? '', requestedBy: user.id, date: nowIso(), status: 'REQUESTED' }
        set(s => ({ storeIssues: [...s.storeIssues, issue], auditLog: [...s.auditLog, mkAudit('StoreIssue', issue.id, issue.issueNumber, 'Requested', user)], notifications: [...s.notifications, mkNotif({ toRole: 'STORE', title: 'Store issue requested', message: `${n} requested for ${issue.qty} units.`, module: 'storeIssue', relatedRecordId: issue.id })] }))
        return issue
      },
      approveStoreIssue: (id) => {
        const user = get().currentUser!
        set(s => ({ storeIssues: s.storeIssues.map(i => i.id === id ? { ...i, approvedBy: user.id, status: 'APPROVED' } : i) }))
      },
      issueStoreIssue: (id) => {
        const user = get().currentUser!
        const issue = get().storeIssues.find(i => i.id === id)!
        const available = getStockBalance(get(), issue.materialId, issue.siteId)
        if (available < issue.qty) return
        const bal = available - issue.qty
        set(s => ({
          storeIssues: s.storeIssues.map(i => i.id === id ? { ...i, status: 'ISSUED', issuedBy: user.id } : i),
          stockLedger: [...s.stockLedger, { id: genId('sl'), date: nowIso(), materialId: issue.materialId, projectId: issue.projectId, siteId: issue.siteId, txnType: 'ISSUE', qty: -issue.qty, refDoc: issue.issueNumber, refId: issue.id, userId: user.id, balanceAfter: bal }],
          auditLog: [...s.auditLog, mkAudit('StoreIssue', id, issue.issueNumber, 'Issued', user, `${available}`, `${bal}`)],
        }))
      },
      createStoreReturn: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'RET')
        const ret: StoreReturn = { id: genId('ret'), returnNumber: n, projectId: data.projectId!, siteId: data.siteId!, materialId: data.materialId!, qty: data.qty ?? 0, condition: data.condition ?? 'GOOD', reason: data.reason ?? '', returnedBy: user.id, status: 'REQUESTED', date: nowIso() }
        set(s => ({ storeReturns: [...s.storeReturns, ret], auditLog: [...s.auditLog, mkAudit('StoreReturn', ret.id, ret.returnNumber, 'Return Requested', user)] }))
        return ret
      },
      receiveStoreReturn: (id) => {
        const user = get().currentUser!
        const ret = get().storeReturns.find(r => r.id === id)!
        const bal = getStockBalance(get(), ret.materialId, ret.siteId) + ret.qty
        set(s => ({
          storeReturns: s.storeReturns.map(r => r.id === id ? { ...r, status: 'RECEIVED', receivedBy: user.id } : r),
          stockLedger: [...s.stockLedger, { id: genId('sl'), date: nowIso(), materialId: ret.materialId, projectId: ret.projectId, siteId: ret.siteId, txnType: 'RETURN', qty: ret.qty, refDoc: ret.returnNumber, refId: ret.id, userId: user.id, balanceAfter: bal }],
          auditLog: [...s.auditLog, mkAudit('StoreReturn', id, ret.returnNumber, 'Received & Stock Updated', user)],
        }))
      },
      createStockTransfer: (materialId, fromSiteId, toSiteId, qty, projectId) => {
        const user = get().currentUser!
        const fromBal = getStockBalance(get(), materialId, fromSiteId) - qty
        const toBal = getStockBalance(get(), materialId, toSiteId) + qty
        const refDoc = seqNumber('TRF', get().counters.TRF ?? 1)
        set(s => ({ counters: { ...s.counters, TRF: (s.counters.TRF ?? 1) + 1 } }))
        set(s => ({
          stockLedger: [
            ...s.stockLedger,
            { id: genId('sl'), date: nowIso(), materialId, projectId, siteId: fromSiteId, txnType: 'TRANSFER_OUT', qty: -qty, refDoc, refId: refDoc, userId: user.id, balanceAfter: fromBal },
            { id: genId('sl'), date: nowIso(), materialId, projectId, siteId: toSiteId, txnType: 'TRANSFER_IN', qty, refDoc, refId: refDoc, userId: user.id, balanceAfter: toBal },
          ],
          auditLog: [...s.auditLog, mkAudit('StockLedger', refDoc, refDoc, 'Stock Transfer', user, fromSiteId, toSiteId, `${qty} units transferred between sites`)],
        }))
      },
      createStockAudit: (data) => {
        const n = nextNumber(set, get, 'AUD')
        const audit: StockAudit = { id: genId('aud'), auditNumber: n, projectId: data.projectId!, siteId: data.siteId!, date: nowIso(), auditedBy: get().currentUser!.id, lines: data.lines ?? [], status: 'DRAFT' }
        set(s => ({ stockAudits: [...s.stockAudits, audit] }))
        return audit
      },
      completeStockAudit: (id) => {
        const user = get().currentUser!
        set(s => ({ stockAudits: s.stockAudits.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a), auditLog: [...s.auditLog, mkAudit('StockAudit', id, s.stockAudits.find(a => a.id === id)?.auditNumber ?? '', 'Completed', user)] }))
      },

      // -----------------------------------------------------------------
      // Subcontractors / Work Orders / Measurements
      // -----------------------------------------------------------------
      createSubcontractor: (data) => {
        const sub: Subcontractor = { id: genId('sub'), name: data.name ?? '', trade: data.trade ?? '', contactPerson: data.contactPerson ?? '', phone: data.phone ?? '', email: data.email ?? '', status: 'ACTIVE' }
        set(s => ({ subcontractors: [...s.subcontractors, sub] }))
        return sub
      },
      createWorkOrder: (data) => {
        const n = nextNumber(set, get, 'WO')
        const wo: WorkOrder = { id: genId('wo'), woNumber: n, subcontractorId: data.subcontractorId!, projectId: data.projectId!, siteId: data.siteId!, workPackage: data.workPackage ?? '', scope: data.scope ?? '', value: data.value ?? 0, startDate: data.startDate ?? nowIso(), endDate: data.endDate ?? nowIso(), status: 'DRAFT' }
        set(s => ({ workOrders: [...s.workOrders, wo], auditLog: [...s.auditLog, mkAudit('WorkOrder', wo.id, wo.woNumber, 'Created (Draft)', get().currentUser!)] }))
        return wo
      },
      issueWorkOrder: (id) => {
        const user = get().currentUser!
        set(s => ({ workOrders: s.workOrders.map(w => w.id === id ? { ...w, status: 'ACTIVE' } : w), auditLog: [...s.auditLog, mkAudit('WorkOrder', id, s.workOrders.find(w => w.id === id)?.woNumber ?? '', 'Issued to Subcontractor', user, 'DRAFT', 'ACTIVE')] }))
      },
      createMeasurement: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'MEAS')
        const boq = get().boqItems.find(b => b.id === data.boqItemId)
        const prevQty = get().measurements.filter(m => m.boqItemId === data.boqItemId && m.status === 'APPROVED').reduce((max, m) => Math.max(max, m.cumulativeQty), 0)
        const currentQty = data.currentQty ?? 0
        // If the PE themselves records the measurement, skip the blocking "PE verifies PE" stage
        // (only one PE account exists per site) and route straight to PM verification.
        const firstApproverRole = user.role === 'PE' ? 'PM' : 'PE'
        const initialStatus = user.role === 'PE' ? 'PE_VERIFIED' : 'SUBMITTED'
        const meas: Measurement = { id: genId('meas'), measurementNumber: n, projectId: data.projectId!, boqItemId: data.boqItemId!, subcontractorId: data.subcontractorId, workOrderId: data.workOrderId, previousQty: prevQty, currentQty, cumulativeQty: prevQty + currentQty, rate: boq?.rate ?? 0, amount: currentQty * (boq?.rate ?? 0), date: nowIso(), measuredBy: user.id, attachments: data.attachments ?? [], status: initialStatus }
        const step: ApprovalStep = { id: genId('ST'), approverRole: 'PE', approverName: user.name, action: 'SUBMITTED', timestamp: nowIso() }
        set(s => ({
          measurements: [...s.measurements, meas],
          auditLog: [...s.auditLog, mkAudit('Measurement', meas.id, meas.measurementNumber, 'Recorded & Submitted', user)],
          approvalTasks: [...s.approvalTasks, raiseApproval('measurement', 'Measurement', meas.id, meas.measurementNumber, `Measurement Verification - ${meas.measurementNumber}`, meas.amount, meas.projectId, user, firstApproverRole)],
        }))
        void step
        return meas
      },

      // -----------------------------------------------------------------
      // Subcontractor Bill
      // -----------------------------------------------------------------
      createSubcontractorBill: (workOrderId, measurementIds, deductions) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'SCB')
        const wo = get().workOrders.find(w => w.id === workOrderId)!
        const gross = get().measurements.filter(m => measurementIds.includes(m.id)).reduce((sum, m) => sum + m.amount, 0)
        const netPayable = gross - deductions.retention - deductions.advanceRecovery - deductions.penalty - deductions.otherDeduction + deductions.tax
        const bill: SubcontractorBill = { id: genId('scb'), billNumber: n, workOrderId, subcontractorId: wo.subcontractorId, projectId: wo.projectId, measurementIds, grossAmount: gross, retention: deductions.retention, advanceRecovery: deductions.advanceRecovery, penalty: deductions.penalty, otherDeduction: deductions.otherDeduction, tax: deductions.tax, netPayable, status: 'DRAFT', approvalHistory: [], createdAt: nowIso() }
        set(s => ({ subcontractorBills: [...s.subcontractorBills, bill], auditLog: [...s.auditLog, mkAudit('SubcontractorBill', bill.id, bill.billNumber, 'Created (Draft)', user)] }))
        return bill
      },
      submitSubcontractorBill: (id) => {
        const user = get().currentUser!
        const bill = get().subcontractorBills.find(b => b.id === id)!
        const step: ApprovalStep = { id: genId('ST'), approverRole: 'SUBCONTRACTOR', approverName: user.name, action: 'SUBMITTED', timestamp: nowIso() }
        set(s => ({
          subcontractorBills: s.subcontractorBills.map(b => b.id === id ? { ...b, status: 'SUBMITTED', approvalHistory: [...b.approvalHistory, step] } : b),
          auditLog: [...s.auditLog, mkAudit('SubcontractorBill', id, bill.billNumber, 'Submitted', user)],
          approvalTasks: [...s.approvalTasks, raiseApproval('subcontractorBill', 'SubcontractorBill', id, bill.billNumber, `Subcontractor Bill Verification - ${bill.billNumber} (₹${Math.round(bill.netPayable).toLocaleString('en-IN')})`, bill.netPayable, bill.projectId, user, 'PE')],
        }))
      },

      // -----------------------------------------------------------------
      // Vendor Bill / 3-way match
      // -----------------------------------------------------------------
      createVendorBill: (data) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'VB')
        const po = get().purchaseOrders.find(p => p.id === data.poId)!
        const grn = get().grns.find(g => g.id === data.grnId)!
        const poAmount = po.total
        const grnAmount = grn.items.reduce((sum, l) => { const poLine = po.items.find(i => i.materialId === l.materialId); return sum + l.acceptedQty * (poLine?.rate ?? 0) * (1 + (poLine?.tax ?? 0) / 100) }, 0) + po.freight
        const bill: VendorBill = { id: genId('vb'), billNumber: n, poId: data.poId!, grnId: data.grnId!, vendorId: po.vendorId, projectId: po.projectId, invoiceNumber: data.invoiceNumber ?? '', invoiceAmount: data.invoiceAmount ?? 0, poAmount, grnAmount, matchStatus: 'PENDING', status: 'DOCUMENT_CHECK', approvalHistory: [], createdAt: nowIso() }
        set(s => ({ vendorBills: [...s.vendorBills, bill], auditLog: [...s.auditLog, mkAudit('VendorBill', bill.id, bill.billNumber, 'Vendor Invoice Received', user)] }))
        return bill
      },
      runThreeWayMatch: (id) => {
        const user = get().currentUser!
        const bill = get().vendorBills.find(b => b.id === id)!
        const tolerance = 1
        const matched = Math.abs(bill.invoiceAmount - bill.grnAmount) <= tolerance
        const status = matched ? 'THREE_WAY_MATCH' : 'HOLD'
        const reason = matched ? undefined : `Invoice amount ₹${Math.round(bill.invoiceAmount).toLocaleString('en-IN')} does not match GRN-accepted value ₹${Math.round(bill.grnAmount).toLocaleString('en-IN')}.`
        set(s => ({ vendorBills: s.vendorBills.map(b => b.id === id ? { ...b, matchStatus: matched ? 'MATCHED' : 'MISMATCH', status, mismatchReason: reason } : b), auditLog: [...s.auditLog, mkAudit('VendorBill', id, bill.billNumber, `3-Way Match - ${matched ? 'Matched' : 'Mismatch'}`, user, 'PENDING', matched ? 'MATCHED' : 'MISMATCH', reason)] }))
      },
      verifyVendorBillAccounts: (id, approveException) => {
        const user = get().currentUser!
        const bill = get().vendorBills.find(b => b.id === id)!
        if (bill.matchStatus === 'MISMATCH' && !approveException) return
        const step: ApprovalStep = { id: genId('ST'), approverRole: 'ACCOUNTS', approverName: user.name, action: 'VERIFIED', comment: approveException ? 'Approved as exception' : undefined, timestamp: nowIso() }
        set(s => ({ vendorBills: s.vendorBills.map(b => b.id === id ? { ...b, status: 'ACCOUNTS_VERIFIED', approvalHistory: [...b.approvalHistory, step] } : b), auditLog: [...s.auditLog, mkAudit('VendorBill', id, bill.billNumber, 'Accounts Verified', user, bill.status, 'ACCOUNTS_VERIFIED', approveException ? 'Exception approved despite mismatch' : undefined)] }))
      },
      holdVendorBill: (id, reason) => {
        const user = get().currentUser!
        set(s => ({ vendorBills: s.vendorBills.map(b => b.id === id ? { ...b, status: 'HOLD' } : b), auditLog: [...s.auditLog, mkAudit('VendorBill', id, s.vendorBills.find(b => b.id === id)?.billNumber ?? '', 'Held', user, undefined, undefined, reason)] }))
      },

      // -----------------------------------------------------------------
      // Freight / Debit Notes
      // -----------------------------------------------------------------
      createFreight: (data) => {
        const n = nextNumber(set, get, 'FRT')
        const frt: Freight = { id: genId('frt'), freightNumber: n, poId: data.poId!, vendorId: data.vendorId!, transporter: data.transporter ?? '', vehicle: data.vehicle ?? '', distance: data.distance ?? 0, freightRate: data.freightRate ?? 0, amount: data.amount ?? 0, invoiceNumber: data.invoiceNumber ?? '', approvalStatus: 'PENDING', paymentStatus: 'PENDING' }
        set(s => ({ freightRecords: [...s.freightRecords, frt] }))
        return frt
      },
      approveFreight: (id) => {
        const user = get().currentUser!
        set(s => ({ freightRecords: s.freightRecords.map(f => f.id === id ? { ...f, approvalStatus: 'APPROVED' } : f), auditLog: [...s.auditLog, mkAudit('Freight', id, s.freightRecords.find(f => f.id === id)?.freightNumber ?? '', 'Approved', user)] }))
      },
      payFreight: (id) => set(s => ({ freightRecords: s.freightRecords.map(f => f.id === id ? { ...f, paymentStatus: 'PAID' } : f) })),

      createDebitNote: (data) => {
        const n = nextNumber(set, get, 'DN')
        const dn: DebitNote = { id: genId('dn'), debitNoteNumber: n, vendorId: data.vendorId!, grnId: data.grnId, poId: data.poId, reason: data.reason ?? 'QUALITY_ISSUE', amount: data.amount ?? 0, status: 'DRAFT', createdAt: nowIso(), remarks: data.remarks ?? '' }
        set(s => ({ debitNotes: [...s.debitNotes, dn], auditLog: [...s.auditLog, mkAudit('DebitNote', dn.id, dn.debitNoteNumber, 'Created', get().currentUser!)] }))
        return dn
      },
      approveDebitNote: (id) => {
        const user = get().currentUser!
        set(s => ({ debitNotes: s.debitNotes.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d), auditLog: [...s.auditLog, mkAudit('DebitNote', id, s.debitNotes.find(d => d.id === id)?.debitNoteNumber ?? '', 'Approved', user)] }))
      },
      closeDebitNote: (id) => set(s => ({ debitNotes: s.debitNotes.map(d => d.id === id ? { ...d, status: 'CLOSED' } : d) })),

      // -----------------------------------------------------------------
      // Payment Queue / MD Approval / Tally
      // -----------------------------------------------------------------
      sendBillToPaymentQueue: (billType, billId) => {
        const user = get().currentUser!
        const n = nextNumber(set, get, 'PAY')
        let amount = 0, projectId = '', payeeName = ''
        if (billType === 'VENDOR') {
          const bill = get().vendorBills.find(b => b.id === billId)!
          const dn = get().debitNotes.find(d => d.grnId === bill.grnId)
          amount = bill.invoiceAmount - (dn?.amount ?? 0)
          projectId = bill.projectId
          payeeName = get().vendors.find(v => v.id === bill.vendorId)?.name ?? ''
        } else {
          const bill = get().subcontractorBills.find(b => b.id === billId)!
          amount = bill.netPayable
          projectId = bill.projectId
          payeeName = get().subcontractors.find(sc => sc.id === bill.subcontractorId)?.name ?? ''
        }
        const payment: Payment = { id: genId('pay'), paymentNumber: n, type: billType, refBillId: billId, projectId, payeeName, amount, status: 'MD_APPROVAL_PENDING', approvalHistory: [], createdAt: nowIso() }
        set(s => ({
          payments: [...s.payments, payment],
          auditLog: [...s.auditLog, mkAudit('Payment', payment.id, payment.paymentNumber, 'Sent to Payment Queue - Accounts Verified', user)],
          approvalTasks: [...s.approvalTasks, raiseApproval('payment', 'Payment', payment.id, payment.paymentNumber, `Payment Approval - ${payment.paymentNumber} to ${payeeName} (₹${Math.round(amount).toLocaleString('en-IN')})`, amount, projectId, user, 'MD')],
          notifications: [...s.notifications, mkNotif({ toRole: 'MD', title: 'Payment pending approval', message: `${n} of ₹${Math.round(amount).toLocaleString('en-IN')} to ${payeeName} awaiting your approval.`, module: 'payments', relatedRecordId: payment.id, severity: 'WARNING' })],
        }))
        return payment
      },
      postPaymentToTally: (id) => {
        const user = get().currentUser!
        const p = get().payments.find(x => x.id === id)!
        const voucher = `TV-${String(get().payments.filter(x => x.tallyVoucherNumber).length + 1).padStart(4, '0')}`
        set(s => ({ payments: s.payments.map(x => x.id === id ? { ...x, status: 'TALLY_POSTED', tallyVoucherNumber: voucher } : x), auditLog: [...s.auditLog, mkAudit('Payment', id, p.paymentNumber, 'Tally Entry Posted', user, 'PAID', 'TALLY_POSTED', `Voucher ${voucher}`)] }))
      },
      closePayment: (id) => {
        const user = get().currentUser!
        const p = get().payments.find(x => x.id === id)!
        set(s => ({
          payments: s.payments.map(x => x.id === id ? { ...x, status: 'CLOSED' } : x),
          vendorBills: s.vendorBills.map(b => b.id === p.refBillId ? { ...b, status: 'CLOSED' } : b),
          subcontractorBills: s.subcontractorBills.map(b => b.id === p.refBillId ? { ...b, status: 'PAID' } : b),
          auditLog: [...s.auditLog, mkAudit('Payment', id, p.paymentNumber, 'Closed - Audit Complete', user, 'TALLY_POSTED', 'CLOSED')],
        }))
      },

      // -----------------------------------------------------------------
      // Client Billing (RA Bills)
      // -----------------------------------------------------------------
      createRABill: (data) => {
        const n = nextNumber(set, get, 'RA')
        const bill: RABill = { id: genId('ra'), raNumber: n, projectId: data.projectId!, contractId: data.contractId!, measurementIds: data.measurementIds ?? [], billedAmount: data.billedAmount ?? 0, certifiedAmount: 0, retention: 0, deductions: 0, netAmount: 0, receivedAmount: 0, status: 'DRAFT', createdAt: nowIso() }
        set(s => ({ raBills: [...s.raBills, bill], auditLog: [...s.auditLog, mkAudit('RABill', bill.id, bill.raNumber, 'Created (Draft)', get().currentUser!)] }))
        return bill
      },
      submitRABillToClient: (id) => {
        const user = get().currentUser!
        set(s => ({ raBills: s.raBills.map(b => b.id === id ? { ...b, status: 'SUBMITTED_TO_CLIENT' } : b), auditLog: [...s.auditLog, mkAudit('RABill', id, s.raBills.find(b => b.id === id)?.raNumber ?? '', 'Submitted to Client', user)] }))
      },
      certifyRABill: (id, certifiedAmount) => {
        const user = get().currentUser!
        const bill = get().raBills.find(b => b.id === id)!
        const contract = get().contracts.find(c => c.id === bill.contractId)
        const retention = Math.round(certifiedAmount * ((contract?.retentionPct ?? 5) / 100))
        set(s => ({ raBills: s.raBills.map(b => b.id === id ? { ...b, status: 'CERTIFIED', certifiedAmount, retention, netAmount: certifiedAmount - retention - b.deductions } : b), auditLog: [...s.auditLog, mkAudit('RABill', id, bill.raNumber, 'Certified by Client', user)] }))
      },
      recordReceivable: (id, amount) => {
        const user = get().currentUser!
        set(s => ({ raBills: s.raBills.map(b => b.id === id ? { ...b, status: 'RECEIVED', receivedAmount: b.receivedAmount + amount } : b), auditLog: [...s.auditLog, mkAudit('RABill', id, s.raBills.find(b => b.id === id)?.raNumber ?? '', 'Payment Received', user, undefined, `+₹${amount.toLocaleString('en-IN')}`)] }))
      },

      // -----------------------------------------------------------------
      // Documents / Subscriptions / Loans
      // -----------------------------------------------------------------
      createDocument: (data) => {
        const n = nextNumber(set, get, 'DOC')
        const doc: AppDocument = { id: genId('doc'), docNumber: n, name: data.name ?? '', type: data.type ?? 'General', projectId: data.projectId, vendorId: data.vendorId, subcontractorId: data.subcontractorId, relatedModule: data.relatedModule, relatedRecordId: data.relatedRecordId, version: 1, issueDate: nowIso(), expiryDate: data.expiryDate, uploadedBy: get().currentUser!.id, status: 'PENDING_APPROVAL' }
        set(s => ({ documents: [...s.documents, doc], auditLog: [...s.auditLog, mkAudit('Document', doc.id, doc.docNumber, 'Uploaded', get().currentUser!)] }))
        return doc
      },
      approveDocument: (id) => {
        const user = get().currentUser!
        set(s => ({ documents: s.documents.map(d => d.id === id ? { ...d, status: 'APPROVED', approvedBy: user.id } : d), auditLog: [...s.auditLog, mkAudit('Document', id, s.documents.find(d => d.id === id)?.docNumber ?? '', 'Approved', user)] }))
      },
      renewDocument: (id, newExpiry) => {
        const user = get().currentUser!
        set(s => ({ documents: s.documents.map(d => d.id === id ? { ...d, version: d.version + 1, expiryDate: newExpiry, status: 'APPROVED' } : d), auditLog: [...s.auditLog, mkAudit('Document', id, s.documents.find(d => d.id === id)?.docNumber ?? '', 'Renewed', user)] }))
      },

      createSubscription: (data) => {
        const sub: Subscription = { id: genId('sub'), name: data.name ?? '', provider: data.provider ?? '', type: data.type ?? '', startDate: data.startDate ?? nowIso(), endDate: data.endDate ?? nowIso(), renewalDate: data.renewalDate ?? nowIso(), cost: data.cost ?? 0, frequency: data.frequency ?? 'YEARLY', owner: get().currentUser!.id, projectId: data.projectId, status: 'ACTIVE' }
        set(s => ({ subscriptions: [...s.subscriptions, sub] }))
        return sub
      },
      renewSubscription: (id, newEndDate) => {
        const user = get().currentUser!
        set(s => ({ subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, status: 'RENEWED', endDate: newEndDate, renewalDate: newEndDate } : sub), auditLog: [...s.auditLog, mkAudit('Subscription', id, s.subscriptions.find(sub => sub.id === id)?.name ?? '', 'Renewed', user)] }))
      },

      createLoan: (data) => {
        const n = nextNumber(set, get, 'LOAN')
        const loan: Loan = { id: genId('loan'), loanNumber: n, name: data.name ?? '', lender: data.lender ?? '', principal: data.principal ?? 0, interestRate: data.interestRate ?? 0, startDate: data.startDate ?? nowIso(), tenureMonths: data.tenureMonths ?? 12, emiAmount: data.emiAmount ?? 0, outstanding: data.principal ?? 0, status: 'ACTIVE', nocIssued: false }
        set(s => ({ loans: [...s.loans, loan] }))
        return loan
      },
      payInstallment: (loanId, installmentId) => {
        const user = get().currentUser!
        const inst = get().loanInstallments.find(i => i.id === installmentId)!
        set(s => ({
          loanInstallments: s.loanInstallments.map(i => i.id === installmentId ? { ...i, status: 'PAID', paidDate: nowIso() } : i),
          loans: s.loans.map(l => l.id === loanId ? { ...l, outstanding: Math.max(0, l.outstanding - inst.amount) } : l),
          auditLog: [...s.auditLog, mkAudit('Loan', loanId, s.loans.find(l => l.id === loanId)?.loanNumber ?? '', `Installment #${inst.installmentNo} Paid`, user)],
        }))
      },
      requestForeclosure: (loanId) => {
        const user = get().currentUser!
        set(s => ({ loans: s.loans.map(l => l.id === loanId ? { ...l, status: 'FORECLOSURE_REQUESTED' } : l), auditLog: [...s.auditLog, mkAudit('Loan', loanId, s.loans.find(l => l.id === loanId)?.loanNumber ?? '', 'Foreclosure Requested', user)] }))
      },
      approveForeclosure: (loanId) => {
        const user = get().currentUser!
        set(s => ({ loans: s.loans.map(l => l.id === loanId ? { ...l, status: 'CLOSED', outstanding: 0, nocIssued: true } : l), auditLog: [...s.auditLog, mkAudit('Loan', loanId, s.loans.find(l => l.id === loanId)?.loanNumber ?? '', 'Foreclosure Approved - NOC Issued', user)] }))
      },
    }),
    { name: 'construction-erp-store', version: 1 }
  )
)

// ---------------------------------------------------------------------------
// Helpers that need get()/set() together
// ---------------------------------------------------------------------------
function nextNumber(set: (fn: (s: Store) => Partial<Store>) => void, get: () => Store, prefix: string): string {
  const current = get().counters[prefix] ?? 1
  set(s => ({ counters: { ...s.counters, [prefix]: current + 1 } }))
  return seqNumber(prefix, current)
}

function netRequirement(state: Store, indent: MaterialIndent): number {
  const stock = getStockBalance(state, indent.materialId, indent.siteId)
  const openPO = getOpenPOQty(state, indent.materialId, indent.projectId)
  return Math.max(0, indent.requiredQty - stock - openPO)
}

function resolveModuleApproval(get: () => Store, set: (fn: (s: Store) => Partial<Store>) => void, task: ApprovalTask, decision: 'APPROVED' | 'REJECTED' | 'SENT_BACK', user: User, comment?: string) {
  set(s => ({ approvalTasks: s.approvalTasks.map(t => t.id === task.id ? { ...t, status: decision, resolvedAt: nowIso() } : t) }))

  switch (task.module) {
    case 'indent': {
      const newStatus = decision === 'APPROVED' ? 'PROCUREMENT_PENDING' : decision === 'REJECTED' ? 'REJECTED' : 'CORRECTION_REQUIRED'
      set(s => ({ materialIndents: s.materialIndents.map(i => i.id === task.recordId ? { ...i, status: newStatus } : i), auditLog: [...s.auditLog, mkAudit('MaterialIndent', task.recordId, task.docNumber, `PM ${decision}`, user, 'PM_REVIEW', newStatus, comment)], notifications: [...s.notifications, mkNotif({ toUserId: task.requesterId, title: `Indent ${decision.toLowerCase()}`, message: `${task.docNumber} was ${decision.toLowerCase()} by ${user.name}.`, module: 'indents', relatedRecordId: task.recordId, severity: decision === 'APPROVED' ? 'INFO' : 'WARNING' }), ...(decision === 'APPROVED' ? [mkNotif({ toRole: 'PROCUREMENT' as Role, title: 'Indent approved - ready for RFQ', message: `${task.docNumber} approved and ready for procurement.`, module: 'indents', relatedRecordId: task.recordId })] : [])] }))
      break
    }
    case 'po': {
      if (decision === 'APPROVED') {
        const remaining = get().approvalTasks.filter(t => t.recordId === task.recordId && t.module === 'po' && t.status === 'PENDING')
        if (remaining.length === 0) {
          set(s => ({ purchaseOrders: s.purchaseOrders.map(p => p.id === task.recordId ? { ...p, status: 'APPROVED' } : p), auditLog: [...s.auditLog, mkAudit('PurchaseOrder', task.recordId, task.docNumber, 'Fully Approved', user)], notifications: [...s.notifications, mkNotif({ toRole: 'PROCUREMENT', title: 'PO approved', message: `${task.docNumber} fully approved. Ready to issue.`, module: 'po', relatedRecordId: task.recordId })] }))
        }
      } else {
        const newStatus = decision === 'REJECTED' ? 'REJECTED' : 'DRAFT'
        set(s => ({
          purchaseOrders: s.purchaseOrders.map(p => p.id === task.recordId ? { ...p, status: newStatus } : p),
          approvalTasks: s.approvalTasks.map(t => t.recordId === task.recordId && t.module === 'po' && t.status === 'PENDING' ? { ...t, status: 'REJECTED', resolvedAt: nowIso() } : t),
          auditLog: [...s.auditLog, mkAudit('PurchaseOrder', task.recordId, task.docNumber, `PO ${decision}`, user, undefined, newStatus, comment)],
          notifications: [...s.notifications, mkNotif({ toUserId: task.requesterId, title: `PO ${decision === 'REJECTED' ? 'rejected' : 'sent back'}`, message: `${task.docNumber}: ${comment}`, module: 'po', relatedRecordId: task.recordId, severity: 'WARNING' })],
        }))
      }
      break
    }
    case 'dpr': {
      if (decision === 'APPROVED') {
        if (task.currentApproverRole === 'PE') {
          const dpr = get().dailyReports.find(d => d.id === task.recordId)!
          set(s => ({
            dailyReports: s.dailyReports.map(d => d.id === task.recordId ? { ...d, status: 'PM_REVIEW', approvalHistory: [...d.approvalHistory, { id: genId('ST'), approverRole: 'PE', approverName: user.name, action: 'VERIFIED', timestamp: nowIso() }] } : d),
            approvalTasks: [...s.approvalTasks, raiseApproval('dpr', 'DailyReport', task.recordId, task.docNumber, task.title, undefined, task.projectId, { ...user, id: task.requesterId } as User, 'PM')],
            auditLog: [...s.auditLog, mkAudit('DailyReport', task.recordId, task.docNumber, 'PE Reviewed', user, 'PE_REVIEW', 'PM_REVIEW')],
          }))
          void dpr
        } else {
          set(s => ({ dailyReports: s.dailyReports.map(d => d.id === task.recordId ? { ...d, status: 'APPROVED', approvalHistory: [...d.approvalHistory, { id: genId('ST'), approverRole: 'PM', approverName: user.name, action: 'APPROVED', timestamp: nowIso() }] } : d), auditLog: [...s.auditLog, mkAudit('DailyReport', task.recordId, task.docNumber, 'PM Approved', user, 'PM_REVIEW', 'APPROVED')] }))
        }
      } else {
        set(s => ({ dailyReports: s.dailyReports.map(d => d.id === task.recordId ? { ...d, status: 'CORRECTION_REQUIRED' } : d), auditLog: [...s.auditLog, mkAudit('DailyReport', task.recordId, task.docNumber, `DPR ${decision}`, user, undefined, 'CORRECTION_REQUIRED', comment)], notifications: [...s.notifications, mkNotif({ toUserId: task.requesterId, title: 'DPR needs correction', message: `${task.docNumber}: ${comment}`, module: 'dpr', relatedRecordId: task.recordId, severity: 'WARNING' })] }))
      }
      break
    }
    case 'measurement': {
      if (decision === 'APPROVED') {
        if (task.currentApproverRole === 'PE') {
          set(s => ({
            measurements: s.measurements.map(m => m.id === task.recordId ? { ...m, status: 'PE_VERIFIED' } : m),
            approvalTasks: [...s.approvalTasks, raiseApproval('measurement', 'Measurement', task.recordId, task.docNumber, task.title, task.amount, task.projectId, { ...user, id: task.requesterId } as User, 'PM')],
            auditLog: [...s.auditLog, mkAudit('Measurement', task.recordId, task.docNumber, 'PE Verified', user, 'SUBMITTED', 'PE_VERIFIED')],
          }))
        } else {
          set(s => ({ measurements: s.measurements.map(m => m.id === task.recordId ? { ...m, status: 'APPROVED', verifiedBy: user.id } : m), auditLog: [...s.auditLog, mkAudit('Measurement', task.recordId, task.docNumber, 'PM Approved', user, 'PE_VERIFIED', 'APPROVED')] }))
        }
      } else {
        set(s => ({ measurements: s.measurements.map(m => m.id === task.recordId ? { ...m, status: 'DRAFT' } : m), auditLog: [...s.auditLog, mkAudit('Measurement', task.recordId, task.docNumber, `Measurement ${decision}`, user, undefined, 'DRAFT', comment)] }))
      }
      break
    }
    case 'subcontractorBill': {
      if (decision === 'APPROVED') {
        const nextRole = task.currentApproverRole === 'PE' ? 'PM' : task.currentApproverRole === 'PM' ? 'ACCOUNTS' : null
        const newStatus = task.currentApproverRole === 'PE' ? 'PE_VERIFIED' : task.currentApproverRole === 'PM' ? 'PM_VERIFIED' : 'ACCOUNTS_VERIFIED'
        set(s => ({ subcontractorBills: s.subcontractorBills.map(b => b.id === task.recordId ? { ...b, status: newStatus } : b), auditLog: [...s.auditLog, mkAudit('SubcontractorBill', task.recordId, task.docNumber, `${task.currentApproverRole} Verified`, user, undefined, newStatus)] }))
        if (nextRole) {
          set(s => ({ approvalTasks: [...s.approvalTasks, raiseApproval('subcontractorBill', 'SubcontractorBill', task.recordId, task.docNumber, task.title, task.amount, task.projectId, { ...user, id: task.requesterId } as User, nextRole)] }))
        } else {
          set(s => ({ notifications: [...s.notifications, mkNotif({ toRole: 'ACCOUNTS', title: 'Bill ready for payment queue', message: `${task.docNumber} fully verified. Ready to send to payment queue.`, module: 'subcontractorBills', relatedRecordId: task.recordId })] }))
        }
      } else {
        set(s => ({ subcontractorBills: s.subcontractorBills.map(b => b.id === task.recordId ? { ...b, status: 'REJECTED' } : b), auditLog: [...s.auditLog, mkAudit('SubcontractorBill', task.recordId, task.docNumber, `Bill ${decision}`, user, undefined, 'REJECTED', comment)] }))
      }
      break
    }
    case 'payment': {
      if (decision === 'APPROVED') {
        set(s => ({
          payments: s.payments.map(p => p.id === task.recordId ? { ...p, status: 'PAID', paymentDate: nowIso(), paymentRef: `NEFT/${new Date().getFullYear()}/${String(s.payments.length + 1000).padStart(5, '0')}` } : p),
          auditLog: [...s.auditLog, mkAudit('Payment', task.recordId, task.docNumber, 'MD Approved Payment', user, 'MD_APPROVAL_PENDING', 'PAID')],
          notifications: [...s.notifications, mkNotif({ toRole: 'ACCOUNTS', title: 'Payment approved by MD', message: `${task.docNumber} approved. Proceed with disbursement and Tally entry.`, module: 'payments', relatedRecordId: task.recordId })],
        }))
      } else {
        set(s => ({ payments: s.payments.map(p => p.id === task.recordId ? { ...p, status: 'ACCOUNTS_VERIFIED' } : p), auditLog: [...s.auditLog, mkAudit('Payment', task.recordId, task.docNumber, `Payment ${decision}`, user, undefined, 'ACCOUNTS_VERIFIED', comment)], notifications: [...s.notifications, mkNotif({ toRole: 'ACCOUNTS', title: 'Payment sent back', message: `${task.docNumber}: ${comment}`, module: 'payments', relatedRecordId: task.recordId, severity: 'WARNING' })] }))
      }
      break
    }
    case 'document': {
      set(s => ({ documents: s.documents.map(d => d.id === task.recordId ? { ...d, status: decision === 'APPROVED' ? 'APPROVED' : 'DRAFT' } : d) }))
      break
    }
  }
}
