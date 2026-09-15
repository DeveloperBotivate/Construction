import { useNavigate } from 'react-router-dom'
import { FileSearch } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { fmtDate } from '../../lib/utils'
import type { Enquiry } from '../../types'

export default function EnquiriesList() {
  const navigate = useNavigate()
  const enquiries = useStore(s => s.enquiries)
  const materials = useStore(s => s.materials)

  const columns: Column<Enquiry>[] = [
    { key: 'rfqNumber', header: 'RFQ #', render: r => <span className="font-medium text-ink-800">{r.rfqNumber}</span>, sortValue: r => r.rfqNumber },
    { key: 'material', header: 'Material', render: r => materials.find(m => m.id === r.materialId)?.name ?? '-' },
    { key: 'qty', header: 'Qty', render: r => `${r.qty} ${r.unit}` },
    { key: 'vendors', header: 'Vendors Invited', render: r => r.vendorIds.length },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'due', header: 'Quotation Due', render: r => fmtDate(r.quotationDueDate), sortValue: r => r.quotationDueDate },
  ]

  return (
    <div>
      <PageHeader title="Enquiries / RFQ" subtitle="Requests for quotation sent to vendors against approved material indents." />
      <DataTable
        columns={columns}
        data={enquiries}
        keyField={r => r.id}
        onRowClick={r => navigate(`/enquiries/${r.id}`)}
        searchable
        searchPlaceholder="Search enquiries..."
        searchFields={r => `${r.rfqNumber} ${materials.find(m => m.id === r.materialId)?.name ?? ''} ${r.status}`}
        emptyMessage="No enquiries raised yet."
        emptyIcon={<FileSearch className="h-8 w-8" />}
      />
    </div>
  )
}
