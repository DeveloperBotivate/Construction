import { useMemo } from 'react'
import {
  TrendingUp, PackageSearch, ShoppingCart, Truck, NotebookPen, Users,
  Coins, AlertTriangle, CheckSquare, XCircle, Inbox,
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getBoqProgressPct, deriveExceptions, pendingApprovalsForRole } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency } from '../../lib/utils'

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

export default function PMDashboard() {
  const state = useStore()
  const user = state.currentUser!

  const myProjects = useMemo(() => {
    const scoped = state.projects.filter(p => user.projectIds.includes(p.id))
    return scoped.length > 0 ? scoped : state.projects
  }, [state.projects, user.projectIds])
  const myProjectIds = useMemo(() => new Set(myProjects.map(p => p.id)), [myProjects])

  const boqItems = useMemo(() => state.boqItems.filter(b => myProjectIds.has(b.projectId)), [state.boqItems, myProjectIds])
  const boqRows = useMemo(() => boqItems.map(b => ({ ...b, pct: getBoqProgressPct(state, b.id) })), [state, boqItems])
  const avgProgress = boqRows.length > 0 ? Math.round(boqRows.reduce((s, b) => s + b.pct, 0) / boqRows.length) : 0

  const pendingIndents = useMemo(() => state.materialIndents.filter(i => myProjectIds.has(i.projectId) && ['SUBMITTED', 'PM_REVIEW'].includes(i.status)), [state.materialIndents, myProjectIds])
  const pendingProcurement = useMemo(() => state.purchaseOrders.filter(po => myProjectIds.has(po.projectId) && po.status === 'MGMT_APPROVAL_PENDING'), [state.purchaseOrders, myProjectIds])

  const exceptions = useMemo(() => deriveExceptions(state), [state])
  const delayedDeliveries = exceptions.filter(e => e.type === 'DELAYED_DELIVERY' && (!e.projectId || myProjectIds.has(e.projectId)))

  const dprs = useMemo(() => state.dailyReports.filter(d => myProjectIds.has(d.projectId)), [state.dailyReports, myProjectIds])
  const dprStatusBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of dprs) map.set(d.status, (map.get(d.status) ?? 0) + 1)
    return Array.from(map.entries())
  }, [dprs])
  const dprPendingReview = dprs.filter(d => ['SUBMITTED', 'PE_REVIEW', 'PM_REVIEW'].includes(d.status)).length

  const latestAttendanceDate = useMemo(() => state.attendance.reduce((max, a) => (!max || new Date(a.date) > new Date(max)) ? a.date : max, ''), [state.attendance])
  const latestAttendance = useMemo(() => latestAttendanceDate ? state.attendance.filter(a => isSameDay(a.date, latestAttendanceDate)) : [], [state.attendance, latestAttendanceDate])
  const headcount = latestAttendance.filter(a => a.status !== 'ABSENT').length
  const labourCost = latestAttendance.reduce((s, a) => {
    if (a.status === 'ABSENT' || a.status === 'LEAVE' || a.status === 'HOLIDAY') return s
    const base = a.status === 'HALF_DAY' ? a.wageRate / 2 : a.wageRate
    return s + base + a.overtimeHours * (a.wageRate / 8) * 1.5
  }, 0)

  const workOrders = useMemo(() => state.workOrders.filter(w => myProjectIds.has(w.projectId)), [state.workOrders, myProjectIds])
  const woProgress = useMemo(() => workOrders.map(wo => {
    const executed = state.measurements.filter(m => m.workOrderId === wo.id).reduce((s, m) => s + m.amount, 0)
    const pct = wo.value > 0 ? Math.min(100, Math.round((executed / wo.value) * 100)) : 0
    return { ...wo, executed, pct, subName: state.subcontractors.find(sc => sc.id === wo.subcontractorId)?.name ?? wo.subcontractorId }
  }), [workOrders, state.measurements, state.subcontractors])

  const openSiteIssues = state.siteIssues.filter(i => myProjectIds.has(i.projectId) && i.status === 'OPEN')
  const checklistPending = state.checklistInstances.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status))
  const checklistFailed = state.checklistInstances.filter(c => c.status === 'FAILED_PENDING_CORRECTION')
  const myApprovals = pendingApprovalsForRole(state, 'PM')

  return (
    <div>
      <PageHeader title="Project Manager Dashboard" subtitle="Site execution, procurement and approval overview for your projects." />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Avg. BOQ Progress" value={`${avgProgress}%`} sub={`${boqRows.length} BOQ items`} tone="brand" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Pending Material Indents" value={pendingIndents.length} icon={<PackageSearch className="h-4 w-4" />} />
        <KpiCard label="Pending Procurement" value={pendingProcurement.length} icon={<ShoppingCart className="h-4 w-4" />} />
        <KpiCard label="Delayed Deliveries" value={delayedDeliveries.length} tone={delayedDeliveries.length > 0 ? 'danger' : 'neutral'} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="DPR Pending Review" value={dprPendingReview} sub={`${dprs.length} total DPRs`} icon={<NotebookPen className="h-4 w-4" />} />
        <KpiCard label="Headcount (latest day)" value={headcount} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Labour Cost (latest day)" value={fmtCurrency(labourCost)} icon={<Coins className="h-4 w-4" />} />
        <KpiCard label="Open Site Issues" value={openSiteIssues.length} tone={openSiteIssues.length > 0 ? 'warning' : 'neutral'} icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Checklist Pending" value={checklistPending.length} icon={<CheckSquare className="h-4 w-4" />} />
        <KpiCard label="Checklist Failed" value={checklistFailed.length} tone={checklistFailed.length > 0 ? 'danger' : 'neutral'} icon={<XCircle className="h-4 w-4" />} />
        <KpiCard label="My Pending Approvals" value={myApprovals.length} icon={<Inbox className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="BOQ Progress">
          {boqRows.length === 0 ? <EmptyState message="No BOQ items found." /> : (
            <ul className="space-y-2.5">
              {boqRows.map(b => (
                <li key={b.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{b.boqNumber} &middot; {b.description}</span>
                    <span className="text-xs text-ink-500">{b.pct}%</span>
                  </div>
                  <ProgressBar pct={b.pct} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="DPR Status Breakdown">
          {dprStatusBreakdown.length === 0 ? <EmptyState message="No daily reports yet." /> : (
            <ul className="space-y-2">
              {dprStatusBreakdown.map(([status, count]) => (
                <li key={status} className="flex items-center justify-between rounded-md border border-ink-200 p-2.5">
                  <StatusBadge status={status} />
                  <span className="text-sm font-medium text-ink-700">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Subcontractor Progress">
          {woProgress.length === 0 ? <EmptyState message="No work orders found." /> : (
            <ul className="space-y-2.5">
              {woProgress.map(wo => (
                <li key={wo.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{wo.woNumber} &middot; {wo.subName}</span>
                    <span className="text-xs text-ink-500">{fmtCurrency(wo.executed)} / {fmtCurrency(wo.value)}</span>
                  </div>
                  <ProgressBar pct={wo.pct} tone={wo.pct >= 100 ? 'success' : 'brand'} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="My Pending Approvals">
          {myApprovals.length === 0 ? <EmptyState message="Nothing is waiting on your approval." /> : (
            <ul className="space-y-2">
              {myApprovals.slice(0, 8).map(t => (
                <li key={t.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{t.title}</span>
                    {t.amount !== undefined && <span className="text-xs font-medium text-ink-600">{fmtCurrency(t.amount)}</span>}
                  </div>
                  <p className="text-xs text-ink-500">Requested by {t.requesterName}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
