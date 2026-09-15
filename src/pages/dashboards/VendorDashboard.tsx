import { useMemo } from 'react'
import { FileSearch, Quote, FileSignature, Truck, FolderKanban } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, fmtDate } from '../../lib/utils'

export default function VendorDashboard() {
  const state = useStore()
  const user = state.currentUser!

  const vendor = useMemo(() => state.vendors.find(v => user.designation.includes(v.name)), [state.vendors, user.designation])

  const enquiries = useMemo(() => vendor ? state.enquiries.filter(e => e.vendorIds.includes(vendor.id)) : state.enquiries, [state.enquiries, vendor])
  const quotations = useMemo(() => vendor ? state.vendorQuotations.filter(q => q.vendorId === vendor.id) : state.vendorQuotations, [state.vendorQuotations, vendor])
  const pos = useMemo(() => vendor ? state.purchaseOrders.filter(po => po.vendorId === vendor.id) : state.purchaseOrders, [state.purchaseOrders, vendor])
  const dispatches = useMemo(() => vendor ? state.dispatches.filter(d => d.vendorId === vendor.id) : state.dispatches, [state.dispatches, vendor])
  const documents = useMemo(() => vendor ? state.documents.filter(d => d.vendorId === vendor.id) : state.documents.filter(d => !!d.vendorId), [state.documents, vendor])

  const poValue = pos.reduce((s, po) => s + po.total, 0)

  return (
    <div>
      <PageHeader
        title={vendor ? `${vendor.name} — Vendor Portal` : 'Vendor Portal'}
        subtitle={vendor ? `${vendor.category} · Rating ${vendor.rating}/5` : 'Showing all vendor-facing records — no matching vendor profile found for your account.'}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Assigned RFQs" value={enquiries.length} icon={<FileSearch className="h-4 w-4" />} />
        <KpiCard label="Quotations Submitted" value={quotations.length} icon={<Quote className="h-4 w-4" />} />
        <KpiCard label="Purchase Orders" value={pos.length} sub={fmtCurrency(poValue)} icon={<FileSignature className="h-4 w-4" />} />
        <KpiCard label="Dispatches" value={dispatches.length} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Documents" value={documents.length} icon={<FolderKanban className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Assigned RFQs / Enquiries">
          {enquiries.length === 0 ? <EmptyState message="No RFQs assigned yet." /> : (
            <ul className="space-y-2">
              {enquiries.map(e => (
                <li key={e.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{e.rfqNumber}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-xs text-ink-500">Qty {e.qty} {e.unit} &middot; Quotation due {fmtDate(e.quotationDueDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="My Quotations">
          {quotations.length === 0 ? <EmptyState message="No quotations submitted yet." /> : (
            <ul className="space-y-2">
              {quotations.map(q => (
                <li key={q.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{q.brand || 'Quotation'} &middot; {fmtCurrency(q.rate)}/unit</span>
                    <StatusBadge status={q.technicalStatus} />
                  </div>
                  <p className="text-xs text-ink-500">Delivery in {q.deliveryDays} days &middot; Valid till {fmtDate(q.validity)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Purchase Orders Issued">
          {pos.length === 0 ? <EmptyState message="No purchase orders issued yet." /> : (
            <ul className="space-y-2">
              {pos.map(po => (
                <li key={po.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{po.poNumber}</span>
                    <StatusBadge status={po.status} />
                  </div>
                  <p className="text-xs text-ink-500">{fmtCurrency(po.total)} &middot; Expected delivery {fmtDate(po.expectedDelivery)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Dispatches">
          {dispatches.length === 0 ? <EmptyState message="No dispatches recorded yet." /> : (
            <ul className="space-y-2">
              {dispatches.map(d => (
                <li key={d.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{d.dispatchNumber}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-ink-500">Vehicle {d.vehicleNumber} &middot; Qty {d.qty} &middot; Expected {fmtDate(d.expectedArrival)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Documents" className="xl:col-span-2">
          {documents.length === 0 ? <EmptyState message="No documents linked to your vendor profile." /> : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {documents.map(d => (
                <li key={d.id} className="rounded-md border border-ink-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-800">{d.name}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-ink-500">{d.type} &middot; v{d.version}{d.expiryDate ? ` · Expires ${fmtDate(d.expiryDate)}` : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
