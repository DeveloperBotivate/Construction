import { ScrollText } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { Contract } from '../../types'

export default function ContractsList() {
  const contracts = useStore(s => s.contracts)
  const clients = useStore(s => s.clients)
  const projects = useStore(s => s.projects)

  function clientName(id: string) { return clients.find(c => c.id === id)?.name ?? '-' }
  function projectName(id: string) { return projects.find(p => p.id === id)?.name ?? '-' }

  const columns: Column<Contract>[] = [
    { key: 'contractNumber', header: 'Contract #', render: r => <span className="font-medium text-ink-800">{r.contractNumber}</span>, sortValue: r => r.contractNumber },
    { key: 'client', header: 'Client', render: r => clientName(r.clientId), sortValue: r => clientName(r.clientId) },
    { key: 'project', header: 'Project', render: r => projectName(r.projectId), hideBelow: 'sm' },
    { key: 'value', header: 'Contract Value', render: r => fmtCurrency(r.value), sortValue: r => r.value },
    { key: 'retentionPct', header: 'Retention %', render: r => `${r.retentionPct}%`, hideBelow: 'sm' },
    { key: 'startDate', header: 'Start Date', render: r => fmtDate(r.startDate), sortValue: r => r.startDate, hideBelow: 'md' },
  ]

  return (
    <div>
      <PageHeader title="Contracts" subtitle="Client contracts linked to projects and billing terms." />
      <DataTable
        columns={columns}
        data={contracts}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search contracts..."
        searchFields={r => `${r.contractNumber} ${clientName(r.clientId)} ${projectName(r.projectId)}`}
        emptyMessage="No contracts recorded yet."
        emptyIcon={<ScrollText className="h-8 w-8" />}
      />
    </div>
  )
}
