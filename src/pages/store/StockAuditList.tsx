import { useState } from 'react'
import { FileBarChart, Plus, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance } from '../../store/selectors'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import type { StockAudit } from '../../types'

interface Row {
  audit: StockAudit
  siteLabel: string
  auditedByName: string
  varianceCount: number
}

export default function StockAuditList() {
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const { stockAudits, sites, users, materials } = state
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createStockAudit = useStore(s => s.createStockAudit)
  const completeStockAudit = useStore(s => s.completeStockAudit)

  const isStore = user.role === 'STORE'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [physicalQty, setPhysicalQty] = useState<Record<string, number>>({})

  function openDrawer() {
    const defaults: Record<string, number> = {}
    for (const m of materials) defaults[m.id] = getStockBalance(state, m.id, selectedSiteId)
    setPhysicalQty(defaults)
    setDrawerOpen(true)
  }

  function handleSubmit() {
    const lines = materials.map(m => {
      const systemQty = getStockBalance(state, m.id, selectedSiteId)
      const physical = physicalQty[m.id] ?? systemQty
      return { materialId: m.id, systemQty, physicalQty: physical, variance: physical - systemQty }
    })
    createStockAudit({ projectId: selectedProjectId, siteId: selectedSiteId, lines })
    setDrawerOpen(false)
  }

  const rows: Row[] = stockAudits
    .filter(a => !selectedProjectId || a.projectId === selectedProjectId)
    .map(a => ({
      audit: a,
      siteLabel: sites.find(s => s.id === a.siteId)?.name ?? '-',
      auditedByName: users.find(u => u.id === a.auditedBy)?.name ?? a.auditedBy,
      varianceCount: a.lines.filter(l => l.variance !== 0).length,
    }))
    .sort((a, b) => new Date(b.audit.date).getTime() - new Date(a.audit.date).getTime())

  const columns: Column<Row>[] = [
    { key: 'auditNumber', header: 'Audit #', render: r => <span className="font-medium text-ink-800">{r.audit.auditNumber}</span>, sortValue: r => r.audit.auditNumber },
    { key: 'site', header: 'Site', render: r => r.siteLabel, hideBelow: 'md' },
    { key: 'date', header: 'Date', render: r => fmtDate(r.audit.date), sortValue: r => r.audit.date },
    { key: 'auditedBy', header: 'Audited By', render: r => r.auditedByName },
    { key: 'variance', header: 'Variance Count', render: r => <span className={r.varianceCount > 0 ? 'font-medium text-amber-700' : 'text-ink-600'}>{r.varianceCount}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.audit.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => r.audit.status === 'DRAFT' ? (
        <Button
          size="sm" variant="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          disabled={!isStore}
          title={!isStore ? 'Only the Store Keeper can complete a stock audit.' : 'Mark this audit as completed'}
          onClick={() => completeStockAudit(r.audit.id)}
        >
          Complete
        </Button>
      ) : <span className="text-xs text-ink-400">No action required</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Stock Audit"
        subtitle="Physical stock verification against system records."
        actions={
          <Button
            variant="primary" icon={<Plus className="h-4 w-4" />}
            disabled={!isStore}
            title={!isStore ? 'Only the Store Keeper can create a stock audit.' : 'Start a new physical stock audit'}
            onClick={openDrawer}
          >
            New Audit
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.audit.id}
        searchable
        searchPlaceholder="Search by audit number or site..."
        searchFields={r => `${r.audit.auditNumber} ${r.siteLabel}`}
        emptyMessage="No stock audits recorded yet."
        emptyIcon={<FileBarChart className="h-8 w-8" />}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Stock Audit"
        subtitle="Enter the physically counted quantity for each material."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Audit (Draft)</Button>
          </>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-ink-200">
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Material</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">System Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Physical Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {materials.map(m => {
                const systemQty = getStockBalance(state, m.id, selectedSiteId)
                const physical = physicalQty[m.id] ?? systemQty
                const variance = physical - systemQty
                return (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-ink-800">{m.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-600">{systemQty} {m.unit}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <input
                        type="number" value={physical}
                        onChange={e => setPhysicalQty(prev => ({ ...prev, [m.id]: Number(e.target.value) }))}
                        className="w-24 rounded-md border border-ink-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className={`whitespace-nowrap px-3 py-2 font-medium ${variance === 0 ? 'text-ink-500' : variance > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {variance > 0 ? `+${variance}` : variance}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Drawer>
    </div>
  )
}
