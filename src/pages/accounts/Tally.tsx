import { PieChart } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { Payment } from '../../types'

export default function Tally() {
  const allPayments = useStore(s => s.payments)
  const payments = allPayments.filter(p => p.status === 'TALLY_POSTED' || p.status === 'CLOSED')

  const columns: Column<Payment>[] = [
    { key: 'voucher', header: 'Voucher #', render: r => <span className="font-medium text-ink-800">{r.tallyVoucherNumber ?? '-'}</span>, sortValue: r => r.tallyVoucherNumber ?? '' },
    { key: 'paymentNumber', header: 'Payment #', render: r => r.paymentNumber },
    { key: 'payeeName', header: 'Payee', render: r => r.payeeName },
    { key: 'type', header: 'Type', render: r => <StatusBadge status={r.type} /> },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'paymentDate', header: 'Payment Date', render: r => fmtDate(r.paymentDate), sortValue: r => r.paymentDate ?? '' },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Tally" subtitle="Accounting ledger view of all payments posted as Tally vouchers." />
      <DataTable
        columns={columns}
        data={payments}
        keyField={r => r.id}
        searchable
        searchPlaceholder="Search vouchers..."
        searchFields={r => `${r.tallyVoucherNumber ?? ''} ${r.paymentNumber} ${r.payeeName}`}
        emptyMessage="No Tally vouchers posted yet."
        emptyIcon={<PieChart className="h-8 w-8" />}
      />
    </div>
  )
}
