import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Card, SectionCard } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/utils'

export default function SiteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const site = useStore(s => s.sites.find(x => x.id === id))
  const state = useStore()
  if (!site) return <EmptyState message="Site not found." />

  const project = state.projects.find(p => p.id === site.projectId)
  const pe = state.users.find(u => u.id === site.peId)
  const storeKeeper = state.users.find(u => u.id === site.storeKeeperId)
  const dprs = state.dailyReports.filter(d => d.siteId === site.id)
  const indents = state.materialIndents.filter(i => i.siteId === site.id)
  const grns = state.grns.filter(g => g.siteId === site.id)

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Sites', to: '/sites' }, { label: site.code }]}
        title={site.name}
        subtitle={project ? `${project.code} - ${project.name}` : ''}
        actions={<StatusBadge status={site.status} />}
      />
      <Tabs tabs={[
        {
          key: 'overview', label: 'Overview', content: (
            <Card>
              <dl className="grid grid-cols-2 gap-y-3 text-sm md:grid-cols-3">
                <dt className="text-ink-500">Address</dt><dd className="text-ink-800">{site.address}</dd>
                <dt className="text-ink-500">Geo Location</dt><dd className="text-ink-800">{site.geoLocation || '-'}</dd>
                <dt className="text-ink-500">Project Engineer</dt><dd className="text-ink-800">{pe?.name ?? '-'}</dd>
                <dt className="text-ink-500">Store Keeper</dt><dd className="text-ink-800">{storeKeeper?.name ?? '-'}</dd>
              </dl>
            </Card>
          ),
        },
        {
          key: 'related', label: 'Related Records', content: (
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard title={`Daily Reports (${dprs.length})`}>
                {dprs.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{dprs.slice(0, 8).map(d => (
                  <li key={d.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/dpr/${d.id}`)}>
                    <span className="font-medium">{d.dprNumber}</span> <span className="text-ink-400">{fmtDate(d.date)}</span> <StatusBadge status={d.status} />
                  </li>
                ))}</ul>}
              </SectionCard>
              <SectionCard title={`Material Indents (${indents.length})`}>
                {indents.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{indents.slice(0, 8).map(i => (
                  <li key={i.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/indents/${i.id}`)}>
                    <span className="font-medium">{i.indentNumber}</span> <StatusBadge status={i.status} />
                  </li>
                ))}</ul>}
              </SectionCard>
              <SectionCard title={`GRNs (${grns.length})`}>
                {grns.length === 0 ? <EmptyState message="None yet." /> : <ul className="space-y-2">{grns.slice(0, 8).map(g => (
                  <li key={g.id} className="cursor-pointer rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/grn/${g.id}`)}>
                    <span className="font-medium">{g.grnNumber}</span> <StatusBadge status={g.status} />
                  </li>
                ))}</ul>}
              </SectionCard>
            </div>
          ),
        },
        { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Site" recordId={site.id} /> },
        { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Site" recordId={site.id} /> },
      ]} />
    </div>
  )
}
