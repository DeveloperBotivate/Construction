import { useMemo, useState } from 'react'
import { Printer, FolderKanban, ListChecks, FileSignature, ClipboardCheck, Users, Banknote, CalendarX, ScrollText } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getBoqConsumed, getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { fmtCurrency, fmtDate, fmtNumber, daysUntil, cls } from '../../lib/utils'
import type { Store } from '../../store/useStore'

type ReportKey = 'projectProgress' | 'boqProgress' | 'procurement' | 'grn' | 'attendance' | 'payment' | 'documentExpiry' | 'audit'

const REPORT_DEFS: { key: ReportKey; label: string; icon: typeof FolderKanban; description: string }[] = [
  { key: 'projectProgress', label: 'Project Progress', icon: FolderKanban, description: 'Budget vs actual cost and average BOQ progress per project.' },
  { key: 'boqProgress', label: 'BOQ Progress', icon: ListChecks, description: 'Contract vs consumed quantity for every BOQ item.' },
  { key: 'procurement', label: 'Procurement', icon: FileSignature, description: 'Purchase orders with vendor, value and status.' },
  { key: 'grn', label: 'GRN', icon: ClipboardCheck, description: 'Goods received notes with ordered/accepted/rejected totals.' },
  { key: 'attendance', label: 'Attendance', icon: Users, description: 'Daily headcount and labour cost grouped by category.' },
  { key: 'payment', label: 'Payments', icon: Banknote, description: 'All vendor, subcontractor and client payments.' },
  { key: 'documentExpiry', label: 'Document Expiry', icon: CalendarX, description: 'Documents and subscriptions expiring within 30 days.' },
  { key: 'audit', label: 'Audit Log', icon: ScrollText, description: 'Full system audit trail, searchable by record type.' },
]

function attendanceCost(a: Store['attendance'][number]): number {
  if (a.status === 'ABSENT' || a.status === 'LEAVE' || a.status === 'HOLIDAY') return 0
  const base = a.status === 'HALF_DAY' ? a.wageRate / 2 : a.wageRate
  const overtimePay = a.overtimeHours * (a.wageRate / 8) * 1.5
  return base + overtimePay
}

export default function Reports() {
  const state = useStore()
  const [active, setActive] = useState<ReportKey>('projectProgress')

  const projectProgressRows = useMemo(() => state.projects.map(p => {
    const items = state.boqItems.filter(b => b.projectId === p.id)
    const avgPct = items.length > 0 ? Math.round(items.reduce((sum, b) => sum + getBoqProgressPct(state, b.id), 0) / items.length * 10) / 10 : 0
    return { id: p.id, code: p.code, name: p.name, client: p.client, avgPct, budget: p.budget, actualCost: p.actualCost, status: p.status }
  }), [state])

  const boqProgressRows = useMemo(() => state.boqItems.map(b => ({
    id: b.id, boqNumber: b.boqNumber, description: b.description, unit: b.unit, contractQty: b.contractQty,
    consumed: getBoqConsumed(state, b.id), pct: getBoqProgressPct(state, b.id), contractAmount: b.contractAmount, status: b.status,
  })), [state])

  const procurementRows = useMemo(() => state.purchaseOrders.map(po => ({
    id: po.id, poNumber: po.poNumber, vendor: state.vendors.find(v => v.id === po.vendorId)?.name ?? po.vendorId,
    total: po.total, status: po.status, expectedDelivery: po.expectedDelivery, createdAt: po.createdAt,
  })), [state])

  const grnRows = useMemo(() => state.grns.map(g => {
    const ordered = g.items.reduce((s, l) => s + l.orderedQty, 0)
    const accepted = g.items.reduce((s, l) => s + l.acceptedQty, 0)
    const rejected = g.items.reduce((s, l) => s + l.rejectedQty, 0)
    return { id: g.id, grnNumber: g.grnNumber, vendor: state.vendors.find(v => v.id === g.vendorId)?.name ?? g.vendorId, ordered, accepted, rejected, status: g.status, createdAt: g.createdAt }
  }), [state])

  const attendanceRows = useMemo(() => {
    const map = new Map<string, { date: string; category: string; headcount: number; cost: number }>()
    for (const a of state.attendance) {
      const key = `${a.date}|${a.category}`
      const entry = map.get(key) ?? { date: a.date, category: a.category, headcount: 0, cost: 0 }
      if (a.status !== 'ABSENT') entry.headcount += 1
      entry.cost += attendanceCost(a)
      map.set(key, entry)
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [state])

  const paymentRows = useMemo(() => state.payments.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [state])

  const documentExpiryRows = useMemo(() => {
    const rows: { id: string; name: string; kind: string; date: string; days: number; amount?: number }[] = []
    for (const d of state.documents) {
      if (!d.expiryDate) continue
      const days = daysUntil(d.expiryDate)
      if (days <= 30) rows.push({ id: `doc-${d.id}`, name: `${d.docNumber} - ${d.name}`, kind: 'Document', date: d.expiryDate, days })
    }
    for (const s of state.subscriptions) {
      const days = daysUntil(s.renewalDate)
      if (days <= 30) rows.push({ id: `sub-${s.id}`, name: s.name, kind: 'Subscription', date: s.renewalDate, days, amount: s.cost })
    }
    return rows.sort((a, b) => a.days - b.days)
  }, [state])

  const auditRows = useMemo(() => state.auditLog.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [state])

  const projectProgressCols: Column<typeof projectProgressRows[number]>[] = [
    { key: 'code', header: 'Project', render: r => <div><p className="font-medium text-ink-800">{r.name}</p><p className="text-xs text-ink-400">{r.code}</p></div> },
    { key: 'client', header: 'Client', render: r => r.client, hideBelow: 'md' },
    { key: 'progress', header: 'Avg BOQ Progress', render: r => <div className="w-32"><ProgressBar pct={r.avgPct} /><span className="text-xs text-ink-500">{r.avgPct}%</span></div> },
    { key: 'budget', header: 'Budget', render: r => fmtCurrency(r.budget), sortValue: r => r.budget },
    { key: 'actual', header: 'Actual Cost', render: r => fmtCurrency(r.actualCost), sortValue: r => r.actualCost },
    { key: 'variance', header: 'Variance', render: r => <span className={r.budget - r.actualCost < 0 ? 'font-medium text-red-600' : 'font-medium text-emerald-600'}>{fmtCurrency(r.budget - r.actualCost)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const boqProgressCols: Column<typeof boqProgressRows[number]>[] = [
    { key: 'boqNumber', header: 'BOQ #', render: r => <span className="font-medium text-ink-800">{r.boqNumber}</span> },
    { key: 'description', header: 'Description', render: r => r.description },
    { key: 'contractQty', header: 'Contract Qty', render: r => `${fmtNumber(r.contractQty)} ${r.unit}`, hideBelow: 'md' },
    { key: 'consumed', header: 'Consumed', render: r => `${fmtNumber(r.consumed)} ${r.unit}`, hideBelow: 'md' },
    { key: 'pct', header: 'Progress', render: r => <div className="w-32"><ProgressBar pct={r.pct} /><span className="text-xs text-ink-500">{r.pct}%</span></div> },
    { key: 'contractAmount', header: 'Contract Value', render: r => fmtCurrency(r.contractAmount), hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const procurementCols: Column<typeof procurementRows[number]>[] = [
    { key: 'poNumber', header: 'PO #', render: r => <span className="font-medium text-ink-800">{r.poNumber}</span> },
    { key: 'vendor', header: 'Vendor', render: r => r.vendor },
    { key: 'total', header: 'Amount', render: r => fmtCurrency(r.total), sortValue: r => r.total },
    { key: 'expectedDelivery', header: 'Expected Delivery', render: r => fmtDate(r.expectedDelivery), hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const grnCols: Column<typeof grnRows[number]>[] = [
    { key: 'grnNumber', header: 'GRN #', render: r => <span className="font-medium text-ink-800">{r.grnNumber}</span> },
    { key: 'vendor', header: 'Vendor', render: r => r.vendor },
    { key: 'ordered', header: 'Ordered', render: r => fmtNumber(r.ordered) },
    { key: 'accepted', header: 'Accepted', render: r => <span className="text-emerald-700">{fmtNumber(r.accepted)}</span> },
    { key: 'rejected', header: 'Rejected', render: r => <span className={r.rejected > 0 ? 'font-medium text-red-600' : 'text-ink-400'}>{fmtNumber(r.rejected)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  const attendanceCols: Column<typeof attendanceRows[number]>[] = [
    { key: 'date', header: 'Date', render: r => fmtDate(r.date), sortValue: r => r.date },
    { key: 'category', header: 'Category', render: r => r.category },
    { key: 'headcount', header: 'Headcount', render: r => r.headcount, sortValue: r => r.headcount },
    { key: 'cost', header: 'Labour Cost', render: r => fmtCurrency(r.cost), sortValue: r => r.cost },
  ]

  const paymentCols: Column<typeof paymentRows[number]>[] = [
    { key: 'paymentNumber', header: 'Payment #', render: r => <span className="font-medium text-ink-800">{r.paymentNumber}</span> },
    { key: 'type', header: 'Type', render: r => r.type },
    { key: 'payeeName', header: 'Payee', render: r => r.payeeName },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'paymentDate', header: 'Paid On', render: r => fmtDate(r.paymentDate), hideBelow: 'md' },
  ]

  const documentExpiryCols: Column<typeof documentExpiryRows[number]>[] = [
    { key: 'name', header: 'Name', render: r => r.name },
    { key: 'kind', header: 'Kind', render: r => r.kind },
    { key: 'date', header: 'Expiry / Renewal', render: r => fmtDate(r.date), sortValue: r => r.date },
    { key: 'days', header: 'Days Left', render: r => <span className={r.days <= 0 ? 'font-medium text-red-600' : r.days <= 7 ? 'font-medium text-amber-600' : 'text-ink-700'}>{r.days <= 0 ? 'Expired' : `${r.days}d`}</span>, sortValue: r => r.days },
    { key: 'amount', header: 'Cost', render: r => r.amount !== undefined ? fmtCurrency(r.amount) : <span className="text-ink-400">&mdash;</span> },
  ]

  const auditCols: Column<typeof auditRows[number]>[] = [
    { key: 'timestamp', header: 'When', render: r => fmtDate(r.timestamp), sortValue: r => r.timestamp },
    { key: 'recordType', header: 'Record Type', render: r => r.recordType },
    { key: 'recordNumber', header: 'Record #', render: r => r.recordNumber ?? '-' },
    { key: 'action', header: 'Action', render: r => r.action },
    { key: 'userName', header: 'User', render: r => <div>{r.userName}<div className="text-xs text-ink-400">{r.role}</div></div>, hideBelow: 'md' },
    { key: 'reason', header: 'Note', render: r => r.reason ? <span className="italic text-ink-500">"{r.reason}"</span> : <span className="text-ink-400">&mdash;</span>, hideBelow: 'lg' },
  ]

  const reportTable = () => {
    switch (active) {
      case 'projectProgress': return <DataTable columns={projectProgressCols} data={projectProgressRows} keyField={r => r.id} searchable searchFields={r => `${r.name} ${r.code} ${r.client}`} />
      case 'boqProgress': return <DataTable columns={boqProgressCols} data={boqProgressRows} keyField={r => r.id} searchable searchFields={r => `${r.boqNumber} ${r.description}`} />
      case 'procurement': return <DataTable columns={procurementCols} data={procurementRows} keyField={r => r.id} searchable searchFields={r => `${r.poNumber} ${r.vendor} ${r.status}`} />
      case 'grn': return <DataTable columns={grnCols} data={grnRows} keyField={r => r.id} searchable searchFields={r => `${r.grnNumber} ${r.vendor} ${r.status}`} />
      case 'attendance': return <DataTable columns={attendanceCols} data={attendanceRows} keyField={r => r.id} searchable searchFields={r => `${r.date} ${r.category}`} />
      case 'payment': return <DataTable columns={paymentCols} data={paymentRows} keyField={r => r.id} searchable searchFields={r => `${r.paymentNumber} ${r.payeeName} ${r.type} ${r.status}`} />
      case 'documentExpiry': return <DataTable columns={documentExpiryCols} data={documentExpiryRows} keyField={r => r.id} searchable searchFields={r => `${r.name} ${r.kind}`} />
      case 'audit': return <DataTable columns={auditCols} data={auditRows} keyField={r => r.id} searchable searchPlaceholder="Search by record type, action, user..." searchFields={r => `${r.recordType} ${r.recordNumber ?? ''} ${r.action} ${r.userName} ${r.role}`} pageSize={30} />
    }
  }

  const activeDef = REPORT_DEFS.find(r => r.key === active)!

  return (
    <div>
      <PageHeader title="Reports" subtitle="Client-side reports computed directly from live application data." />
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="print:hidden w-full shrink-0 space-y-1.5 lg:w-64">
          {REPORT_DEFS.map(r => (
            <button
              key={r.key}
              onClick={() => setActive(r.key)}
              className={cls(
                'flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors',
                active === r.key ? 'border-brand-300 bg-brand-50' : 'border-ink-200 bg-white hover:bg-ink-50'
              )}
            >
              <r.icon className={cls('mt-0.5 h-4 w-4 shrink-0', active === r.key ? 'text-brand-700' : 'text-ink-400')} />
              <div>
                <p className={cls('text-sm font-medium', active === r.key ? 'text-brand-800' : 'text-ink-800')}>{r.label}</p>
                <p className="text-xs text-ink-500">{r.description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <SectionCard
            title={activeDef.label}
            actions={<Button size="sm" variant="secondary" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => window.print()}>Print</Button>}
          >
            {reportTable()}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
