import { Landmark } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import type { Client } from '../../types'

export default function ClientsList() {
  const clients = useStore(s => s.clients)

  const columns: Column<Client>[] = [
    { key: 'name', header: 'Client Name', render: r => <span className="font-medium text-ink-800">{r.name}</span>, sortValue: r => r.name },
    { key: 'contactPerson', header: 'Contact Person', render: r => r.contactPerson },
    { key: 'phone', header: 'Phone', render: r => r.phone, hideBelow: 'sm' },
    { key: 'email', header: 'Email', render: r => r.email, hideBelow: 'md' },
    { key: 'address', header: 'Address', render: r => r.address, hideBelow: 'lg' },
  ]

  return (
    <div>
      <PageHeader title="Clients" subtitle="Master list of clients contracted for project delivery." />
      <DataTable
        columns={columns}
        data={clients}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search clients..."
        searchFields={r => `${r.name} ${r.contactPerson} ${r.email}`}
        emptyMessage="No clients recorded yet."
        emptyIcon={<Landmark className="h-8 w-8" />}
      />
    </div>
  )
}
