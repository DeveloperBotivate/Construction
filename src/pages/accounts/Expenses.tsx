import { useMemo } from 'react'
import { Coins, Truck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency } from '../../lib/utils'
import type { Freight } from '../../types'

export default function Expenses() {
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const freightRecords = useStore(s => s.freightRecords)
  const purchaseOrders = useStore(s => s.purchaseOrders)

  function poNumber(id: string) { return purchaseOrders.find(p => p.id === id)?.poNumber ?? '-' }

  const projectFreight = useMemo(
    () => freightRecords.filter(f => purchaseOrders.find(p => p.id === f.poId)?.projectId === selectedProjectId),
    [freightRecords, purchaseOrders, selectedProjectId]
  )
  const total = projectFreight.reduce((sum, f) => sum + f.amount, 0)
  const paidTotal = projectFreight.filter(f => f.paymentStatus === 'PAID').reduce((sum, f) => sum + f.amount, 0)

  const columns: Column<Freight>[] = [
    { key: 'freightNumber', header: 'Reference', render: r => <span className="font-medium text-ink-800">{r.freightNumber}</span> },
    { key: 'po', header: 'PO', render: r => poNumber(r.poId) },
    { key: 'transporter', header: 'Transporter', render: r => r.transporter },
    { key: 'amount', header: 'Amount', render: r => fmtCurrency(r.amount), sortValue: r => r.amount },
    { key: 'paymentStatus', header: 'Payment', render: r => <StatusBadge status={r.paymentStatus} /> },
  ]

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Ad-hoc project expenses (freight & transportation) for the selected project." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Total Expenses" value={fmtCurrency(total)} icon={<Coins className="h-4 w-4" />} />
        <KpiCard label="Paid" value={fmtCurrency(paidTotal)} tone="success" icon={<Truck className="h-4 w-4" />} />
      </div>

      <SectionCard title="Freight & Transportation Charges">
        <DataTable columns={columns} data={projectFreight} keyField={r => r.id} emptyMessage="No expenses recorded for this project yet." emptyIcon={<Coins className="h-8 w-8" />} />
      </SectionCard>
    </div>
  )
}
