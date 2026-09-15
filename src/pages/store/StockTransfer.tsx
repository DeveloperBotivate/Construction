import { useState } from 'react'
import { ArrowLeftRight, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getStockBalance } from '../../store/selectors'
import { fmtDate } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'

interface TransferRow {
  refDoc: string
  date: string
  materialName: string
  unit: string
  qty: number
  fromSite: string
  toSite: string
}

export default function StockTransfer() {
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const { sites, materials, stockLedger } = state
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const createStockTransfer = useStore(s => s.createStockTransfer)

  const isStore = user.role === 'STORE'

  const [materialId, setMaterialId] = useState('')
  const [fromSiteId, setFromSiteId] = useState('')
  const [toSiteId, setToSiteId] = useState('')
  const [qty, setQty] = useState(0)

  const hasMultipleSites = sites.length >= 2
  const available = materialId && fromSiteId ? getStockBalance(state, materialId, fromSiteId) : 0
  const exceedsStock = qty > available
  const sameSite = !!fromSiteId && fromSiteId === toSiteId

  const canSubmit = isStore && hasMultipleSites && !!materialId && !!fromSiteId && !!toSiteId && !sameSite && qty > 0 && !exceedsStock

  function handleSubmit() {
    if (!canSubmit) return
    createStockTransfer(materialId, fromSiteId, toSiteId, qty, selectedProjectId)
    setMaterialId(''); setFromSiteId(''); setToSiteId(''); setQty(0)
  }

  const transferEntries = stockLedger.filter(e => e.txnType === 'TRANSFER_IN' || e.txnType === 'TRANSFER_OUT')
  const groups = new Map<string, TransferRow>()
  for (const e of transferEntries) {
    const mat = materials.find(m => m.id === e.materialId)
    const existing = groups.get(e.refDoc)
    const siteName = sites.find(s => s.id === e.siteId)?.name ?? '-'
    if (!existing) {
      groups.set(e.refDoc, {
        refDoc: e.refDoc, date: e.date, materialName: mat?.name ?? '-', unit: mat?.unit ?? '',
        qty: Math.abs(e.qty), fromSite: e.txnType === 'TRANSFER_OUT' ? siteName : '-', toSite: e.txnType === 'TRANSFER_IN' ? siteName : '-',
      })
    } else {
      if (e.txnType === 'TRANSFER_OUT') existing.fromSite = siteName
      if (e.txnType === 'TRANSFER_IN') existing.toSite = siteName
    }
  }
  const transferRows = Array.from(groups.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const columns: Column<TransferRow>[] = [
    { key: 'refDoc', header: 'Transfer #', render: r => <span className="font-medium text-ink-800">{r.refDoc}</span> },
    { key: 'material', header: 'Material', render: r => r.materialName },
    { key: 'qty', header: 'Qty', render: r => `${r.qty} ${r.unit}` },
    { key: 'from', header: 'From Site', render: r => r.fromSite },
    { key: 'to', header: 'To Site', render: r => r.toSite },
    { key: 'date', header: 'Date', render: r => fmtDate(r.date), sortValue: r => r.date },
  ]

  return (
    <div>
      <PageHeader title="Stock Transfer" subtitle="Move material stock between sites." />

      <SectionCard title="New Transfer" className="mb-5">
        {!hasMultipleSites && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Only one site exists in this demo project &mdash; add a second site to transfer stock between sites.</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Material *</label>
            <select disabled={!hasMultipleSites} value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm disabled:bg-ink-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select material...</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">From Site *</label>
            <select disabled={!hasMultipleSites} value={fromSiteId} onChange={e => setFromSiteId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm disabled:bg-ink-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select site...</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">To Site *</label>
            <select disabled={!hasMultipleSites} value={toSiteId} onChange={e => setToSiteId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm disabled:bg-ink-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select site...</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {sameSite && <p className="mt-1 text-xs font-medium text-red-600">From and To site cannot be the same.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Quantity *</label>
            <input disabled={!hasMultipleSites} type="number" min={0} value={qty} onChange={e => setQty(Math.max(0, Number(e.target.value)))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm disabled:bg-ink-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            {materialId && fromSiteId && (
              <p className={exceedsStock ? 'mt-1 text-xs font-medium text-red-600' : 'mt-1 text-xs text-ink-500'}>
                Available at source: {available} {materials.find(m => m.id === materialId)?.unit}
                {exceedsStock && ' — exceeds available stock.'}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            disabled={!canSubmit}
            title={!isStore ? 'Only the Store Keeper can initiate a stock transfer.' : !hasMultipleSites ? 'A second site is required to transfer stock.' : !canSubmit ? 'Fill in all fields with a valid quantity not exceeding available stock.' : undefined}
            onClick={handleSubmit}
          >
            Transfer Stock
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Past Transfers">
        <DataTable
          columns={columns}
          data={transferRows}
          keyField={r => r.refDoc}
          emptyMessage="No stock transfers recorded yet."
          emptyIcon={<ArrowLeftRight className="h-8 w-8" />}
        />
      </SectionCard>
    </div>
  )
}
