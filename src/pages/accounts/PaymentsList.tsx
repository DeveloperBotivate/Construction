import { useNavigate } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { Payment } from '../../types'

export default function PaymentsList() {
  const navigate = useNavigate()
  const payments = useStore(s => s.payments)

  const columns: Column<Payment>[] = [
    { key: 'paymentNumber', header: 'Payment #', render: r => <span className="font-medium text-ink-800">{r.paymentNumber}</span>, sortValue: r => r.paymentNumber },
    { key: 'type', header: 'Type', render: r => <StatusBadge status={r.type} /> },
    { key: 'payeeName', header: 'Payee', render: r => r.payeeName, sortValue: r => r.payeeName },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'paymentDate', header: 'Payment Date', render: r => fmtDate(r.paymentDate), sortValue: r => r.paymentDate ?? '', hideBelow: 'sm' },
  ]

  return (
    <div>
      <PageHeader title="Payments" subtitle="Payment queue populated from verified vendor and subcontractor bills." />
      <DataTable
        columns={columns}
        data={payments}
        keyField={r => r.id}
        onRowClick={r => navigate(`/payments/${r.id}`)}
        searchable
        searchPlaceholder="Search payments..."
        searchFields={r => `${r.paymentNumber} ${r.payeeName}`}
        emptyMessage="No payments in the queue yet."
        emptyIcon={<Banknote className="h-8 w-8" />}
      />
    </div>
  )
}
