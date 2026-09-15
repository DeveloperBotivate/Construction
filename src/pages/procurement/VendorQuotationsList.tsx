import { useNavigate } from 'react-router-dom'
import { Quote } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { VendorQuotation } from '../../types'

export default function VendorQuotationsList() {
  const navigate = useNavigate()
  const quotations = useStore(s => s.vendorQuotations)
  const vendors = useStore(s => s.vendors)
  const enquiries = useStore(s => s.enquiries)

  function landedCost(q: VendorQuotation) {
    const enquiry = enquiries.find(e => e.id === q.rfqId)
    const qty = enquiry?.qty ?? 0
    return qty * q.rate * (1 + q.tax / 100) + q.freight
  }

  const columns: Column<VendorQuotation>[] = [
    { key: 'vendor', header: 'Vendor', render: r => vendors.find(v => v.id === r.vendorId)?.name ?? r.vendorId },
    { key: 'rfq', header: 'RFQ #', render: r => enquiries.find(e => e.id === r.rfqId)?.rfqNumber ?? r.rfqId },
    { key: 'rate', header: 'Rate', render: r => fmtCurrency(r.rate), sortValue: r => r.rate },
    { key: 'tax', header: 'Tax %', render: r => `${r.tax}%` },
    { key: 'freight', header: 'Freight', render: r => fmtCurrency(r.freight) },
    { key: 'landed', header: 'Landed Cost', render: r => <span className="font-semibold text-ink-800">{fmtCurrency(landedCost(r))}</span>, sortValue: r => landedCost(r) },
    { key: 'technical', header: 'Technical Status', render: r => <StatusBadge status={r.technicalStatus} /> },
    { key: 'submitted', header: 'Submitted', render: r => fmtDate(r.submittedAt), sortValue: r => r.submittedAt },
  ]

  return (
    <div>
      <PageHeader title="Vendor Quotations" subtitle="Bird's-eye view of every vendor quotation received across all enquiries." />
      <DataTable
        columns={columns}
        data={quotations}
        keyField={r => r.id}
        onRowClick={r => navigate(`/enquiries/${r.rfqId}`)}
        searchable
        searchPlaceholder="Search quotations..."
        searchFields={r => `${vendors.find(v => v.id === r.vendorId)?.name ?? ''} ${enquiries.find(e => e.id === r.rfqId)?.rfqNumber ?? ''} ${r.technicalStatus}`}
        emptyMessage="No vendor quotations received yet."
        emptyIcon={<Quote className="h-8 w-8" />}
      />
    </div>
  )
}
