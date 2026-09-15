import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Card, SectionCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/utils'

export default function DrawingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const state = useStore()
  const drawing = state.drawings.find(d => d.id === id)
  const approveDrawing = useStore(s => s.approveDrawing)
  const user = useStore(s => s.currentUser!)
  if (!drawing) return <EmptyState message="Drawing not found." />

  const project = state.projects.find(p => p.id === drawing.projectId)
  const uploadedBy = state.users.find(u => u.id === drawing.uploadedBy)
  const approvedBy = drawing.approvedBy ? state.users.find(u => u.id === drawing.approvedBy) : undefined
  const revisionHistory = state.drawings.filter(d => d.name === drawing.name && d.projectId === drawing.projectId)
  const canApprove = user.role === 'PM' || user.role === 'MD'

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Drawings', to: '/drawings' }, { label: drawing.drawingNumber }]}
        title={drawing.name}
        subtitle={`${project?.code ?? ''} · ${drawing.discipline} · ${drawing.revision}`}
        actions={<>
          <StatusBadge status={drawing.status} />
          {canApprove && (drawing.status === 'DRAFT' || drawing.status === 'UNDER_REVIEW') && <Button variant="success" onClick={() => approveDrawing(drawing.id)}>Approve</Button>}
        </>}
      />
      <Tabs tabs={[
        {
          key: 'overview', label: 'Overview', content: (
            <Card>
              <dl className="grid grid-cols-2 gap-y-3 text-sm md:grid-cols-3">
                <dt className="text-ink-500">Issue Date</dt><dd className="text-ink-800">{fmtDate(drawing.issueDate)}</dd>
                <dt className="text-ink-500">Uploaded By</dt><dd className="text-ink-800">{uploadedBy?.name ?? '-'}</dd>
                <dt className="text-ink-500">Approved By</dt><dd className="text-ink-800">{approvedBy?.name ?? '-'}</dd>
              </dl>
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-ink-200 text-sm text-ink-400">Drawing preview placeholder ({drawing.drawingNumber}.pdf)</div>
            </Card>
          ),
        },
        {
          key: 'related', label: 'Related Records', content: (
            <SectionCard title="Revision History">
              <ul className="space-y-2">
                {revisionHistory.map(d => (
                  <li key={d.id} className="flex cursor-pointer items-center justify-between rounded-md border border-ink-200 px-3 py-2 text-sm hover:bg-ink-50" onClick={() => navigate(`/drawings/${d.id}`)}>
                    <span><span className="font-medium">{d.revision}</span> · {d.drawingNumber} · {fmtDate(d.issueDate)}</span>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          ),
        },
        { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Drawing" recordId={drawing.id} /> },
        { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Drawing" recordId={drawing.id} /> },
      ]} />
    </div>
  )
}
