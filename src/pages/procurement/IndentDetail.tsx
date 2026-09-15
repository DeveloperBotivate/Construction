import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, CornerUpLeft, FileSearch } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance, getOpenPOQty, buildIndentTrace } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
import type { TabItem } from '../../components/ui/Tabs'
import { Card, SectionCard } from '../../components/ui/Card'
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Timeline, approvalStepIcon, approvalStepTone } from '../../components/ui/Timeline'
import { ApprovalActionBar } from '../../components/ui/ApprovalActionBar'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { TraceabilityPanel } from '../../components/ui/TraceabilityPanel'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/utils'

export default function IndentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const submitIndent = useStore(s => s.submitIndent)
  const resubmitIndent = useStore(s => s.resubmitIndent)
  const createEnquiry = useStore(s => s.createEnquiry)

  const [rfqOpen, setRfqOpen] = useState(false)
  const [vendorIds, setVendorIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [techReq, setTechReq] = useState('')
  const [remarks, setRemarks] = useState('')

  const indent = state.materialIndents.find(i => i.id === id)

  if (!indent) {
    return (
      <div>
        <PageHeader title="Indent not found" breadcrumb={[{ label: 'Material Indents', to: '/indents' }, { label: 'Not found' }]} />
        <EmptyState message="This material indent does not exist or has been removed." />
      </div>
    )
  }

  const material = state.materials.find(m => m.id === indent.materialId)
  const boq = state.boqItems.find(b => b.id === indent.boqItemId)
  const project = state.projects.find(p => p.id === indent.projectId)
  const site = state.sites.find(st => st.id === indent.siteId)
  const existingEnquiry = state.enquiries.find(e => e.indentId === indent.id)

  const stockBal = getStockBalance(state, indent.materialId, indent.siteId)
  const openPO = getOpenPOQty(state, indent.materialId, indent.projectId)
  const netReq = Math.max(0, indent.requiredQty - stockBal - openPO)

  const canSubmit = user.role === 'PE' && indent.createdBy === user.id
  const canResubmit = user.role === 'PE'
  const canCreateRfq = user.role === 'PROCUREMENT'

  function toggleVendor(vid: string) {
    setVendorIds(v => (v.includes(vid) ? v.filter(x => x !== vid) : [...v, vid]))
  }

  function handleCreateRfq() {
    if (vendorIds.length === 0 || !dueDate) return
    const enquiry = createEnquiry(indent!.id, vendorIds, dueDate, techReq, remarks)
    setRfqOpen(false)
    navigate(`/enquiries/${enquiry.id}`)
  }

  const overviewTab = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-xs uppercase text-ink-500">Project</dt><dd className="font-medium text-ink-800">{project?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Site</dt><dd className="font-medium text-ink-800">{site?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">BOQ Item</dt><dd className="font-medium text-ink-800">{boq ? `${boq.boqNumber} - ${boq.description}` : '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Material</dt><dd className="font-medium text-ink-800">{material?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Required Qty</dt><dd className="font-medium text-ink-800">{indent.requiredQty} {indent.unit}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Required By</dt><dd className="font-medium text-ink-800">{fmtDate(indent.requiredDate)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Priority</dt><dd><PriorityBadge priority={indent.priority} /></dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Status</dt><dd><StatusBadge status={indent.status} /></dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Work Area</dt><dd className="font-medium text-ink-800">{indent.workArea || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Drawing Ref</dt><dd className="font-medium text-ink-800">{indent.drawingRef || '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Created</dt><dd className="font-medium text-ink-800">{fmtDate(indent.createdAt)}</dd></div>
          <div className="col-span-2 sm:col-span-3"><dt className="text-xs uppercase text-ink-500">Purpose</dt><dd className="text-ink-700">{indent.purpose || '-'}</dd></div>
          <div className="col-span-2 sm:col-span-3"><dt className="text-xs uppercase text-ink-500">Remarks</dt><dd className="text-ink-700">{indent.remarks || '-'}</dd></div>
        </dl>
      </Card>
      <SectionCard title="Requirement Calculation">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-ink-500">Required Qty</span><span className="font-medium text-ink-800">{indent.requiredQty} {indent.unit}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Current Stock Balance</span><span className="font-medium text-ink-800">-{stockBal} {indent.unit}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Open PO Qty</span><span className="font-medium text-ink-800">-{openPO} {indent.unit}</span></div>
          <div className="flex justify-between border-t border-ink-200 pt-2 font-semibold text-brand-700"><span>Net Requirement to Procure</span><span>{netReq} {indent.unit}</span></div>
        </div>
      </SectionCard>
    </div>
  )

  const workflowSteps = indent.approvalHistory.map(h => ({
    id: h.id,
    title: `${h.action.replace('_', ' ')}${h.approverName ? ` by ${h.approverName}` : ''}`,
    subtitle: h.comment,
    timestamp: h.timestamp,
    tone: approvalStepTone(h.action),
    icon: approvalStepIcon(h.action),
  }))

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', content: overviewTab },
    { key: 'trace', label: 'Traceability', content: <TraceabilityPanel nodes={buildIndentTrace(state, indent.id)} /> },
    { key: 'workflow', label: 'Workflow Status', content: <Timeline steps={workflowSteps} /> },
    { key: 'approvals', label: 'Approval History', content: <ApprovalActionBar recordId={indent.id} /> },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="MaterialIndent" recordId={indent.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="MaterialIndent" recordId={indent.id} /> },
  ]

  const activeVendors = state.vendors.filter(v => v.status === 'ACTIVE')

  return (
    <div>
      <PageHeader
        title={indent.indentNumber}
        subtitle={`${material?.name ?? ''} - ${indent.requiredQty} ${indent.unit}`}
        breadcrumb={[{ label: 'Material Indents', to: '/indents' }, { label: indent.indentNumber }]}
        actions={<>
          {indent.status === 'DRAFT' && (
            <Button variant="primary" icon={<Send className="h-4 w-4" />} disabled={!canSubmit} title={!canSubmit ? 'Only the PE who created this indent can submit it.' : undefined} onClick={() => submitIndent(indent.id)}>
              Submit for Approval
            </Button>
          )}
          {indent.status === 'CORRECTION_REQUIRED' && (
            <Button variant="primary" icon={<CornerUpLeft className="h-4 w-4" />} disabled={!canResubmit} title={!canResubmit ? 'Only a Project Engineer can resubmit this indent.' : undefined} onClick={() => resubmitIndent(indent.id)}>
              Resubmit
            </Button>
          )}
          {indent.status === 'PROCUREMENT_PENDING' && !existingEnquiry && (
            <Button variant="primary" icon={<FileSearch className="h-4 w-4" />} disabled={!canCreateRfq} title={!canCreateRfq ? 'Only Procurement can raise an RFQ.' : undefined} onClick={() => setRfqOpen(true)}>
              Create RFQ / Enquiry
            </Button>
          )}
        </>}
      />
      <Tabs tabs={tabs} />

      <Drawer
        open={rfqOpen}
        onClose={() => setRfqOpen(false)}
        title="Create RFQ / Enquiry"
        subtitle={`For ${indent.indentNumber} - ${material?.name ?? ''}`}
        footer={<>
          <Button variant="secondary" onClick={() => setRfqOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={vendorIds.length === 0 || !dueDate} onClick={handleCreateRfq}>Send RFQ</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Invite Vendors</label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-ink-200 p-2">
              {activeVendors.map(v => (
                <label key={v.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-ink-50">
                  <input type="checkbox" checked={vendorIds.includes(v.id)} onChange={() => toggleVendor(v.id)} className="rounded border-ink-300" />
                  <span className="text-ink-700">{v.name}</span>
                  <span className="text-xs text-ink-400">({v.category})</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Quotation Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Technical Requirements</label>
            <textarea value={techReq} onChange={e => setTechReq(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Specification, standards, certification requirements..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
