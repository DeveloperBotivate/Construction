import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtCurrency } from '../../lib/utils'

interface Hit { type: string; id: string; title: string; sub: string; path: string }

export function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const state = useStore()

  const hits: Hit[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const results: Hit[] = []
    for (const p of state.projects) if (p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)) results.push({ type: 'Project', id: p.id, title: p.code, sub: p.name, path: `/projects/${p.id}` })
    for (const b of state.boqItems) if (b.boqNumber.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)) results.push({ type: 'BOQ', id: b.id, title: b.boqNumber, sub: b.description, path: `/boq/${b.id}` })
    for (const i of state.materialIndents) if (i.indentNumber.toLowerCase().includes(q)) results.push({ type: 'Indent', id: i.id, title: i.indentNumber, sub: `${i.requiredQty} ${i.unit} - ${i.status}`, path: `/indents/${i.id}` })
    for (const e of state.enquiries) if (e.rfqNumber.toLowerCase().includes(q)) results.push({ type: 'RFQ', id: e.id, title: e.rfqNumber, sub: e.status, path: `/enquiries/${e.id}` })
    for (const po of state.purchaseOrders) if (po.poNumber.toLowerCase().includes(q)) { const v = state.vendors.find(v => v.id === po.vendorId); results.push({ type: 'PO', id: po.id, title: po.poNumber, sub: `${v?.name ?? ''} - ${fmtCurrency(po.total)} - ${po.status}`, path: `/po/${po.id}` }) }
    for (const v of state.vendors) if (v.name.toLowerCase().includes(q)) results.push({ type: 'Vendor', id: v.id, title: v.name, sub: v.category, path: `/po` })
    for (const g of state.grns) if (g.grnNumber.toLowerCase().includes(q)) results.push({ type: 'GRN', id: g.id, title: g.grnNumber, sub: g.status, path: `/grn/${g.id}` })
    for (const m of state.materials) if (m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)) results.push({ type: 'Material', id: m.id, title: m.name, sub: m.category, path: `/inventory` })
    for (const d of state.dailyReports) if (d.dprNumber.toLowerCase().includes(q)) results.push({ type: 'DPR', id: d.id, title: d.dprNumber, sub: `${d.activity} - ${d.status}`, path: `/dpr/${d.id}` })
    for (const u of state.users) if (u.name.toLowerCase().includes(q) || u.employeeId.toLowerCase().includes(q)) results.push({ type: 'Employee', id: u.id, title: u.name, sub: `${u.employeeId} - ${u.designation}`, path: `/admin` })
    for (const c of state.checklistInstances) if (c.checklistNumber.toLowerCase().includes(q)) results.push({ type: 'Checklist', id: c.id, title: c.checklistNumber, sub: `${c.templateName} - ${c.status}`, path: `/checklist/${c.id}` })
    for (const b of state.subcontractorBills) if (b.billNumber.toLowerCase().includes(q)) results.push({ type: 'Bill', id: b.id, title: b.billNumber, sub: `${fmtCurrency(b.netPayable)} - ${b.status}`, path: `/subcontractor-bills/${b.id}` })
    for (const p of state.payments) if (p.paymentNumber.toLowerCase().includes(q)) results.push({ type: 'Payment', id: p.id, title: p.paymentNumber, sub: `${p.payeeName} - ${fmtCurrency(p.amount)} - ${p.status}`, path: `/payments/${p.id}` })
    for (const d of state.documents) if (d.name.toLowerCase().includes(q) || d.docNumber.toLowerCase().includes(q)) results.push({ type: 'Document', id: d.id, title: d.docNumber, sub: d.name, path: `/documents` })
    return results.slice(0, 10)
  }, [query, state])

  return (
    <div className="relative w-full max-w-sm" ref={boxRef}>
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search projects, BOQ, PO, GRN, vendors, employees..."
        className="w-full rounded-md border border-ink-300 bg-ink-50 py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {open && query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[28rem] rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg">
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-ink-400">No results for "{query}"</p>
          ) : (
            hits.map(h => (
              <button
                key={`${h.type}-${h.id}`}
                onClick={() => { navigate(h.path); setOpen(false); setQuery('') }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left hover:bg-ink-50"
              >
                <span>
                  <span className="block text-sm font-medium text-ink-800">{h.title}</span>
                  <span className="block text-xs text-ink-500">{h.sub}</span>
                </span>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-500">{h.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
