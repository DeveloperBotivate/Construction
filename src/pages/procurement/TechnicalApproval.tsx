import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, BadgeCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { VendorQuotation } from '../../types'

export default function TechnicalApproval() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const allQuotations = useStore(s => s.vendorQuotations)
  const quotations = allQuotations.filter(q => q.technicalStatus === 'PENDING')
  const vendors = useStore(s => s.vendors)
  const enquiries = useStore(s => s.enquiries)
  const materials = useStore(s => s.materials)
  const technicalReviewQuotation = useStore(s => s.technicalReviewQuotation)

  const [reviewModal, setReviewModal] = useState<{ quotation: VendorQuotation; decision: 'APPROVED' | 'REJECTED' } | null>(null)
  const [remarks, setRemarks] = useState('')

  const canReview = user.role === 'PROCUREMENT'

  const columns: Column<VendorQuotation>[] = [
    { key: 'rfq', header: 'RFQ #', render: r => enquiries.find(e => e.id === r.rfqId)?.rfqNumber ?? r.rfqId },
    { key: 'material', header: 'Material', render: r => { const e = enquiries.find(en => en.id === r.rfqId); return materials.find(m => m.id === e?.materialId)?.name ?? '-' } },
    { key: 'vendor', header: 'Vendor', render: r => vendors.find(v => v.id === r.vendorId)?.name ?? r.vendorId },
    { key: 'rate', header: 'Rate', render: r => fmtCurrency(r.rate) },
    { key: 'tax', header: 'Tax %', render: r => `${r.tax}%` },
    { key: 'freight', header: 'Freight', render: r => fmtCurrency(r.freight) },
    { key: 'delivery', header: 'Delivery', render: r => `${r.deliveryDays} days` },
    { key: 'submitted', header: 'Submitted', render: r => fmtDate(r.submittedAt), sortValue: r => r.submittedAt },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="success" icon={<Check className="h-3.5 w-3.5" />} disabled={!canReview} title={!canReview ? 'Only Procurement can review quotations.' : undefined} onClick={() => setReviewModal({ quotation: r, decision: 'APPROVED' })}>Approve</Button>
          <Button size="sm" variant="danger" icon={<X className="h-3.5 w-3.5" />} disabled={!canReview} title={!canReview ? 'Only Procurement can review quotations.' : undefined} onClick={() => setReviewModal({ quotation: r, decision: 'REJECTED' })}>Reject</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Technical Approval" subtitle="Vendor quotations awaiting technical compliance review before commercial selection." />
      <DataTable
        columns={columns}
        data={quotations}
        keyField={r => r.id}
        onRowClick={r => navigate(`/enquiries/${r.rfqId}`)}
        searchable
        searchPlaceholder="Search pending quotations..."
        searchFields={r => `${vendors.find(v => v.id === r.vendorId)?.name ?? ''} ${enquiries.find(e => e.id === r.rfqId)?.rfqNumber ?? ''}`}
        emptyMessage="No vendor quotations are pending technical review."
        emptyIcon={<BadgeCheck className="h-8 w-8" />}
      />

      <Modal
        open={!!reviewModal}
        onClose={() => { setReviewModal(null); setRemarks('') }}
        title={reviewModal?.decision === 'APPROVED' ? 'Technical Approval' : 'Technical Rejection'}
        footer={<>
          <Button variant="secondary" onClick={() => { setReviewModal(null); setRemarks('') }}>Cancel</Button>
          <Button
            variant={reviewModal?.decision === 'APPROVED' ? 'success' : 'danger'}
            disabled={!remarks.trim()}
            onClick={() => {
              if (!reviewModal) return
              technicalReviewQuotation(reviewModal.quotation.id, reviewModal.decision, remarks.trim())
              setReviewModal(null); setRemarks('')
            }}
          >
            Confirm
          </Button>
        </>}
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Remarks (required)</label>
        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Note the technical basis for this decision..." />
      </Modal>
    </div>
  )
}
