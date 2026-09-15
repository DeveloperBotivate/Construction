import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Eye, Send, PackageCheck, FileSignature, Trash2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button, IconButton } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency, fmtDate, nowIso } from '../../lib/utils'
import type { PurchaseOrder, POLine } from '../../types'

interface PONewState {
  rfqId?: string
  vendorId?: string
  indentId?: string
}

interface LineForm {
  materialId: string
  qty: string
  rate: string
  tax: string
}

function emptyLine(): LineForm {
  return { materialId: '', qty: '', rate: '', tax: '' }
}

export default function PurchaseOrdersList() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useStore(s => s.currentUser!)
  const purchaseOrders = useStore(s => s.purchaseOrders)
  const vendors = useStore(s => s.vendors)
  const projects = useStore(s => s.projects)
  const materials = useStore(s => s.materials)
  const enquiries = useStore(s => s.enquiries)
  const materialIndents = useStore(s => s.materialIndents)
  const vendorQuotations = useStore(s => s.vendorQuotations)
  const sites = useStore(s => s.sites)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createPO = useStore(s => s.createPO)
  const submitPO = useStore(s => s.submitPO)
  const issuePO = useStore(s => s.issuePO)

  const canManage = user.role === 'PROCUREMENT'

  const [open, setOpen] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [projectId, setProjectId] = useState(selectedProjectId)
  const [siteId, setSiteId] = useState(selectedSiteId)
  const [lines, setLines] = useState<LineForm[]>([emptyLine()])
  const [freight, setFreight] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [warranty, setWarranty] = useState('')
  const [terms, setTerms] = useState('')
  const [linkRfqId, setLinkRfqId] = useState<string | undefined>(undefined)
  const [linkIndentId, setLinkIndentId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const state = location.state as PONewState | null
    if (!state?.rfqId || !state.vendorId) return
    const enquiry = enquiries.find(e => e.id === state.rfqId)
    const indent = state.indentId ? materialIndents.find(i => i.id === state.indentId) : undefined
    const quote = vendorQuotations.find(q => q.rfqId === state.rfqId && q.vendorId === state.vendorId)
    const site = indent ? sites.find(st => st.id === indent.siteId) : undefined

    setVendorId(state.vendorId)
    setProjectId(indent?.projectId ?? selectedProjectId)
    setSiteId(indent?.siteId ?? selectedSiteId)
    setLines([{
      materialId: enquiry?.materialId ?? '',
      qty: String(enquiry?.qty ?? ''),
      rate: String(quote?.rate ?? ''),
      tax: String(quote?.tax ?? ''),
    }])
    setFreight(String(quote?.freight ?? ''))
    setDeliveryLocation(site?.address ?? site?.name ?? '')
    if (quote?.deliveryDays) {
      setExpectedDelivery(new Date(Date.now() + quote.deliveryDays * 86400000).toISOString().slice(0, 10))
    }
    setPaymentTerms(quote?.paymentTerms ?? '')
    setLinkRfqId(state.rfqId)
    setLinkIndentId(state.indentId)
    setOpen(true)
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  function resetForm() {
    setVendorId(''); setProjectId(selectedProjectId); setSiteId(selectedSiteId)
    setLines([emptyLine()]); setFreight(''); setDeliveryLocation(''); setExpectedDelivery('')
    setPaymentTerms(''); setWarranty(''); setTerms(''); setLinkRfqId(undefined); setLinkIndentId(undefined)
  }

  function updateLine(idx: number, patch: Partial<LineForm>) {
    setLines(ls => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }
  function addLine() { setLines(ls => [...ls, emptyLine()]) }
  function removeLine(idx: number) { setLines(ls => ls.filter((_, i) => i !== idx)) }

  const validLines = lines.filter(l => l.materialId && Number(l.qty) > 0 && Number(l.rate) >= 0)
  const canSave = !!vendorId && !!projectId && !!siteId && validLines.length > 0

  function handleCreate() {
    if (!canSave) return
    const items: POLine[] = validLines.map(l => {
      const mat = materials.find(m => m.id === l.materialId)
      return { materialId: l.materialId, materialName: mat?.name ?? '', qty: Number(l.qty) || 0, unit: mat?.unit ?? '', rate: Number(l.rate) || 0, tax: Number(l.tax) || 0, receivedQty: 0 }
    })
    const po = createPO({
      vendorId, projectId, siteId, items, freight: Number(freight) || 0,
      deliveryLocation, expectedDelivery: expectedDelivery || nowIso(),
      paymentTerms, warranty, terms, rfqId: linkRfqId, indentId: linkIndentId,
    })
    setOpen(false)
    resetForm()
    navigate(`/po/${po.id}`)
  }

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO #', render: r => <span className="font-medium text-ink-800">{r.poNumber}</span>, sortValue: r => r.poNumber },
    { key: 'vendor', header: 'Vendor', render: r => vendors.find(v => v.id === r.vendorId)?.name ?? '-' },
    { key: 'project', header: 'Project', render: r => projects.find(p => p.id === r.projectId)?.code ?? '-' },
    { key: 'total', header: 'Total', render: r => fmtCurrency(r.total), sortValue: r => r.total },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'expectedDelivery', header: 'Expected Delivery', render: r => fmtDate(r.expectedDelivery), sortValue: r => r.expectedDelivery },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <IconButton icon={<Eye className="h-4 w-4" />} title="View PO" onClick={() => navigate(`/po/${r.id}`)} />
          {r.status === 'DRAFT' && (
            <Button size="sm" variant="primary" icon={<Send className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Procurement can submit this PO for approval.' : undefined} onClick={() => submitPO(r.id)}>Submit</Button>
          )}
          {r.status === 'APPROVED' && (
            <Button size="sm" variant="success" icon={<PackageCheck className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Procurement can issue this PO to the vendor.' : undefined} onClick={() => issuePO(r.id)}>Issue</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track PO creation, management approval, issuance and receipt status."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} disabled={!canManage} title={!canManage ? 'Only Procurement can create Purchase Orders.' : undefined} onClick={() => setOpen(true)}>
            Create PO
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={purchaseOrders}
        keyField={r => r.id}
        onRowClick={r => navigate(`/po/${r.id}`)}
        searchable
        searchPlaceholder="Search purchase orders..."
        searchFields={r => `${r.poNumber} ${vendors.find(v => v.id === r.vendorId)?.name ?? ''} ${r.status}`}
        emptyMessage="No purchase orders created yet."
        emptyIcon={<FileSignature className="h-8 w-8" />}
      />

      <Drawer
        open={open}
        onClose={() => { setOpen(false); resetForm() }}
        title="Create Purchase Order"
        subtitle={linkRfqId ? 'Pre-filled from selected vendor enquiry.' : 'Raise a new PO to a vendor.'}
        width="lg"
        footer={<>
          <Button variant="secondary" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
          <Button variant="primary" disabled={!canSave} onClick={handleCreate}>Create PO (Draft)</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Vendor</label>
              <select value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Select vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Project</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Site</label>
              <select value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {sites.filter(st => st.projectId === projectId).map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-ink-600">Line Items</label>
              <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={addLine}>Add Line</Button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => {
                const mat = materials.find(m => m.id === line.materialId)
                return (
                  <div key={idx} className="grid grid-cols-12 items-center gap-2 rounded-md border border-ink-200 p-2">
                    <select value={line.materialId} onChange={e => updateLine(idx, { materialId: e.target.value })} className="col-span-4 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                      <option value="">Material...</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input type="number" min="0" placeholder="Qty" value={line.qty} onChange={e => updateLine(idx, { qty: e.target.value })} className="col-span-2 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    <span className="col-span-1 text-center text-xs text-ink-400">{mat?.unit ?? ''}</span>
                    <input type="number" min="0" placeholder="Rate" value={line.rate} onChange={e => updateLine(idx, { rate: e.target.value })} className="col-span-2 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    <input type="number" min="0" placeholder="Tax %" value={line.tax} onChange={e => updateLine(idx, { tax: e.target.value })} className="col-span-2 rounded-md border border-ink-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    <IconButton icon={<Trash2 className="h-4 w-4" />} title="Remove line" className="col-span-1" disabled={lines.length <= 1} onClick={() => removeLine(idx)} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Freight</label>
              <input type="number" min="0" value={freight} onChange={e => setFreight(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Expected Delivery</label>
              <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Delivery Location</label>
            <input value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Payment Terms</label>
              <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. 30 days from GRN" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Warranty</label>
              <input value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Terms & Conditions</label>
            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
