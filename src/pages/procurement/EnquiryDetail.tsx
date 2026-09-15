import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Check, X, Award, FileSignature } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
import type { TabItem } from '../../components/ui/Tabs'
import { Card, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { CommentsPanel } from '../../components/ui/CommentsPanel'
import { AuditTrail } from '../../components/ui/AuditTrail'
import { fmtDate, fmtCurrency, cls } from '../../lib/utils'
import type { User, VendorQuotation } from '../../types'

function vendorMatchesUser(vendorName: string, user: User): boolean {
  const d = user.designation.toLowerCase()
  const v = vendorName.toLowerCase()
  return d.includes(v) || v.includes(d.replace('vendor - ', ''))
}

export default function EnquiryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const state = useStore(s => s)
  const addVendorQuotation = useStore(s => s.addVendorQuotation)
  const technicalReviewQuotation = useStore(s => s.technicalReviewQuotation)
  const selectVendor = useStore(s => s.selectVendor)

  const [quoteVendorId, setQuoteVendorId] = useState<string | null>(null)
  const [quoteForm, setQuoteForm] = useState({ rate: '', tax: '', freight: '', deliveryDays: '', brand: '', specification: '', validity: '', paymentTerms: '' })
  const [reviewModal, setReviewModal] = useState<{ quotation: VendorQuotation; decision: 'APPROVED' | 'REJECTED' } | null>(null)
  const [reviewRemarks, setReviewRemarks] = useState('')

  const enquiry = state.enquiries.find(e => e.id === id)

  if (!enquiry) {
    return (
      <div>
        <PageHeader title="Enquiry not found" breadcrumb={[{ label: 'Enquiries / RFQ', to: '/enquiries' }, { label: 'Not found' }]} />
        <EmptyState message="This enquiry does not exist or has been removed." />
      </div>
    )
  }

  const indent = state.materialIndents.find(i => i.id === enquiry.indentId)
  const material = state.materials.find(m => m.id === enquiry.materialId)
  const quotations = state.vendorQuotations.filter(q => q.rfqId === enquiry.id)
  const poExists = state.purchaseOrders.some(po => po.rfqId === enquiry.id)
  const canManage = user.role === 'PROCUREMENT'
  const hasApproved = quotations.some(q => q.technicalStatus === 'APPROVED')

  function resetQuoteForm() {
    setQuoteForm({ rate: '', tax: '', freight: '', deliveryDays: '', brand: '', specification: '', validity: '', paymentTerms: '' })
  }

  function handleAddQuotation() {
    if (!quoteVendorId || !quoteForm.rate) return
    addVendorQuotation(enquiry!.id, {
      vendorId: quoteVendorId,
      rate: Number(quoteForm.rate) || 0,
      tax: Number(quoteForm.tax) || 0,
      freight: Number(quoteForm.freight) || 0,
      deliveryDays: Number(quoteForm.deliveryDays) || 0,
      brand: quoteForm.brand,
      specification: quoteForm.specification,
      validity: quoteForm.validity || new Date().toISOString(),
      paymentTerms: quoteForm.paymentTerms,
    })
    setQuoteVendorId(null)
    resetQuoteForm()
  }

  function landedCost(q: VendorQuotation) {
    return enquiry!.qty * q.rate * (1 + q.tax / 100) + q.freight
  }

  const lowestCost = quotations.length > 0 ? Math.min(...quotations.map(landedCost)) : 0

  const overviewTab = (
    <div className="space-y-4">
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className="text-xs uppercase text-ink-500">Indent</dt><dd className="font-medium text-ink-800">{indent ? <button className="text-brand-600 hover:underline" onClick={() => navigate(`/indents/${indent.id}`)}>{indent.indentNumber}</button> : '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Material</dt><dd className="font-medium text-ink-800">{material?.name ?? '-'}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Qty</dt><dd className="font-medium text-ink-800">{enquiry.qty} {enquiry.unit}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Status</dt><dd><StatusBadge status={enquiry.status} /></dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Required Date</dt><dd className="font-medium text-ink-800">{fmtDate(enquiry.requiredDate)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Quotation Due</dt><dd className="font-medium text-ink-800">{fmtDate(enquiry.quotationDueDate)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Selected Vendor</dt><dd className="font-medium text-ink-800">{enquiry.selectedVendorId ? state.vendors.find(v => v.id === enquiry.selectedVendorId)?.name : '-'}</dd></div>
          <div className="col-span-2 sm:col-span-4"><dt className="text-xs uppercase text-ink-500">Technical Requirements</dt><dd className="text-ink-700">{enquiry.technicalRequirements || '-'}</dd></div>
        </dl>
      </Card>

      <SectionCard title="Invited Vendors">
        <div className="overflow-x-auto rounded-lg border border-ink-200">
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Vendor</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Quotation Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Rate</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white">
              {enquiry.vendorIds.map(vid => {
                const vendor = state.vendors.find(v => v.id === vid)
                const quote = quotations.find(q => q.vendorId === vid)
                const canAdd = !quote && (canManage || (user.role === 'VENDOR' && vendorMatchesUser(vendor?.name ?? '', user)))
                return (
                  <tr key={vid}>
                    <td className="px-3 py-2 font-medium text-ink-800">{vendor?.name ?? vid}</td>
                    <td className="px-3 py-2">{quote ? <StatusBadge status={quote.technicalStatus} /> : <span className="text-xs text-ink-400">Not submitted</span>}</td>
                    <td className="px-3 py-2 text-ink-600">{quote ? fmtCurrency(quote.rate) : '-'}</td>
                    <td className="px-3 py-2">
                      {!quote && (
                        <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} disabled={!canAdd} title={!canAdd ? 'Only Procurement or the invited vendor can submit a quotation.' : undefined} onClick={() => setQuoteVendorId(vid)}>
                          Add Quotation
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {quotations.length > 0 && (
        <SectionCard title="Vendor Comparison">
          <div className="overflow-x-auto rounded-lg border border-ink-200">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Vendor</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Rate</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Tax %</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Freight</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Delivery</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Landed Cost</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Technical</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {quotations.map(q => {
                  const vendor = state.vendors.find(v => v.id === q.vendorId)
                  const cost = landedCost(q)
                  const isLowest = cost === lowestCost
                  return (
                    <tr key={q.id} className={cls(isLowest && 'bg-emerald-50/60')}>
                      <td className="px-3 py-2 font-medium text-ink-800">{vendor?.name ?? q.vendorId}</td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(q.rate)}</td>
                      <td className="px-3 py-2 text-ink-600">{q.tax}%</td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(q.freight)}</td>
                      <td className="px-3 py-2 text-ink-600">{q.deliveryDays} days</td>
                      <td className="px-3 py-2 font-semibold text-ink-800">{fmtCurrency(cost)}{isLowest && <span className="ml-1.5 text-xs font-normal text-emerald-600">Lowest</span>}</td>
                      <td className="px-3 py-2"><StatusBadge status={q.technicalStatus} /></td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {q.technicalStatus === 'PENDING' && (
                            <>
                              <Button size="sm" variant="success" icon={<Check className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Procurement can review quotations.' : undefined} onClick={() => setReviewModal({ quotation: q, decision: 'APPROVED' })}>Approve</Button>
                              <Button size="sm" variant="danger" icon={<X className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Procurement can review quotations.' : undefined} onClick={() => setReviewModal({ quotation: q, decision: 'REJECTED' })}>Reject</Button>
                            </>
                          )}
                          {q.technicalStatus === 'APPROVED' && enquiry.selectedVendorId !== q.vendorId && (
                            <Button size="sm" variant="primary" icon={<Award className="h-3.5 w-3.5" />} disabled={!canManage} title={!canManage ? 'Only Procurement can select the vendor.' : undefined} onClick={() => selectVendor(enquiry.id, q.vendorId)}>Select Vendor</Button>
                          )}
                          {enquiry.selectedVendorId === q.vendorId && <span className="text-xs font-medium text-brand-700">Selected</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!hasApproved && <p className="mt-2 text-xs text-ink-400">At least one quotation must be technically approved before a vendor can be selected.</p>}
        </SectionCard>
      )}

      {enquiry.selectedVendorId && !poExists && (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-brand-50/50">
          <div>
            <p className="text-sm font-medium text-ink-800">Vendor selected - ready to create the Purchase Order</p>
            <p className="text-xs text-ink-500">{state.vendors.find(v => v.id === enquiry.selectedVendorId)?.name}</p>
          </div>
          <Button
            variant="primary" icon={<FileSignature className="h-4 w-4" />} disabled={!canManage}
            title={!canManage ? 'Only Procurement can create a Purchase Order.' : undefined}
            onClick={() => navigate('/po/new', { state: { rfqId: enquiry.id, vendorId: enquiry.selectedVendorId, indentId: enquiry.indentId } })}
          >
            Create Purchase Order
          </Button>
        </Card>
      )}
    </div>
  )

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', content: overviewTab },
    { key: 'comments', label: 'Comments', content: <CommentsPanel recordType="Enquiry" recordId={enquiry.id} /> },
    { key: 'audit', label: 'Audit Log', content: <AuditTrail recordType="Enquiry" recordId={enquiry.id} /> },
  ]

  return (
    <div>
      <PageHeader
        title={enquiry.rfqNumber}
        subtitle={`${material?.name ?? ''} - ${enquiry.qty} ${enquiry.unit}`}
        breadcrumb={[{ label: 'Enquiries / RFQ', to: '/enquiries' }, { label: enquiry.rfqNumber }]}
      />
      <Tabs tabs={tabs} />

      <Modal
        open={!!quoteVendorId}
        onClose={() => { setQuoteVendorId(null); resetQuoteForm() }}
        title={`Add Vendor Quotation - ${state.vendors.find(v => v.id === quoteVendorId)?.name ?? ''}`}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => { setQuoteVendorId(null); resetQuoteForm() }}>Cancel</Button>
          <Button variant="primary" disabled={!quoteForm.rate} onClick={handleAddQuotation}>Save Quotation</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Rate (per {enquiry.unit})</label>
            <input type="number" min="0" value={quoteForm.rate} onChange={e => setQuoteForm(f => ({ ...f, rate: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Tax %</label>
            <input type="number" min="0" value={quoteForm.tax} onChange={e => setQuoteForm(f => ({ ...f, tax: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Freight</label>
            <input type="number" min="0" value={quoteForm.freight} onChange={e => setQuoteForm(f => ({ ...f, freight: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Delivery Days</label>
            <input type="number" min="0" value={quoteForm.deliveryDays} onChange={e => setQuoteForm(f => ({ ...f, deliveryDays: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Brand</label>
            <input value={quoteForm.brand} onChange={e => setQuoteForm(f => ({ ...f, brand: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Validity Date</label>
            <input type="date" value={quoteForm.validity} onChange={e => setQuoteForm(f => ({ ...f, validity: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Specification</label>
            <input value={quoteForm.specification} onChange={e => setQuoteForm(f => ({ ...f, specification: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Payment Terms</label>
            <input value={quoteForm.paymentTerms} onChange={e => setQuoteForm(f => ({ ...f, paymentTerms: e.target.value }))} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="e.g. 30 days from GRN" />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!reviewModal}
        onClose={() => { setReviewModal(null); setReviewRemarks('') }}
        title={reviewModal?.decision === 'APPROVED' ? 'Technical Approval' : 'Technical Rejection'}
        footer={<>
          <Button variant="secondary" onClick={() => { setReviewModal(null); setReviewRemarks('') }}>Cancel</Button>
          <Button
            variant={reviewModal?.decision === 'APPROVED' ? 'success' : 'danger'}
            disabled={!reviewRemarks.trim()}
            onClick={() => {
              if (!reviewModal) return
              technicalReviewQuotation(reviewModal.quotation.id, reviewModal.decision, reviewRemarks.trim())
              setReviewModal(null); setReviewRemarks('')
            }}
          >
            Confirm
          </Button>
        </>}
      >
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Remarks (required)</label>
        <textarea value={reviewRemarks} onChange={e => setReviewRemarks(e.target.value)} rows={3} className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Note the technical basis for this decision..." />
      </Modal>
    </div>
  )
}
