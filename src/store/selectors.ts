import type { AppData, ExceptionOverride } from './state'
import type { ExceptionRecord, ApprovalTask } from '../types'
import { isOverdue, daysUntil } from '../lib/utils'

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------
export function getStockBalance(state: AppData, materialId: string, siteId?: string): number {
  return state.stockLedger
    .filter(e => e.materialId === materialId && (!siteId || e.siteId === siteId))
    .reduce((sum, e) => sum + e.qty, 0)
}

export function getOpenPOQty(state: AppData, materialId: string, projectId: string): number {
  const openStatuses = ['DRAFT', 'SUBMITTED', 'TECHNICAL_APPROVED', 'MGMT_APPROVAL_PENDING', 'APPROVED', 'ISSUED', 'PARTIALLY_RECEIVED']
  return state.purchaseOrders
    .filter(po => po.projectId === projectId && openStatuses.includes(po.status))
    .flatMap(po => po.items)
    .filter(l => l.materialId === materialId)
    .reduce((sum, l) => sum + (l.qty - l.receivedQty), 0)
}

export function getStockLedgerForMaterial(state: AppData, materialId: string, siteId?: string) {
  return state.stockLedger
    .filter(e => e.materialId === materialId && (!siteId || e.siteId === siteId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// ---------------------------------------------------------------------------
// BOQ progress — derived from measurements (work items) and store issues (material items)
// ---------------------------------------------------------------------------
export function getBoqConsumed(state: AppData, boqItemId: string): number {
  const measurementQty = state.measurements
    .filter(m => m.boqItemId === boqItemId && m.status === 'APPROVED')
    .reduce((max, m) => Math.max(max, m.cumulativeQty), 0)
  if (measurementQty > 0) return measurementQty
  const issuedQty = state.storeIssues
    .filter(i => i.boqItemId === boqItemId && i.status === 'ISSUED')
    .reduce((sum, i) => sum + i.qty, 0)
  return issuedQty
}

export function getBoqProgressPct(state: AppData, boqItemId: string): number {
  const item = state.boqItems.find(b => b.id === boqItemId)
  if (!item) return 0
  const consumed = getBoqConsumed(state, boqItemId)
  return item.revisedQty > 0 ? Math.min(100, Math.round((consumed / item.revisedQty) * 1000) / 10) : 0
}

// ---------------------------------------------------------------------------
// Approval Center helpers
// ---------------------------------------------------------------------------
export function pendingApprovalsForRole(state: AppData, role: string): ApprovalTask[] {
  return state.approvalTasks.filter(t => t.status === 'PENDING' && t.currentApproverRole === role)
}

export function canUserApprove(task: ApprovalTask, userId: string): boolean {
  return task.status === 'PENDING' && task.requesterId !== userId
}

// ---------------------------------------------------------------------------
// Exceptions — derived live from data + manual overrides for resolution tracking
// ---------------------------------------------------------------------------
export function deriveExceptions(state: AppData): ExceptionRecord[] {
  const list: ExceptionRecord[] = []
  const push = (e: Omit<ExceptionRecord, 'status' | 'resolution' | 'resolvedAt'>) => {
    const ov: ExceptionOverride | undefined = state.exceptionOverrides[e.id]
    list.push({ ...e, status: ov?.status ?? 'OPEN', resolution: ov?.resolution, resolvedAt: ov?.resolvedAt })
  }

  // Low stock
  for (const mat of state.materials) {
    for (const site of state.sites) {
      const bal = getStockBalance(state, mat.id, site.id)
      if (bal > 0 && bal < mat.reorderLevel) {
        push({
          id: `LOW_STOCK-${mat.id}-${site.id}`, type: 'LOW_STOCK', severity: 'MEDIUM', module: 'Inventory',
          recordId: mat.id, recordType: 'Material', projectId: site.projectId,
          description: `${mat.name} stock (${bal} ${mat.unit}) is below reorder level (${mat.reorderLevel} ${mat.unit}) at ${site.name}.`,
          owner: 'STORE', createdAt: new Date().toISOString(),
        })
      }
    }
  }

  // Material rejection at GRN
  for (const grn of state.grns) {
    const rejected = grn.items.reduce((s, l) => s + l.rejectedQty, 0)
    if (rejected > 0) {
      push({
        id: `MATERIAL_REJECTION-${grn.id}`, type: 'MATERIAL_REJECTION', severity: 'MEDIUM', module: 'Store',
        recordId: grn.id, recordType: 'GRN', projectId: grn.projectId,
        description: `${grn.grnNumber}: ${rejected} unit(s) rejected during inspection. Verify debit note has been raised.`,
        owner: 'ACCOUNTS', createdAt: grn.createdAt,
      })
    }
  }

  // PO/GRN/Invoice mismatch
  for (const vb of state.vendorBills) {
    if (vb.matchStatus === 'MISMATCH') {
      push({
        id: `INVOICE_MISMATCH-${vb.id}`, type: 'INVOICE_MISMATCH', severity: 'HIGH', module: 'Accounts',
        recordId: vb.id, recordType: 'VendorBill', projectId: vb.projectId,
        description: `${vb.billNumber}: ${vb.mismatchReason ?? '3-way match mismatch detected.'}`,
        owner: 'ACCOUNTS', createdAt: vb.createdAt,
      })
    }
  }

  // Failed checklist pending correction
  for (const chk of state.checklistInstances) {
    if (chk.status === 'FAILED_PENDING_CORRECTION') {
      const failed = chk.items.filter(i => i.result === 'FAIL' && !i.rechecked)
      if (failed.length > 0) {
        push({
          id: `FAILED_CHECKLIST-${chk.id}`, type: 'FAILED_CHECKLIST', severity: 'HIGH', module: 'Checklist',
          recordId: chk.id, recordType: 'ChecklistInstance', projectId: state.sites.find(s => s.id === chk.siteId)?.projectId,
          description: `${chk.checklistNumber} (${chk.templateName}): ${failed.length} item(s) failed - ${failed.map(f => f.question).join('; ')}`,
          owner: 'PE', dueDate: undefined, createdAt: chk.createdAt,
        })
      }
    }
  }

  // Overdue delegation
  for (const d of state.delegations) {
    if (d.status !== 'COMPLETED' && d.status !== 'VERIFIED' && isOverdue(d.dueDate)) {
      push({
        id: `OVERDUE_DELEGATION-${d.id}`, type: 'OVERDUE_DELEGATION', severity: d.priority === 'URGENT' ? 'CRITICAL' : 'HIGH', module: 'Delegation',
        recordId: d.id, recordType: 'Delegation', projectId: d.projectId,
        description: `${d.taskId} "${d.title}" is overdue (due ${new Date(d.dueDate).toLocaleDateString('en-IN')}).`,
        owner: 'PM', dueDate: d.dueDate, createdAt: d.createdAt,
      })
    }
  }

  // Expired / expiring documents
  for (const doc of state.documents) {
    if (!doc.expiryDate) continue
    const days = daysUntil(doc.expiryDate)
    if (days <= 30) {
      push({
        id: `EXPIRED_DOCUMENT-${doc.id}`, type: 'EXPIRED_DOCUMENT', severity: days <= 0 ? 'CRITICAL' : days <= 7 ? 'HIGH' : 'MEDIUM', module: 'Documents',
        recordId: doc.id, recordType: 'AppDocument', projectId: doc.projectId,
        description: `${doc.name} ${days <= 0 ? 'has expired' : `expires in ${days} day(s)`}.`,
        owner: 'ACCOUNTS', dueDate: doc.expiryDate, createdAt: doc.issueDate,
      })
    }
  }

  // Subscription renewals
  for (const sub of state.subscriptions) {
    const days = daysUntil(sub.renewalDate)
    if (days <= 30) {
      push({
        id: `EXPIRED_SUBSCRIPTION-${sub.id}`, type: 'EXPIRED_SUBSCRIPTION', severity: days <= 0 ? 'CRITICAL' : days <= 7 ? 'HIGH' : 'MEDIUM', module: 'Subscriptions',
        recordId: sub.id, recordType: 'Subscription', projectId: sub.projectId,
        description: `${sub.name} renewal ${days <= 0 ? 'is overdue' : `due in ${days} day(s)`} (₹${sub.cost.toLocaleString('en-IN')}).`,
        owner: 'ACCOUNTS', dueDate: sub.renewalDate, createdAt: sub.startDate,
      })
    }
  }

  // Delayed delivery (PO expected delivery passed, not fully received)
  for (const po of state.purchaseOrders) {
    if (['ISSUED', 'PARTIALLY_RECEIVED'].includes(po.status) && isOverdue(po.expectedDelivery)) {
      push({
        id: `DELAYED_DELIVERY-${po.id}`, type: 'DELAYED_DELIVERY', severity: 'MEDIUM', module: 'Procurement',
        recordId: po.id, recordType: 'PurchaseOrder', projectId: po.projectId,
        description: `${po.poNumber}: delivery expected ${new Date(po.expectedDelivery).toLocaleDateString('en-IN')} has passed and PO is not fully received.`,
        owner: 'PROCUREMENT', dueDate: po.expectedDelivery, createdAt: po.createdAt,
      })
    }
  }

  // DPR pending approval too long
  for (const dpr of state.dailyReports) {
    if (['SUBMITTED', 'PE_REVIEW', 'PM_REVIEW'].includes(dpr.status)) {
      const ageDays = Math.floor((Date.now() - new Date(dpr.date).getTime()) / 86400000)
      if (ageDays >= 2) {
        push({
          id: `DPR_PENDING-${dpr.id}`, type: 'DPR_PENDING', severity: 'LOW', module: 'Daily Reports',
          recordId: dpr.id, recordType: 'DailyReport', projectId: dpr.projectId,
          description: `${dpr.dprNumber} has been pending approval for ${ageDays} day(s).`,
          owner: 'PM', createdAt: dpr.date,
        })
      }
    }
  }

  // Payment pending MD approval too long
  for (const p of state.payments) {
    if (p.status === 'MD_APPROVAL_PENDING') {
      push({
        id: `PAYMENT_PENDING-${p.id}`, type: 'PAYMENT_PENDING', severity: 'MEDIUM', module: 'Payments',
        recordId: p.id, recordType: 'Payment', projectId: p.projectId,
        description: `${p.paymentNumber} of ₹${p.amount.toLocaleString('en-IN')} to ${p.payeeName} is awaiting MD approval.`,
        owner: 'MD', createdAt: p.createdAt,
      })
    }
  }

  return list.sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return order[a.severity] - order[b.severity]
  })
}

// ---------------------------------------------------------------------------
// Traceability chain for a Material Indent through to Payment
// ---------------------------------------------------------------------------
export interface TraceNode {
  stage: string
  recordType: string
  recordId?: string
  label: string
  status?: string
  qty?: number
  amount?: number
  date?: string
  done: boolean
}

export function buildIndentTrace(state: AppData, indentId: string): TraceNode[] {
  const indent = state.materialIndents.find(i => i.id === indentId)
  const nodes: TraceNode[] = []
  if (!indent) return nodes
  const boq = state.boqItems.find(b => b.id === indent.boqItemId)
  nodes.push({ stage: 'BOQ', recordType: 'BOQItem', recordId: boq?.id, label: boq ? `${boq.boqNumber} - ${boq.description}` : '-', done: !!boq })
  nodes.push({ stage: 'INDENT', recordType: 'MaterialIndent', recordId: indent.id, label: `${indent.indentNumber} (${indent.requiredQty} ${indent.unit})`, status: indent.status, date: indent.createdAt, done: true })

  const rfq = state.enquiries.find(e => e.indentId === indentId)
  nodes.push({ stage: 'ENQUIRY / RFQ', recordType: 'Enquiry', recordId: rfq?.id, label: rfq ? `${rfq.rfqNumber} (${rfq.vendorIds.length} vendors)` : 'Not yet raised', status: rfq?.status, done: !!rfq })

  const po = rfq ? state.purchaseOrders.find(p => p.rfqId === rfq.id) : undefined
  nodes.push({ stage: 'PURCHASE ORDER', recordType: 'PurchaseOrder', recordId: po?.id, label: po ? `${po.poNumber} (₹${po.total.toLocaleString('en-IN')})` : 'Not yet created', status: po?.status, amount: po?.total, done: !!po })

  const dispatch = po ? state.dispatches.find(d => d.poId === po.id) : undefined
  nodes.push({ stage: 'DISPATCH', recordType: 'Dispatch', recordId: dispatch?.id, label: dispatch ? `${dispatch.dispatchNumber} - ${dispatch.vehicleNumber}` : 'Not yet dispatched', status: dispatch?.status, done: !!dispatch })

  const grn = po ? state.grns.find(g => g.poId === po.id) : undefined
  nodes.push({ stage: 'GRN', recordType: 'GRN', recordId: grn?.id, label: grn ? `${grn.grnNumber} (Accepted ${grn.items.reduce((s, l) => s + l.acceptedQty, 0)})` : 'Not yet received', status: grn?.status, done: !!grn })

  nodes.push({ stage: 'STOCK', recordType: 'StockLedger', label: `Balance: ${getStockBalance(state, indent.materialId, indent.siteId)} ${indent.unit}`, done: !!grn })

  const issue = state.storeIssues.find(i => i.materialId === indent.materialId && i.projectId === indent.projectId)
  nodes.push({ stage: 'STORE ISSUE', recordType: 'StoreIssue', recordId: issue?.id, label: issue ? `${issue.issueNumber} (${issue.qty} issued)` : 'Not yet issued', status: issue?.status, done: !!issue })

  const dpr = state.dailyReports.find(d => d.materialsUsed.some(m => m.materialId === indent.materialId))
  nodes.push({ stage: 'DPR / CONSUMPTION', recordType: 'DailyReport', recordId: dpr?.id, label: dpr ? `${dpr.dprNumber} - ${dpr.activity}` : 'Not yet consumed', status: dpr?.status, done: !!dpr })

  const measurement = boq ? state.measurements.find(m => m.boqItemId === boq.id) : undefined
  nodes.push({ stage: 'MEASUREMENT', recordType: 'Measurement', recordId: measurement?.id, label: measurement ? `${measurement.measurementNumber} (${measurement.currentQty} ${boq?.unit})` : 'Not yet measured', status: measurement?.status, amount: measurement?.amount, done: !!measurement })

  const bill = measurement ? state.subcontractorBills.find(b => b.measurementIds.includes(measurement.id)) : undefined
  const vbill = grn ? state.vendorBills.find(v => v.grnId === grn.id) : undefined
  nodes.push({ stage: 'BILL', recordType: bill ? 'SubcontractorBill' : 'VendorBill', recordId: bill?.id ?? vbill?.id, label: bill ? `${bill.billNumber} (₹${bill.netPayable.toLocaleString('en-IN')})` : vbill ? `${vbill.billNumber} (₹${vbill.invoiceAmount.toLocaleString('en-IN')})` : 'Not yet billed', status: bill?.status ?? vbill?.status, done: !!(bill || vbill) })

  const payment = state.payments.find(p => p.refBillId === (bill?.id ?? vbill?.id))
  nodes.push({ stage: 'PAYMENT', recordType: 'Payment', recordId: payment?.id, label: payment ? `${payment.paymentNumber} (₹${payment.amount.toLocaleString('en-IN')})` : 'Not yet paid', status: payment?.status, amount: payment?.amount, date: payment?.paymentDate, done: !!payment })

  return nodes
}
