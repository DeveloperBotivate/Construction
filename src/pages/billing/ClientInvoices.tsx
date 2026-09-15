import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency } from '../../lib/utils'
import type { RABill } from '../../types'

export default function ClientInvoices() {
  const navigate = useNavigate()
  const allRaBills = useStore(s => s.raBills)
  const raBills = allRaBills.filter(b => !!b.invoiceNumber)
  const projects = useStore(s => s.projects)

  function projectName(id: string) { return projects.find(p => p.id === id)?.name ?? '-' }

  const columns: Column<RABill>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', render: r => <span className="font-medium text-ink-800">{r.invoiceNumber}</span>, sortValue: r => r.invoiceNumber ?? '' },
    { key: 'raNumber', header: 'RA Bill', render: r => r.raNumber, hideBelow: 'sm' },
    { key: 'project', header: 'Project', render: r => projectName(r.projectId) },
    { key: 'netAmount', header: 'Net Amount', render: r => fmtCurrency(r.netAmount), sortValue: r => r.netAmount },
    { key: 'receivedAmount', header: 'Received', render: r => fmtCurrency(r.receivedAmount), sortValue: r => r.receivedAmount },
    { key: 'outstanding', header: 'Outstanding', render: r => fmtCurrency(r.netAmount - r.receivedAmount), sortValue: r => r.netAmount - r.receivedAmount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Client Invoices" subtitle="Invoices generated once an RA bill has been certified and invoiced." />
      <DataTable
        columns={columns}
        data={raBills}
        keyField={r => r.id}
        onRowClick={r => navigate(`/ra-bills/${r.id}`)}
        searchable
        searchPlaceholder="Search invoices..."
        searchFields={r => `${r.invoiceNumber ?? ''} ${r.raNumber} ${projectName(r.projectId)}`}
        emptyMessage="No client invoices raised yet."
        emptyIcon={<Receipt className="h-8 w-8" />}
      />
    </div>
  )
}
