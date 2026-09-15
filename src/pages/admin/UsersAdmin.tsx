import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SectionCard, Card } from '../../components/ui/Card'
import { ALL_MODULES, ROLE_MODULES, canAccessModule, roleLabel, APPROVAL_GATES, poApprovalRoute } from '../../lib/permissions'
import { NAV_SECTIONS } from '../../lib/nav'
import { fmtCurrency } from '../../lib/utils'
import type { Role, User } from '../../types'

const ROLES = Object.keys(ROLE_MODULES) as Role[]
const MODULE_LABELS: Record<string, string> = Object.fromEntries(NAV_SECTIONS.flatMap(sec => sec.items.map(i => [i.key, i.label])))

export default function UsersAdmin() {
  const users = useStore(s => s.users)
  const materials = useStore(s => s.materials)
  const vendors = useStore(s => s.vendors)
  const subcontractors = useStore(s => s.subcontractors)
  const clients = useStore(s => s.clients)

  const userColumns: Column<User>[] = useMemo(() => [
    { key: 'employeeId', header: 'Employee ID', render: u => <span className="font-medium text-ink-800">{u.employeeId}</span> },
    { key: 'name', header: 'Name', render: u => u.name },
    { key: 'email', header: 'Email', render: u => u.email, hideBelow: 'md' },
    { key: 'role', header: 'Role', render: u => roleLabel(u.role) },
    { key: 'designation', header: 'Designation', render: u => u.designation, hideBelow: 'lg' },
    { key: 'reportsTo', header: 'Reports To', render: u => users.find(m => m.id === u.reportsTo)?.name ?? <span className="text-ink-400">&mdash;</span>, hideBelow: 'lg' },
    { key: 'active', header: 'Status', render: u => <StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} /> },
  ], [users])

  const tabs: TabItem[] = [
    {
      key: 'users', label: 'Users',
      content: (
        <DataTable
          columns={userColumns}
          data={users}
          keyField={u => u.id}
          searchable
          searchPlaceholder="Search users..."
          searchFields={u => `${u.employeeId} ${u.name} ${u.email} ${u.role} ${u.designation}`}
        />
      ),
    },
    {
      key: 'roles', label: 'Roles & Permissions',
      content: (
        <SectionCard title="Module Access Matrix" className="overflow-hidden">
          <p className="mb-3 text-xs text-ink-500">Read-only view of the role-based access control configuration in <code className="rounded bg-ink-100 px-1 py-0.5">src/lib/permissions.ts</code>.</p>
          <div className="table-scroll overflow-x-auto rounded-lg border border-ink-200">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50">
                <tr>
                  <th className="sticky left-0 bg-ink-50 px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Module</th>
                  {ROLES.map(r => <th key={r} className="whitespace-nowrap px-3 py-2 text-center text-xs font-semibold uppercase text-ink-500">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {ALL_MODULES.map(mod => (
                  <tr key={mod}>
                    <td className="sticky left-0 bg-white px-3 py-2 font-medium text-ink-700">{MODULE_LABELS[mod] ?? mod}</td>
                    {ROLES.map(r => (
                      <td key={r} className="px-3 py-2 text-center">
                        {canAccessModule(r, mod) ? <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" /> : <Minus className="mx-auto h-3.5 w-3.5 text-ink-200" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ),
    },
    {
      key: 'masters', label: 'Masters',
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Materials</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{materials.length}</p>
            <p className="mt-1 text-xs text-ink-400">No dedicated master page yet.</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Vendors</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{vendors.length}</p>
            <p className="mt-1 text-xs text-ink-400">No dedicated master page yet.</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Subcontractors</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{subcontractors.length}</p>
            <Link to="/subcontractors" className="mt-1 inline-block text-xs font-medium text-brand-600 hover:underline">View list &rarr;</Link>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Clients</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{clients.length}</p>
            <Link to="/clients" className="mt-1 inline-block text-xs font-medium text-brand-600 hover:underline">View list &rarr;</Link>
          </Card>
        </div>
      ),
    },
    {
      key: 'notifications', label: 'Notifications Settings',
      content: (
        <SectionCard title="Notification Routing">
          <p className="mb-3 text-sm text-ink-600">Notifications are generated automatically by workflow actions and routed either to a specific user or broadcast to a role. This prototype does not expose editable notification preferences &mdash; routing is fixed by the workflow logic below:</p>
          <ul className="space-y-2 text-sm text-ink-600">
            <li className="rounded-md border border-ink-200 p-2.5"><span className="font-medium text-ink-800">Role broadcast</span> &mdash; e.g. a new PO pending approval notifies every user with that approver role.</li>
            <li className="rounded-md border border-ink-200 p-2.5"><span className="font-medium text-ink-800">Direct to user</span> &mdash; e.g. a rejected indent notifies the original requester.</li>
            <li className="rounded-md border border-ink-200 p-2.5"><span className="font-medium text-ink-800">Severity levels</span> &mdash; INFO, WARNING and CRITICAL, shown in the bell icon in the top bar.</li>
          </ul>
        </SectionCard>
      ),
    },
    {
      key: 'workflow', label: 'Workflow Configuration',
      content: (
        <div className="space-y-5">
          <SectionCard title="Purchase Order Approval Routing">
            <p className="mb-3 text-sm text-ink-600">Configured in <code className="rounded bg-ink-100 px-1 py-0.5">poApprovalRoute()</code> &mdash; the approval route is determined automatically by PO value.</p>
            <div className="overflow-x-auto rounded-lg border border-ink-200">
              <table className="min-w-full divide-y divide-ink-200 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">PO Value Range</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Approval Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  <tr><td className="px-3 py-2">Below {fmtCurrency(100000)}</td><td className="px-3 py-2">{poApprovalRoute(50000)} only</td></tr>
                  <tr><td className="px-3 py-2">{fmtCurrency(100000)} &ndash; {fmtCurrency(500000)}</td><td className="px-3 py-2">{poApprovalRoute(300000).replace('_', ' + ')}</td></tr>
                  <tr><td className="px-3 py-2">Above {fmtCurrency(500000)}</td><td className="px-3 py-2">{poApprovalRoute(600000).replace('_', ' + ')}</td></tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Approval Gates by Workflow">
            <p className="mb-3 text-sm text-ink-600">Configured in <code className="rounded bg-ink-100 px-1 py-0.5">APPROVAL_GATES</code> &mdash; roles authorized to act at each workflow gate (self-approval is always blocked separately).</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(APPROVAL_GATES).map(([gate, roles]) => (
                <div key={gate} className="rounded-md border border-ink-200 p-2.5">
                  <p className="text-sm font-medium text-ink-800">{gate}</p>
                  <p className="text-xs text-ink-500">{(roles as Role[]).map(roleLabel).join(', ')}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Users &amp; Settings" subtitle="User directory, role-based access control and workflow configuration (read-only in this prototype)." />
      <Tabs tabs={tabs} />
    </div>
  )
}
