import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getBoqProgressPct, getStockBalance, deriveExceptions } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { recordLink } from '../../lib/recordLinks'
import { fmtDate, fmtCurrency } from '../../lib/utils'

export default function PEDashboard() {
  const navigate = useNavigate()
  const state = useStore(s => s)
  const {
    projects, sites, boqItems, drawings, materials, materialIndents, dispatches, purchaseOrders,
    grns, dailyReports, attendance, checklistInstances, delegations, measurements, siteIssues, currentUser,
  } = state
  const user = currentUser!
  const projectId = useStore(s => s.selectedProjectId)
  const siteId = useStore(s => s.selectedSiteId)

  const project = projects.find(p => p.id === projectId)
  const site = sites.find(s => s.id === siteId)

  const projectBoqItems = useMemo(() => boqItems.filter(b => b.projectId === projectId), [boqItems, projectId])
  const avgProgress = useMemo(() => {
    if (projectBoqItems.length === 0) return 0
    const total = projectBoqItems.reduce((sum, b) => sum + getBoqProgressPct(state, b.id), 0)
    return Math.round((total / projectBoqItems.length) * 10) / 10
  }, [projectBoqItems, state])

  const latestDrawings = useMemo(
    () => drawings.filter(d => d.projectId === projectId && d.status === 'APPROVED').sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5),
    [drawings, projectId]
  )

  const projectIndents = useMemo(() => materialIndents.filter(i => i.projectId === projectId), [materialIndents, projectId])
  const indentPending = projectIndents.filter(i => i.status === 'PM_REVIEW' || i.status === 'SUBMITTED').length
  const indentStatusBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of projectIndents) map.set(i.status, (map.get(i.status) ?? 0) + 1)
    return Array.from(map.entries())
  }, [projectIndents])

  const incomingDeliveries = useMemo(
    () => dispatches.filter(d => (d.status === 'IN_TRANSIT' || d.status === 'AT_SITE') && purchaseOrders.find(po => po.id === d.poId)?.projectId === projectId),
    [dispatches, purchaseOrders, projectId]
  )

  const projectGrns = useMemo(() => grns.filter(g => g.projectId === projectId), [grns, projectId])
  const grnPendingHodCheck = projectGrns.filter(g => g.status === 'HOD_CHECK').length
  const recentGrns = useMemo(() => [...projectGrns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [projectGrns])

  const lowStockMaterials = useMemo(
    () => materials.filter(m => getStockBalance(state, m.id, siteId) < m.reorderLevel),
    [materials, state, siteId]
  )

  const projectDprs = useMemo(() => dailyReports.filter(d => d.projectId === projectId), [dailyReports, projectId])
  const dprPendingReview = projectDprs.filter(d => ['SUBMITTED', 'PE_REVIEW', 'PM_REVIEW'].includes(d.status)).length
  const recentDprs = useMemo(() => [...projectDprs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [projectDprs])

  const siteAttendance = useMemo(() => attendance.filter(a => a.projectId === projectId && a.siteId === siteId), [attendance, projectId, siteId])
  const attendanceToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const todays = siteAttendance.filter(a => a.date.slice(0, 10) === todayStr)
    if (todays.length > 0) return { count: todays.filter(a => a.status === 'PRESENT').length, date: todayStr }
    const mostRecent = siteAttendance.reduce((latest, a) => (!latest || a.date > latest ? a.date : latest), '')
    return { count: siteAttendance.filter(a => a.date === mostRecent && a.status === 'PRESENT').length, date: mostRecent }
  }, [siteAttendance])

  const projectChecklists = useMemo(() => checklistInstances.filter(c => c.projectId === projectId), [checklistInstances, projectId])
  const checklistsPending = projectChecklists.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length
  const checklistsFailed = projectChecklists.filter(c => c.status === 'FAILED_PENDING_CORRECTION').length

  const myDelegations = useMemo(() => delegations.filter(d => d.assignedTo === user.id), [delegations, user.id])
  const overdueDelegations = myDelegations.filter(d => d.status !== 'COMPLETED' && d.status !== 'VERIFIED' && new Date(d.dueDate).getTime() < Date.now())

  const recentMeasurements = useMemo(
    () => [...measurements.filter(m => m.projectId === projectId)].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [measurements, projectId]
  )

  const openSiteIssues = useMemo(() => siteIssues.filter(i => i.projectId === projectId && (i.status === 'OPEN' || i.status === 'IN_PROGRESS')), [siteIssues, projectId])

  const peExceptions = useMemo(() => deriveExceptions(state).filter(e => e.owner === 'PE' && e.status !== 'RESOLVED').slice(0, 6), [state])

  return (
    <div>
      <PageHeader
        title="Project Engineer Dashboard"
        subtitle={`${project?.name ?? 'No project selected'} - ${site?.name ?? ''}`}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Site Progress" value={`${avgProgress}%`} sub={`${projectBoqItems.length} BOQ item(s)`} tone="brand" />
        <KpiCard label="Indents Pending" value={indentPending} sub={`${projectIndents.length} total`} tone={indentPending > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Incoming Deliveries" value={incomingDeliveries.length} sub="in transit / at site" />
        <KpiCard label="GRN Pending HOD Check" value={grnPendingHodCheck} tone={grnPendingHodCheck > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Low Stock Materials" value={lowStockMaterials.length} tone={lowStockMaterials.length > 0 ? 'danger' : 'success'} />
        <KpiCard label="DPR Pending Review" value={dprPendingReview} sub={`${projectDprs.length} total`} tone={dprPendingReview > 0 ? 'warning' : 'neutral'} />
        <KpiCard label="Attendance" value={attendanceToday.count} sub={attendanceToday.date ? fmtDate(attendanceToday.date) : 'no data'} />
        <KpiCard label="Checklists" value={checklistsPending} sub={`${checklistsFailed} failed / pending correction`} tone={checklistsFailed > 0 ? 'danger' : 'neutral'} />
        <KpiCard label="My Overdue Tasks" value={overdueDelegations.length} sub={`${myDelegations.length} assigned to me`} tone={overdueDelegations.length > 0 ? 'danger' : 'success'} />
        <KpiCard label="Open Site Issues" value={openSiteIssues.length} tone={openSiteIssues.length > 0 ? 'warning' : 'success'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Latest Approved Drawings">
          {latestDrawings.length === 0 ? <EmptyState message="No approved drawings yet." /> : (
            <ul className="space-y-2">
              {latestDrawings.map(d => (
                <li key={d.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50" onClick={() => { const l = recordLink('Drawing', d.id); if (l) navigate(l) }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{d.drawingNumber} - {d.name}</span>
                    <span className="text-xs text-ink-500">{d.revision}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{d.discipline} - {fmtDate(d.issueDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Daily Reports">
          {recentDprs.length === 0 ? <EmptyState message="No daily reports recorded yet." /> : (
            <ul className="space-y-2">
              {recentDprs.map(d => (
                <li key={d.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50" onClick={() => navigate(`/dpr/${d.id}`)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{d.dprNumber} - {d.activity}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{fmtDate(d.date)} - Today {d.todayQty} / Cumulative {d.cumulativeQty}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent GRNs">
          {recentGrns.length === 0 ? <EmptyState message="No GRNs recorded yet." /> : (
            <ul className="space-y-2">
              {recentGrns.map(g => (
                <li key={g.id} className="rounded-md border border-ink-200 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{g.grnNumber}</span>
                    <StatusBadge status={g.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{fmtDate(g.createdAt)} - {g.items.length} line item(s)</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Low Stock Materials">
          {lowStockMaterials.length === 0 ? <EmptyState message="All materials are above reorder level." /> : (
            <ul className="space-y-2">
              {lowStockMaterials.map(m => {
                const bal = getStockBalance(state, m.id, siteId)
                const pct = m.reorderLevel > 0 ? Math.min(100, Math.round((bal / m.reorderLevel) * 100)) : 0
                return (
                  <li key={m.id} className="rounded-md border border-ink-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-ink-800">{m.name}</span>
                      <span className="text-ink-500">{bal} / {m.reorderLevel} {m.unit}</span>
                    </div>
                    <div className="mt-1.5"><ProgressBar pct={pct} tone="danger" /></div>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Measurements">
          {recentMeasurements.length === 0 ? <EmptyState message="No measurements recorded yet." /> : (
            <ul className="space-y-2">
              {recentMeasurements.map(m => (
                <li key={m.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 hover:bg-ink-50" onClick={() => { const l = recordLink('Measurement', m.id); if (l) navigate(l) }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink-800">{m.measurementNumber}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{fmtDate(m.date)} - Qty {m.currentQty} - {fmtCurrency(m.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Attention Needed (PE)">
          {peExceptions.length === 0 ? <EmptyState message="No open exceptions assigned to PE." /> : (
            <ul className="space-y-2">
              {peExceptions.map(e => {
                const link = e.recordType && e.recordId ? recordLink(e.recordType, e.recordId) : null
                return (
                  <li key={e.id} className={`rounded-md border px-3 py-2 ${link ? 'cursor-pointer hover:bg-ink-50' : ''} border-ink-200`} onClick={() => link && navigate(link)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink-800">{e.type.replace(/_/g, ' ')}</span>
                      <StatusBadge status={e.severity} />
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">{e.description}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {indentStatusBreakdown.length > 0 && (
        <SectionCard title="Material Indent Status Breakdown" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {indentStatusBreakdown.map(([status, count]) => (
              <span key={status} className="inline-flex items-center gap-1.5 rounded-md bg-ink-50 px-2.5 py-1 text-xs text-ink-600 ring-1 ring-inset ring-ink-200">
                <StatusBadge status={status} /> {count}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
