import { useMemo, useState } from 'react'
import { Plus, RefreshCw, FolderKanban } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { fmtDate, daysUntil, cls } from '../../lib/utils'
import type { AppDocument } from '../../types'

const DOC_TYPES = ['Certificate', 'Insurance', 'Contract', 'Vendor Compliance', 'Legal Contract', 'Drawing', 'License', 'AMC', 'General']

function ExpiryCell({ expiryDate }: { expiryDate?: string }) {
  if (!expiryDate) return <span className="text-ink-400">&mdash;</span>
  const days = daysUntil(expiryDate)
  const tone = days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-ink-700'
  return (
    <span className={cls('font-medium', tone)}>
      {fmtDate(expiryDate)}
      {days <= 30 && <span className="ml-1 text-xs font-normal">({days <= 0 ? 'expired' : `${days}d left`})</span>}
    </span>
  )
}

export default function DocumentsList() {
  const documents = useStore(s => s.documents)
  const projects = useStore(s => s.projects)
  const vendors = useStore(s => s.vendors)
  const subcontractors = useStore(s => s.subcontractors)
  const createDocument = useStore(s => s.createDocument)
  const renewDocument = useStore(s => s.renewDocument)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [renewTarget, setRenewTarget] = useState<AppDocument | null>(null)
  const [newExpiry, setNewExpiry] = useState('')

  const [form, setForm] = useState({ name: '', type: 'General', projectId: '', vendorId: '', subcontractorId: '', expiryDate: '' })

  function linkedEntity(doc: AppDocument): string {
    if (doc.projectId) return projects.find(p => p.id === doc.projectId)?.name ?? doc.projectId
    if (doc.vendorId) return vendors.find(v => v.id === doc.vendorId)?.name ?? doc.vendorId
    if (doc.subcontractorId) return subcontractors.find(sc => sc.id === doc.subcontractorId)?.name ?? doc.subcontractorId
    return 'Organization'
  }

  const columns: Column<AppDocument>[] = useMemo(() => [
    { key: 'docNumber', header: 'Doc #', render: d => <span className="font-medium text-ink-800">{d.docNumber}</span>, sortValue: d => d.docNumber },
    { key: 'name', header: 'Name', render: d => d.name, sortValue: d => d.name },
    { key: 'type', header: 'Type', render: d => d.type, hideBelow: 'md' },
    { key: 'linked', header: 'Linked To', render: d => linkedEntity(d), hideBelow: 'md' },
    { key: 'version', header: 'Ver', render: d => `v${d.version}`, hideBelow: 'lg' },
    { key: 'issueDate', header: 'Issued', render: d => fmtDate(d.issueDate), hideBelow: 'lg' },
    { key: 'expiryDate', header: 'Expiry', render: d => <ExpiryCell expiryDate={d.expiryDate} />, sortValue: d => d.expiryDate ?? '9999' },
    { key: 'status', header: 'Status', render: d => <StatusBadge status={d.status} /> },
    {
      key: 'actions', header: 'Actions', render: d => (
        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          disabled={!(d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED')}
          title={d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED' ? undefined : 'Only expiring/expired documents can be renewed'}
          onClick={() => { setRenewTarget(d); setNewExpiry('') }}
        >
          Renew
        </Button>
      ),
    },
  ], [projects, vendors, subcontractors])

  return (
    <div>
      <PageHeader
        title="Document Management"
        subtitle="Certificates, contracts, insurance policies and compliance documents across the organization."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>Upload Document</Button>}
      />

      <DataTable
        columns={columns}
        data={documents}
        keyField={d => d.id}
        searchable
        searchPlaceholder="Search documents..."
        searchFields={d => `${d.docNumber} ${d.name} ${d.type} ${linkedEntity(d)} ${d.status}`}
        emptyIcon={<FolderKanban className="h-8 w-8" />}
        emptyMessage="No documents uploaded yet."
      />

      <Drawer
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        subtitle="Add a certificate, contract or compliance document to the register."
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!form.name.trim()}
              onClick={() => {
                createDocument({
                  name: form.name.trim(),
                  type: form.type,
                  projectId: form.projectId || undefined,
                  vendorId: form.vendorId || undefined,
                  subcontractorId: form.subcontractorId || undefined,
                  expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
                })
                setForm({ name: '', type: 'General', projectId: '', vendorId: '', subcontractorId: '', expiryDate: '' })
                setUploadOpen(false)
              }}
            >
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Document Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Fire NOC Certificate" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Linked Project (optional)</label>
            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Linked Vendor (optional)</label>
            <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">None</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Linked Subcontractor (optional)</label>
            <select value={form.subcontractorId} onChange={e => setForm(f => ({ ...f, subcontractorId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">None</option>
              {subcontractors.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Expiry Date (optional)</label>
            <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      </Drawer>

      <Modal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        title={`Renew ${renewTarget?.docNumber ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!newExpiry}
              onClick={() => { if (renewTarget && newExpiry) { renewDocument(renewTarget.id, new Date(newExpiry).toISOString()); setRenewTarget(null) } }}
            >
              Confirm Renewal
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-600">Renewing <span className="font-medium text-ink-800">{renewTarget?.name}</span> will bump the version to v{(renewTarget?.version ?? 1) + 1} and set status back to Approved.</p>
        <label className="mb-1.5 block text-xs font-medium text-ink-600">New Expiry Date</label>
        <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </Modal>
    </div>
  )
}
