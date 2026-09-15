import { useMemo } from 'react'
import { FileCheck2, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { APPROVAL_GATES } from '../../lib/permissions'
import { fmtDate } from '../../lib/utils'
import type { AppDocument } from '../../types'

export default function DocumentApproval() {
  const user = useStore(s => s.currentUser!)
  const documents = useStore(s => s.documents)
  const projects = useStore(s => s.projects)
  const vendors = useStore(s => s.vendors)
  const subcontractors = useStore(s => s.subcontractors)
  const approveDocument = useStore(s => s.approveDocument)

  const canApprove = APPROVAL_GATES.documentApproval.includes(user.role)
  const pending = documents.filter(d => d.status === 'PENDING_APPROVAL')

  function linkedEntity(doc: AppDocument): string {
    if (doc.projectId) return projects.find(p => p.id === doc.projectId)?.name ?? doc.projectId
    if (doc.vendorId) return vendors.find(v => v.id === doc.vendorId)?.name ?? doc.vendorId
    if (doc.subcontractorId) return subcontractors.find(sc => sc.id === doc.subcontractorId)?.name ?? doc.subcontractorId
    return 'Organization'
  }

  const columns: Column<AppDocument>[] = useMemo(() => [
    { key: 'docNumber', header: 'Doc #', render: d => <span className="font-medium text-ink-800">{d.docNumber}</span> },
    { key: 'name', header: 'Name', render: d => d.name },
    { key: 'type', header: 'Type', render: d => d.type, hideBelow: 'md' },
    { key: 'linked', header: 'Linked To', render: d => linkedEntity(d), hideBelow: 'md' },
    { key: 'issueDate', header: 'Issued', render: d => fmtDate(d.issueDate), hideBelow: 'lg' },
    { key: 'expiryDate', header: 'Expiry', render: d => fmtDate(d.expiryDate), hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: d => <StatusBadge status={d.status} /> },
    {
      key: 'actions', header: 'Actions', render: d => (
        <Button
          size="sm"
          variant="success"
          icon={<Check className="h-3.5 w-3.5" />}
          disabled={!canApprove}
          title={canApprove ? undefined : 'Only PM, MD or Accounts can approve documents'}
          onClick={() => approveDocument(d.id)}
        >
          Approve
        </Button>
      ),
    },
  ], [projects, vendors, subcontractors, canApprove])

  return (
    <div>
      <PageHeader title="Document Approval" subtitle="Documents awaiting sign-off before they become active compliance records." />
      <DataTable
        columns={columns}
        data={pending}
        keyField={d => d.id}
        searchable
        searchFields={d => `${d.docNumber} ${d.name} ${d.type}`}
        emptyIcon={<FileCheck2 className="h-8 w-8" />}
        emptyMessage="No documents are pending approval."
      />
    </div>
  )
}
