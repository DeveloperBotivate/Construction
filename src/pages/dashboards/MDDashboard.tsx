import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, IndianRupee, TrendingUp, Scale, ShoppingCart, PackageX, Truck,
  Receipt, HandCoins, Landmark, Wallet, Inbox, TriangleAlert,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { deriveExceptions } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { recordLink } from '../../lib/recordLinks'
import { fmtCurrency, fmtDateTime } from '../../lib/utils'

const OPEN_PO_STATUSES = ['DRAFT', 'SUBMITTED', 'TECHNICAL_APPROVED', 'MGMT_APPROVAL_PENDING', 'APPROVED', 'ISSUED', 'PARTIALLY_RECEIVED']
const SETTLED_VENDOR_BILL = ['PAID', 'TALLY_POSTED', 'CLOSED']

export default function MDDashboard() {
  const state = useStore()
  const navigate = useNavigate()
  const exceptions = useMemo(() => deriveExceptions(state), [state])

  const activeProjects = state.projects.filter(p => p.status === 'ACTIVE')
  const contractValueSum = state.projects.reduce((s, p) => s + p.contractValue, 0)
  const avgProgress = state.projects.length > 0 ? Math.round(state.projects.reduce((s, p) => s + p.progressPct, 0) / state.projects.length) : 0
  const budgetSum = state.projects.reduce((s, p) => s + p.budget, 0)
  const actualSum = state.projects.reduce((s, p) => s + p.actualCost, 0)

  const activePOs = state.purchaseOrders.filter(po => OPEN_PO_STATUSES.includes(po.status))
  const activePOValue = activePOs.reduce((s, po) => s + po.total, 0)

  const lowStockCount = exceptions.filter(e => e.type === 'LOW_STOCK').length
  const delayedCount = exceptions.filter(e => e.type === 'DELAYED_DELIVERY').length

  const clientBilling = state.raBills.reduce((s, b) => s + b.netAmount, 0)
  const receivables = state.raBills.reduce((s, b) => s + Math.max(0, b.netAmount - b.receivedAmount), 0)

  const vendorPayables = state.vendorBills.filter(b => !SETTLED_VENDOR_BILL.includes(b.status)).reduce((s, b) => s + b.invoiceAmount, 0)
  const subLiabilities = state.subcontractorBills.filter(b => b.status !== 'PAID').reduce((s, b) => s + b.netPayable, 0)
  const netCashFlow = receivables - (vendorPayables + subLiabilities)

  const pendingApprovals = state.approvalTasks.filter(t => t.status === 'PENDING').length
  const criticalExceptions = exceptions.filter(e => e.severity === 'CRITICAL')
  const recentAudit = state.auditLog.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

  return (
    <div>
      <PageHeader title="Managing Director Dashboard" subtitle="Full-visibility view across all projects, finance and operations." />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Active Projects" value={activeProjects.length} sub={`${state.projects.length} total`} icon={<Building2 className="h-4 w-4" />} />
        <KpiCard label="Contract Value" value={fmtCurrency(contractValueSum)} icon={<IndianRupee className="h-4 w-4" />} />
        <KpiCard label="Avg. Progress" value={`${avgProgress}%`} icon={<TrendingUp className="h-4 w-4" />} tone="brand" />
        <KpiCard label="Budget vs Actual" value={fmtCurrency(actualSum)} sub={`Budget ${fmtCurrency(budgetSum)}`} tone={actualSum > budgetSum ? 'danger' : 'success'} icon={<Scale className="h-4 w-4" />} />
        <KpiCard label="Active Procurement" value={activePOs.length} sub={fmtCurrency(activePOValue)} icon={<ShoppingCart className="h-4 w-4" />} />
        <KpiCard label="Low Stock Alerts" value={lowStockCount} tone={lowStockCount > 0 ? 'warning' : 'neutral'} icon={<PackageX className="h-4 w-4" />} />
        <KpiCard label="Delayed Deliveries" value={delayedCount} tone={delayedCount > 0 ? 'danger' : 'neutral'} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Client Billing" value={fmtCurrency(clientBilling)} icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Receivables Outstanding" value={fmtCurrency(receivables)} tone={receivables > 0 ? 'warning' : 'success'} icon={<HandCoins className="h-4 w-4" />} />
        <KpiCard label="Vendor Payables" value={fmtCurrency(vendorPayables)} tone={vendorPayables > 0 ? 'warning' : 'success'} icon={<Landmark className="h-4 w-4" />} />
        <KpiCard label="Subcontractor Liabilities" value={fmtCurrency(subLiabilities)} tone={subLiabilities > 0 ? 'warning' : 'success'} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label="Net Cash Flow" value={fmtCurrency(netCashFlow)} tone={netCashFlow >= 0 ? 'success' : 'danger'} icon={<Scale className="h-4 w-4" />} />
        <KpiCard label="Pending Approvals" value={pendingApprovals} icon={<Inbox className="h-4 w-4" />} />
        <KpiCard label="Critical Exceptions" value={criticalExceptions.length} tone={criticalExceptions.length > 0 ? 'danger' : 'neutral'} icon={<TriangleAlert className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Active Projects" className="xl:col-span-2">
          {activeProjects.length === 0 ? <EmptyState message="No active projects." /> : (
            <div className="overflow-x-auto rounded-lg border border-ink-200">
              <table className="min-w-full divide-y divide-ink-200 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Project</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Client</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Progress</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Budget vs Actual</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {activeProjects.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 font-medium text-ink-800">{p.name}<div className="text-xs text-ink-400">{p.code}</div></td>
                      <td className="px-3 py-2 text-ink-600">{p.client}</td>
                      <td className="px-3 py-2"><div className="w-32"><ProgressBar pct={p.progressPct} /><span className="text-xs text-ink-500">{p.progressPct}%</span></div></td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(p.actualCost)} / {fmtCurrency(p.budget)}</td>
                      <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Critical Exceptions">
          {criticalExceptions.length === 0 ? <EmptyState message="No critical exceptions right now." /> : (
            <ul className="space-y-2">
              {criticalExceptions.slice(0, 8).map(e => {
                const link = e.recordType && e.recordId ? recordLink(e.recordType, e.recordId) : null
                return (
                  <li key={e.id} className={link ? 'cursor-pointer rounded-md border border-red-200 bg-red-50/40 p-2.5 hover:bg-red-50' : 'rounded-md border border-red-200 bg-red-50/40 p-2.5'} onClick={() => link && navigate(link)}>
                    <p className="text-sm font-medium text-red-800">{e.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-ink-600">{e.description}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Audit Alerts">
          {recentAudit.length === 0 ? <EmptyState message="No audit activity yet." /> : (
            <ul className="space-y-2">
              {recentAudit.map(a => (
                <li key={a.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-800">{a.action}</p>
                    <span className="text-xs text-ink-400">{fmtDateTime(a.timestamp)}</span>
                  </div>
                  <p className="text-xs text-ink-500">{a.recordType} {a.recordNumber} &middot; {a.userName}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
