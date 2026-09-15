import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, ListChecks, FileText } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getBoqProgressPct } from '../../store/selectors'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Card, KpiCard, SectionCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = useStore(s => s.projects.find(p => p.id === id))
  const state = useStore()
  if (!project) return <EmptyState message="Project not found." />

  const sites = state.sites.filter(s => s.projectId === project.id)
  const boqItems = state.boqItems.filter(b => b.projectId === project.id)
  const drawings = state.drawings.filter(d => d.projectId === project.id)
  const indents = state.materialIndents.filter(i => i.projectId === project.id)
  const pm = state.users.find(u => u.id === project.pmId)
  const avgProgress = boqItems.length ? Math.round(boqItems.reduce((sum, b) => sum + getBoqProgressPct(state, b.id), 0) / boqItems.length) : 0

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Projects', to: '/projects' }, { label: project.code }]}
        title={project.name}
        subtitle={`${project.client} · ${project.location}`}
        actions={<StatusBadge status={project.status} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Contract Value" value={fmtCurrency(project.contractValue)} />
        <KpiCard label="Budget" value={fmtCurrency(project.budget)} />
        <KpiCard label="Actual Cost" value={fmtCurrency(project.actualCost)} tone={project.actualCost > project.budget ? 'danger' : 'neutral'} />
        <KpiCard label="BOQ Progress" value={`${avgProgress}%`} tone="brand" />
        <KpiCard label="Project Manager" value={pm?.name ?? '-'} />
      </div>

      <Tabs tabs={[
        {
          key: 'overview', label: 'Overview', content: (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Project Details</h3>
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  <dt className="text-ink-500">Code</dt><dd className="text-ink-800">{project.code}</dd>
                  <dt className="text-ink-500">Client</dt><dd className="text-ink-800">{project.client}</dd>
                  <dt className="text-ink-500">Location</dt><dd className="text-ink-800">{project.location}</dd>
                  <dt className="text-ink-500">Start Date</dt><dd className="text-ink-800">{fmtDate(project.startDate)}</dd>
                  <dt className="text-ink-500">End Date</dt><dd className="text-ink-800">{fmtDate(project.endDate)}</dd>
                  <dt className="text-ink-500">Status</dt><dd><StatusBadge status={project.status} /></dd>
                </dl>
                <p className="mt-4 text-sm text-ink-600">{project.description}</p>
                <div className="mt-4">
                  <p className="mb-1 text-xs font-medium text-ink-500">Overall Progress</p>
                  <ProgressBar pct={project.progressPct} />
                </div>
              </Card>
              <SectionCard title="Quick Links">
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" size="sm" icon={<MapPin className="h-3.5 w-3.5" />} onClick={() => navigate('/sites')}>View Sites ({sites.length})</Button>
                  <Button variant="secondary" size="sm" icon={<ListChecks className="h-3.5 w-3.5" />} onClick={() => navigate('/boq')}>View BOQ ({boqItems.length})</Button>
                  <Button variant="secondary" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={() => navigate('/drawings')}>View Drawings ({drawings.length})</Button>
                </div>
              </SectionCard>
            </div>
          ),
        },
        {
          key: 'related', label: 'Related Records', content: (
            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard title={`Sites (${sites.length})`}>
                {sites.length === 0 ? <EmptyState message="No sites yet." /> : (
                  <ul className="space-y-2">{sites.map(s => (
                    <li key={s.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/sites/${s.id}`)}>
                      <span className="font-medium text-ink-800">{s.name}</span> <span className="text-ink-400">({s.code})</span>
                    </li>
                  ))}</ul>
                )}
              </SectionCard>
              <SectionCard title={`Open Material Indents (${indents.filter(i => !['CLOSED', 'REJECTED'].includes(i.status)).length})`}>
                {indents.length === 0 ? <EmptyState message="No indents yet." /> : (
                  <ul className="space-y-2">{indents.map(i => (
                    <li key={i.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/indents/${i.id}`)}>
                      <span className="font-medium text-ink-800">{i.indentNumber}</span> <StatusBadge status={i.status} />
                    </li>
                  ))}</ul>
                )}
              </SectionCard>
            </div>
          ),
        },
        { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Project" recordId={project.id} /> },
        { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Project" recordId={project.id} /> },
      ]} />
    </div>
  )
}
