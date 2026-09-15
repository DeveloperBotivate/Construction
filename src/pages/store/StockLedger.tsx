import { useSearchParams, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockLedgerForMaterial } from '../../store/selectors'
import { fmtDateTime } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { StockLedgerEntry } from '../../types'

function inferRecordType(refDoc: string): string | null {
  if (refDoc.startsWith('GRN')) return 'GRN'
  if (refDoc.startsWith('ISS')) return 'StoreIssue'
  if (refDoc.startsWith('RET')) return 'StoreReturn'
  return null
}

export default function StockLedger() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useStore(s => s)
  const { materials, sites } = state
  const selectedSiteId = useStore(s => s.selectedSiteId)

  const paramMaterial = searchParams.get('material') ?? ''
  const materialId = materials.some(m => m.id === paramMaterial) ? paramMaterial : (materials[0]?.id ?? '')
  const material = materials.find(m => m.id === materialId)
  const site = sites.find(s => s.id === selectedSiteId)

  function handleMaterialChange(id: string) {
    setSearchParams({ material: id })
  }

  const ascending = materialId ? getStockLedgerForMaterial(state, materialId, selectedSiteId) : []
  const entries = ascending.slice().reverse()
  const currentBalance = ascending.length > 0 ? ascending[ascending.length - 1].balanceAfter : 0

  const columns: Column<StockLedgerEntry>[] = [
    { key: 'date', header: 'Date', render: e => fmtDateTime(e.date), sortValue: e => e.date },
    { key: 'txnType', header: 'Type', render: e => <StatusBadge status={e.txnType} /> },
    { key: 'qty', header: 'Qty', render: e => <span className={e.qty >= 0 ? 'font-medium text-emerald-700' : 'font-medium text-red-700'}>{e.qty >= 0 ? `+${e.qty}` : e.qty}</span>, sortValue: e => e.qty },
    {
      key: 'refDoc', header: 'Reference', render: e => {
        const recordType = inferRecordType(e.refDoc)
        const link = recordType ? recordLink(recordType, e.refId) : null
        if (link) return <button className="font-medium text-brand-700 hover:underline" onClick={() => navigate(link)}>{e.refDoc}</button>
        return <span className="text-ink-600">{e.refDoc}</span>
      },
    },
    { key: 'balance', header: 'Balance After', render: e => <span className="font-medium text-ink-800">{e.balanceAfter}</span>, sortValue: e => e.balanceAfter },
  ]

  return (
    <div>
      <PageHeader title="Stock Ledger" subtitle={site ? `Material-wise stock movement at ${site.name}` : 'Material-wise stock movement'} />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-xs font-medium text-ink-600">Material</label>
          <select
            value={materialId}
            onChange={e => handleMaterialChange(e.target.value)}
            className="w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
          </select>
        </div>
        <KpiCard label="Current Balance" value={material ? `${currentBalance} ${material.unit}` : '-'} sub={material ? `Reorder level: ${material.reorderLevel} ${material.unit}` : undefined} tone={material && currentBalance < material.reorderLevel ? 'danger' : 'success'} />
      </div>

      <DataTable
        columns={columns}
        data={entries}
        keyField={e => e.id}
        searchable
        searchPlaceholder="Search by reference doc or type..."
        searchFields={e => `${e.refDoc} ${e.txnType}`}
        emptyMessage="No stock movements recorded for this material at the selected site."
        emptyIcon={<BookOpen className="h-8 w-8" />}
      />
    </div>
  )
}
