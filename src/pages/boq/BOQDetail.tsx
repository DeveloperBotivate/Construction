import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getBoqConsumed, getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Card, KpiCard, SectionCard } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtNumber } from '../../lib/utils'

export default function BOQDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const boq = state.boqItems.find(b => b.id === id)
  if (!boq || !id) return <EmptyState message="BOQ item not found." />

  const project = state.projects.find(p => p.id === boq.projectId)
  const consumed = getBoqConsumed(state, boq.id)
  const pct = getBoqProgressPct(state, boq.id)
  const indents = state.materialIndents.filter(i => i.boqItemId === boq.id)
  const measurements = state.measurements.filter(m => m.boqItemId === boq.id)
  const storeIssues = state.storeIssues.filter(i => i.boqItemId === boq.id)

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'BOQ', to: '/boq' }, { label: boq.boqNumber }]} title={boq.description} subtitle={`${project?.code ?? ''} · ${boq.section} · ${boq.itemCode}`} actions={<StatusBadge status={boq.status} />} />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Contract Qty" value={`${fmtNumber(boq.contractQty)} ${boq.unit}`} />
        <KpiCard label="Rate" value={fmtCurrency(boq.rate)} />
        <KpiCard label="Contract Amount" value={fmtCurrency(boq.contractAmount)} />
        <KpiCard label="Consumed" value={`${fmtNumber(consumed)} ${boq.unit}`} tone="brand" sub={`${pct}% complete`} />
      </div>

      <Tabs tabs={[
        {
          key: 'overview', label: 'Overview', content: (
            <Card>
              <p className="mb-2 text-xs font-medium text-ink-500">Progress</p>
              <ProgressBar pct={pct} />
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm md:grid-cols-3">
                <dt className="text-ink-500">Revised Qty</dt><dd className="text-ink-800">{fmtNumber(boq.revisedQty)} {boq.unit}</dd>
                <dt className="text-ink-500">Balance Qty</dt><dd className="text-ink-800">{fmtNumber(Math.max(0, boq.revisedQty - consumed))} {boq.unit}</dd>
                <dt className="text-ink-500">Status</dt><dd><StatusBadge status={boq.status} /></dd>
              </dl>
            </Card>
          ),
        },
        {
          key: 'related', label: 'Related Records', content: (
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard title={`Material Indents (${indents.length})`}>
                {indents.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{indents.map(i => (
                  <li key={i.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/indents/${i.id}`)}><span className="font-medium">{i.indentNumber}</span> <StatusBadge status={i.status} /></li>
                ))}</ul>}
              </SectionCard>
              <SectionCard title={`Measurements (${measurements.length})`}>
                {measurements.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{measurements.map(m => (
                  <li key={m.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/measurements/${m.id}`)}><span className="font-medium">{m.measurementNumber}</span> <StatusBadge status={m.status} /></li>
                ))}</ul>}
              </SectionCard>
              <SectionCard title={`Store Issues (${storeIssues.length})`}>
                {storeIssues.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{storeIssues.map(si => (
                  <li key={si.id} className="rounded-md border border-ink-200 px-3 py-2 text-sm"><span className="font-medium">{si.issueNumber}</span> - {fmtNumber(si.qty)} <StatusBadge status={si.status} /></li>
                ))}</ul>}
              </SectionCard>
            </div>
          ),
        },
        { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="BOQItem" recordId={boq.id} /> },
        { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="BOQItem" recordId={boq.id} /> },
      ]} />
    </div>
  )
}
