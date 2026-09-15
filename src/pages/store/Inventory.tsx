import { useNavigate } from 'react-router-dom'
import { Boxes, BookOpen } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance, getOpenPOQty } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import type { Material } from '../../types'

interface Row {
  material: Material
  balance: number
  openPOQty: number
  low: boolean
}

export default function Inventory() {
  const navigate = useNavigate()
  const state = useStore(s => s)
  const { materials, sites } = state
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const site = sites.find(s => s.id === selectedSiteId)

  const rows: Row[] = materials.map(m => {
    const balance = getStockBalance(state, m.id, selectedSiteId)
    return { material: m, balance, openPOQty: getOpenPOQty(state, m.id, selectedProjectId), low: balance < m.reorderLevel }
  })

  const columns: Column<Row>[] = [
    { key: 'name', header: 'Material', render: r => <span className="font-medium text-ink-800">{r.material.name}</span>, sortValue: r => r.material.name },
    { key: 'code', header: 'Code', render: r => r.material.code },
    { key: 'category', header: 'Category', render: r => r.material.category, hideBelow: 'md' },
    { key: 'unit', header: 'Unit', render: r => r.material.unit, hideBelow: 'lg' },
    { key: 'balance', header: 'Current Stock', render: r => <span className={r.low ? 'font-semibold text-red-700' : 'font-medium text-ink-800'}>{r.balance} {r.material.unit}</span>, sortValue: r => r.balance },
    { key: 'reorder', header: 'Reorder Level', render: r => `${r.material.reorderLevel} ${r.material.unit}` },
    { key: 'openPO', header: 'Open PO Qty', render: r => r.openPOQty, hideBelow: 'md' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.low ? 'WARNING' : 'ACTIVE'} label={r.low ? 'Low Stock' : 'Adequate'} /> },
    {
      key: 'actions', header: 'Actions', render: r => (
        <Button size="sm" variant="secondary" icon={<BookOpen className="h-3.5 w-3.5" />} onClick={() => navigate(`/stock-ledger?material=${r.material.id}`)}>View Ledger</Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Inventory" subtitle={site ? `Current stock position at ${site.name}` : 'Current stock position'} />
      <DataTable
        columns={columns}
        data={rows}
        keyField={r => r.material.id}
        onRowClick={r => navigate(`/stock-ledger?material=${r.material.id}`)}
        searchable
        searchPlaceholder="Search materials..."
        searchFields={r => `${r.material.name} ${r.material.code} ${r.material.category}`}
        emptyMessage="No materials in the master catalogue."
        emptyIcon={<Boxes className="h-8 w-8" />}
      />
    </div>
  )
}
