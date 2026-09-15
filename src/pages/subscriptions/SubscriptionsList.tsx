import { useMemo, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { fmtDate, fmtCurrency, daysUntil, cls } from '../../lib/utils'
import type { Subscription } from '../../types'

const FREQUENCIES: Subscription['frequency'][] = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']

export default function SubscriptionsList() {
  const subscriptions = useStore(s => s.subscriptions)
  const projects = useStore(s => s.projects)
  const createSubscription = useStore(s => s.createSubscription)
  const renewSubscription = useStore(s => s.renewSubscription)

  const [addOpen, setAddOpen] = useState(false)
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null)
  const [newEndDate, setNewEndDate] = useState('')

  const [form, setForm] = useState({ name: '', provider: '', type: '', startDate: '', endDate: '', renewalDate: '', cost: '', frequency: 'YEARLY' as Subscription['frequency'], projectId: '' })

  const columns: Column<Subscription>[] = useMemo(() => [
    { key: 'name', header: 'Name', render: s => <span className="font-medium text-ink-800">{s.name}</span>, sortValue: s => s.name },
    { key: 'provider', header: 'Provider', render: s => s.provider, hideBelow: 'md' },
    { key: 'type', header: 'Type', render: s => s.type, hideBelow: 'md' },
    { key: 'cost', header: 'Cost', render: s => fmtCurrency(s.cost), sortValue: s => s.cost },
    { key: 'frequency', header: 'Frequency', render: s => s.frequency, hideBelow: 'lg' },
    {
      key: 'renewalDate', header: 'Renewal Date', render: s => {
        const days = daysUntil(s.renewalDate)
        const tone = days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-ink-700'
        return <span className={cls('font-medium', tone)}>{fmtDate(s.renewalDate)}<span className="ml-1 text-xs font-normal">({days <= 0 ? 'overdue' : `${days}d`})</span></span>
      },
      sortValue: s => s.renewalDate,
    },
    { key: 'status', header: 'Status', render: s => <StatusBadge status={s.status} /> },
    {
      key: 'actions', header: 'Actions', render: s => (
        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          disabled={!(s.status === 'RENEWAL_DUE' || s.status === 'EXPIRED')}
          title={s.status === 'RENEWAL_DUE' || s.status === 'EXPIRED' ? undefined : 'Only subscriptions due for renewal can be renewed'}
          onClick={() => { setRenewTarget(s); setNewEndDate('') }}
        >
          Renew
        </Button>
      ),
    },
  ], [])

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Software licenses, AMCs and recurring insurance/service contracts."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Subscription</Button>}
      />

      <DataTable
        columns={columns}
        data={subscriptions}
        keyField={s => s.id}
        searchable
        searchPlaceholder="Search subscriptions..."
        searchFields={s => `${s.name} ${s.provider} ${s.type} ${s.status}`}
        emptyMessage="No subscriptions recorded yet."
      />

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Subscription"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!form.name.trim() || !form.provider.trim() || !form.renewalDate}
              onClick={() => {
                createSubscription({
                  name: form.name.trim(),
                  provider: form.provider.trim(),
                  type: form.type.trim() || 'General',
                  startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                  endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                  renewalDate: new Date(form.renewalDate).toISOString(),
                  cost: Number(form.cost) || 0,
                  frequency: form.frequency,
                  projectId: form.projectId || undefined,
                })
                setForm({ name: '', provider: '', type: '', startDate: '', endDate: '', renewalDate: '', cost: '', frequency: 'YEARLY', projectId: '' })
                setAddOpen(false)
              }}
            >
              Add Subscription
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Microsoft 365 License" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Provider</label>
            <input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Microsoft" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Type</label>
            <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. Software License" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Renewal Date</label>
            <input type="date" value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Cost (&#8377;)</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="0" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Subscription['frequency'] }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Project (optional)</label>
            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </Drawer>

      <Modal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        title={`Renew ${renewTarget?.name ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenewTarget(null)}>Cancel</Button>
            <Button variant="primary" disabled={!newEndDate} onClick={() => { if (renewTarget && newEndDate) { renewSubscription(renewTarget.id, new Date(newEndDate).toISOString()); setRenewTarget(null) } }}>
              Confirm Renewal
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">New End / Renewal Date</label>
        <input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </Modal>
    </div>
  )
}
