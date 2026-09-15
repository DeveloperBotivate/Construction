import { useState } from 'react'
import { PackageMinus, Plus, Check, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance } from '../../store/selectors'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import type { StoreIssue } from '../../types'

interface Row {
  issue: StoreIssue
  siteLabel: string
  materialName: string
}

export default function StoreIssueList() {
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const { storeIssues, materials, sites, boqItems } = state
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createStoreIssueRequest = useStore(s => s.createStoreIssueRequest)
  const approveStoreIssue = useStore(s => s.approveStoreIssue)
  const issueStoreIssue = useStore(s => s.issueStoreIssue)

  const isStore = user.role === 'STORE'
  const isPE = user.role === 'PE'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [materialId, setMaterialId] = useState('')
  const [boqItemId, setBoqItemId] = useState('')
  const [qty, setQty] = useState(0)
  const [department, setDepartment] = useState('')
  const [purpose, setPurpose] = useState('')

  function resetForm() {
    setMaterialId(''); setBoqItemId(''); setQty(0); setDepartment(''); setPurpose('')
  }

  const available = materialId ? getStockBalance(state, materialId, selectedSiteId) : 0
  const exceedsStock = qty > available
  const canSubmit = !!materialId && qty > 0 && !exceedsStock && department.trim() !== '' && purpose.trim() !== ''

  function handleSubmit() {
    if (!canSubmit) return
    createStoreIssueRequest({ projectId: selectedProjectId, siteId: selectedSiteId, materialId, boqItemId: boqItemId || undefined, qty, department, purpose })
    setDrawerOpen(false)
    resetForm()
  }

  const rows: Row[] = storeIssues
    .filter(i => !selectedProjectId || i.projectId === selectedProjectId)
    .map(i => ({
      issue: i,
      siteLabel: sites.find(s => s.id === i.siteId)?.name ?? '-',
      materialName: materials.find(m => m.id === i.materialId)?.name ?? '-',
    }))
    .sort((a, b) => new Date(b.issue.date).getTime() - new Date(a.issue.date).getTime())

  const columns: Column<Row>[] = [
    { key: 'issueNumber', header: 'Issue #', render: r => <span className="font-medium text-ink-800">{r.issue.issueNumber}</span>, sortValue: r => r.issue.issueNumber },
    { key: 'site', header: 'Site', render: r => r.siteLabel, hideBelow: 'md' },
    { key: 'department', header: 'Department', render: r => r.issue.department },
    { key: 'material', header: 'Material', render: r => r.materialName },
    { key: 'qty', header: 'Qty', render: r => r.issue.qty, sortValue: r => r.issue.qty },
    { key: 'purpose', header: 'Purpose', render: r => <span className="line-clamp-1 max-w-xs text-ink-600">{r.issue.purpose}</span>, hideBelow: 'lg' },
    { key: 'date', header: 'Date', render: r => fmtDate(r.issue.date), sortValue: r => r.issue.date },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.issue.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => {
        if (r.issue.status === 'REQUESTED') {
          return (
            <Button
              size="sm" variant="success" icon={<Check className="h-3.5 w-3.5" />}
              disabled={!isPE}
              title={!isPE ? 'Only the Project Engineer can approve a store issue request.' : 'Approve this issue request'}
              onClick={() => approveStoreIssue(r.issue.id)}
            >
              Approve
            </Button>
          )
        }
        if (r.issue.status === 'APPROVED') {
          const availableNow = getStockBalance(state, r.issue.materialId, r.issue.siteId)
          const insufficient = availableNow < r.issue.qty
          return (
            <Button
              size="sm" variant="primary" icon={<Send className="h-3.5 w-3.5" />}
              disabled={!isStore || insufficient}
              title={!isStore ? 'Only the Store Keeper can issue material.' : insufficient ? `Insufficient stock: only ${availableNow} available, ${r.issue.qty} requested.` : 'Issue this material from stock'}
              onClick={() => issueStoreIssue(r.issue.id)}
            >
              Issue
            </Button>
          )
        }
        return <span className="text-xs text-ink-400">No action required</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Store Issue"
        subtitle="Material issue requests raised against site consumption."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setDrawerOpen(true) }}>Request Issue</Button>}
      />

      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.issue.id}
        searchable
        searchPlaceholder="Search by issue number, material or department..."
        searchFields={r => `${r.issue.issueNumber} ${r.materialName} ${r.issue.department} ${r.issue.purpose}`}
        emptyMessage="No store issue requests yet."
        emptyIcon={<PackageMinus className="h-8 w-8" />}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm() }}
        title="Request Store Issue"
        subtitle="Request material to be issued from store stock."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDrawerOpen(false); resetForm() }}>Cancel</Button>
            <Button variant="primary" disabled={!canSubmit} title={!canSubmit ? 'Fill in all required fields; quantity cannot exceed available stock.' : undefined} onClick={handleSubmit}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Material *</label>
            <select value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select material...</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">BOQ Item (optional)</label>
            <select value={boqItemId} onChange={e => setBoqItemId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">None</option>
              {boqItems.filter(b => b.projectId === selectedProjectId).map(b => <option key={b.id} value={b.id}>{b.boqNumber} &mdash; {b.description}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Quantity *</label>
            <input type="number" min={0} value={qty} onChange={e => setQty(Math.max(0, Number(e.target.value)))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            {materialId && (
              <p className={exceedsStock ? 'mt-1 text-xs font-medium text-red-600' : 'mt-1 text-xs text-ink-500'}>
                Available stock: {available} {materials.find(m => m.id === materialId)?.unit}
                {exceedsStock && ' — requested quantity exceeds available stock.'}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Department *</label>
            <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Site Execution - Block A" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Purpose *</label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
