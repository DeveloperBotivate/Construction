import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtCurrency, cls } from '../../lib/utils'
import type { VendorQuotation } from '../../types'

export default function VendorComparison() {
  const navigate = useNavigate()
  const enquiries = useStore(s => s.enquiries)
  const quotations = useStore(s => s.vendorQuotations)
  const vendors = useStore(s => s.vendors)
  const materials = useStore(s => s.materials)

  const comparableEnquiries = useMemo(
    () => enquiries
      .filter(e => quotations.filter(q => q.rfqId === e.id).length > 1)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [enquiries, quotations]
  )

  const [selectedId, setSelectedId] = useState<string>(comparableEnquiries[0]?.id ?? '')
  const enquiry = enquiries.find(e => e.id === selectedId) ?? comparableEnquiries[0]
  const rows = enquiry ? quotations.filter(q => q.rfqId === enquiry.id) : []

  function landedCost(q: VendorQuotation) {
    return (enquiry?.qty ?? 0) * q.rate * (1 + q.tax / 100) + q.freight
  }
  const lowest = rows.length > 0 ? Math.min(...rows.map(landedCost)) : 0

  return (
    <div>
      <PageHeader title="Vendor Comparison" subtitle="Side-by-side commercial and technical comparison of vendor quotations for an enquiry." />

      <Card className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-ink-600">Enquiry</label>
        <select
          value={selectedId || enquiry?.id || ''}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full max-w-md rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {comparableEnquiries.length === 0 && <option value="">No enquiries with multiple quotations yet</option>}
          {comparableEnquiries.map(e => (
            <option key={e.id} value={e.id}>{e.rfqNumber} - {materials.find(m => m.id === e.materialId)?.name ?? ''} ({quotations.filter(q => q.rfqId === e.id).length} quotes)</option>
          ))}
        </select>
      </Card>

      {!enquiry || rows.length === 0 ? (
        <EmptyState message="No enquiry with more than one vendor quotation is available for comparison yet." icon={<Scale className="h-8 w-8" />} />
      ) : (
        <Card>
          <div className="overflow-x-auto rounded-lg border border-ink-200">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Vendor</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Rate</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Tax %</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Freight</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Delivery Days</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Landed Cost</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Technical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {rows.map(q => {
                  const cost = landedCost(q)
                  const isLowest = cost === lowest
                  return (
                    <tr key={q.id} className={cls(isLowest && 'bg-emerald-50/60')}>
                      <td className="px-3 py-2 font-medium text-ink-800">
                        <button className="hover:underline" onClick={() => navigate(`/enquiries/${enquiry.id}`)}>{vendors.find(v => v.id === q.vendorId)?.name ?? q.vendorId}</button>
                      </td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(q.rate)}</td>
                      <td className="px-3 py-2 text-ink-600">{q.tax}%</td>
                      <td className="px-3 py-2 text-ink-600">{fmtCurrency(q.freight)}</td>
                      <td className="px-3 py-2 text-ink-600">{q.deliveryDays} days</td>
                      <td className="px-3 py-2 font-semibold text-ink-800">
                        {fmtCurrency(cost)}
                        {isLowest && <span className="ml-1.5 text-xs font-normal text-emerald-600">Lowest</span>}
                      </td>
                      <td className="px-3 py-2"><StatusBadge status={q.technicalStatus} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
