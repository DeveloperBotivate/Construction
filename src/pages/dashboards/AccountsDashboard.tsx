import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Scale, TriangleAlert, Truck, FileText, Inbox, Landmark, PieChart } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { deriveExceptions } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'

const ACTIVE_MATCH_STATUSES = ['DOCUMENT_CHECK', 'THREE_WAY_MATCH', 'HOLD']
const UNPAID_VENDOR_STATUSES = ['PAID', 'TALLY_POSTED', 'CLOSED']

export default function AccountsDashboard() {
  const navigate = useNavigate()
  const vendorBills = useStore(s => s.vendorBills)
  const subcontractorBills = useStore(s => s.subcontractorBills)
  const freightRecords = useStore(s => s.freightRecords)
  const debitNotes = useStore(s => s.debitNotes)
  const payments = useStore(s => s.payments)
  const approvalTasks = useStore(s => s.approvalTasks)
  const state = useStore(s => s)
  const exceptions = useMemo(() => deriveExceptions(state), [state])

  const mismatches = exceptions.filter(e => e.type === 'INVOICE_MISMATCH' && e.status !== 'RESOLVED')
  const matchQueueCount = vendorBills.filter(b => ACTIVE_MATCH_STATUSES.includes(b.status)).length
  const freightPendingCount = freightRecords.filter(f => f.approvalStatus === 'PENDING').length
  const openDebitNotes = debitNotes.filter(d => d.status !== 'CLOSED')
  const paymentQueueTasks = approvalTasks.filter(t => t.module === 'payment' && t.status === 'PENDING')

  const outstandingLiabilities =
    vendorBills.filter(b => !UNPAID_VENDOR_STATUSES.includes(b.status)).reduce((sum, b) => sum + b.invoiceAmount, 0) +
    subcontractorBills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + b.netPayable, 0)

  const vendorBillStatusCounts = countBy(vendorBills, b => b.status)
  const subcontractorBillStatusCounts = countBy(subcontractorBills, b => b.status)

  const recentPayments = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const recentTallyPostings = payments.filter(p => p.tallyVoucherNumber).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div>
      <PageHeader title="Accounts Dashboard" subtitle="Vendor bills, subcontractor bills, matching, payments and Tally postings." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="3-Way Match Queue" value={matchQueueCount} icon={<Scale className="h-4 w-4" />} sub="Vendor bills awaiting action" />
        <KpiCard label="Invoice Mismatches" value={mismatches.length} tone={mismatches.length > 0 ? 'danger' : 'neutral'} icon={<TriangleAlert className="h-4 w-4" />} />
        <KpiCard label="Payment Queue (MD)" value={paymentQueueTasks.length} tone="warning" icon={<Inbox className="h-4 w-4" />} sub="Pending MD approval" />
        <KpiCard label="Outstanding Liabilities" value={fmtCurrency(outstandingLiabilities)} tone="danger" icon={<Landmark className="h-4 w-4" />} />
        <KpiCard label="Freight Pending Approval" value={freightPendingCount} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Open Debit Notes" value={openDebitNotes.length} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Vendor Bills" value={vendorBills.length} icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Subcontractor Bills" value={subcontractorBills.length} icon={<Receipt className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Vendor Bills by Status">
          <StatusCountList counts={vendorBillStatusCounts} onClick={() => navigate('/bills-payments')} />
        </SectionCard>
        <SectionCard title="Subcontractor Bills by Status">
          <StatusCountList counts={subcontractorBillStatusCounts} onClick={() => navigate('/bills-payments')} />
        </SectionCard>

        <SectionCard title="Invoice Mismatches" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/three-way-match')}>View queue</button>}>
          {mismatches.length === 0 ? <EmptyState message="No open invoice mismatches." /> : (
            <ul className="divide-y divide-ink-100">
              {mismatches.slice(0, 5).map(e => (
                <li key={e.id} className="cursor-pointer py-2.5 hover:bg-ink-50" onClick={() => e.recordId && navigate(`/vendor-bills/${e.recordId}`)}>
                  <p className="text-sm text-ink-700">{e.description}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Payment Queue (MD Approval)" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/bills-payments')}>View all</button>}>
          {paymentQueueTasks.length === 0 ? <EmptyState message="No payments currently awaiting MD approval." /> : (
            <ul className="divide-y divide-ink-100">
              {paymentQueueTasks.map(t => (
                <li key={t.id} className="flex items-center justify-between cursor-pointer py-2.5 hover:bg-ink-50" onClick={() => navigate(`/payments/${t.recordId}`)}>
                  <span className="text-sm text-ink-700">{t.title}</span>
                  <span className="text-sm font-medium text-ink-800">{t.amount ? fmtCurrency(t.amount) : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Payments" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/bills-payments')}>View all</button>}>
          {recentPayments.length === 0 ? <EmptyState message="No payments yet." /> : (
            <ul className="divide-y divide-ink-100">
              {recentPayments.map(p => (
                <li key={p.id} className="flex items-center justify-between cursor-pointer py-2.5 hover:bg-ink-50" onClick={() => navigate(`/payments/${p.id}`)}>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{p.paymentNumber} &middot; {p.payeeName}</p>
                    <p className="text-xs text-ink-500">{fmtCurrency(p.amount)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Tally Postings" actions={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => navigate('/tally')}>Open ledger</button>}>
          {recentTallyPostings.length === 0 ? <EmptyState message="No Tally postings yet." icon={<PieChart className="h-8 w-8" />} /> : (
            <ul className="divide-y divide-ink-100">
              {recentTallyPostings.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{p.tallyVoucherNumber}</p>
                    <p className="text-xs text-ink-500">{p.paymentNumber} &middot; {fmtDate(p.paymentDate)}</p>
                  </div>
                  <span className="text-sm font-medium text-ink-800">{fmtCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function countBy<T>(rows: T[], key: (row: T) => string): Record<string, number> {
  const map: Record<string, number> = {}
  for (const r of rows) { const k = key(r); map[k] = (map[k] ?? 0) + 1 }
  return map
}

function StatusCountList({ counts, onClick }: { counts: Record<string, number>; onClick: () => void }) {
  const entries = Object.entries(counts)
  if (entries.length === 0) return <EmptyState message="No records yet." />
  return (
    <ul className="divide-y divide-ink-100">
      {entries.map(([status, count]) => (
        <li key={status} className="flex items-center justify-between cursor-pointer py-2.5 hover:bg-ink-50" onClick={onClick}>
          <StatusBadge status={status} />
          <span className="text-sm font-semibold text-ink-800">{count}</span>
        </li>
      ))}
    </ul>
  )
}
