import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { fmtCurrency } from '../../lib/utils'
import type { VendorBill } from '../../types'

const ACTIVE_STATUSES = ['DOCUMENT_CHECK', 'THREE_WAY_MATCH', 'HOLD']

export default function ThreeWayMatch() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const allVendorBills = useStore(s => s.vendorBills)
  const vendorBills = allVendorBills.filter(b => ACTIVE_STATUSES.includes(b.status))
  const vendors = useStore(s => s.vendors)
  const runThreeWayMatch = useStore(s => s.runThreeWayMatch)
  const verifyVendorBillAccounts = useStore(s => s.verifyVendorBillAccounts)

  const [exceptionTarget, setExceptionTarget] = useState<VendorBill | null>(null)

  const canAct = user.role === 'ACCOUNTS' || user.role === 'MD'

  function vendorName(id: string) { return vendors.find(v => v.id === id)?.name ?? '-' }

  const columns: Column<VendorBill>[] = [
    { key: 'billNumber', header: 'Bill #', render: r => <span className="font-medium text-ink-800">{r.billNumber}</span>, sortValue: r => r.billNumber },
    { key: 'vendor', header: 'Vendor', render: r => vendorName(r.vendorId) },
    { key: 'invoiceAmount', header: 'Invoice', render: r => fmtCurrency(r.invoiceAmount), sortValue: r => r.invoiceAmount },
    { key: 'grnAmount', header: 'GRN Amount', render: r => fmtCurrency(r.grnAmount), sortValue: r => r.grnAmount, hideBelow: 'sm' },
    { key: 'matchStatus', header: 'Match', render: r => <StatusBadge status={r.matchStatus} /> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex flex-wrap items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {r.status === 'DOCUMENT_CHECK' && (
            <Button variant="secondary" size="sm" icon={<Scale className="h-3.5 w-3.5" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD' : undefined} onClick={() => runThreeWayMatch(r.id)}>Run Match</Button>
          )}
          {r.status === 'THREE_WAY_MATCH' && r.matchStatus === 'MATCHED' && (
            <Button variant="primary" size="sm" icon={<ShieldCheck className="h-3.5 w-3.5" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD' : undefined} onClick={() => verifyVendorBillAccounts(r.id)}>Verify</Button>
          )}
          {r.matchStatus === 'MISMATCH' && (
            <Button variant="danger" size="sm" icon={<TriangleAlert className="h-3.5 w-3.5" />} disabled={!canAct} title={!canAct ? 'Only Accounts or MD' : undefined} onClick={() => setExceptionTarget(r)}>Approve Exception</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="3-Way Matching Queue" subtitle="Vendor bills awaiting document check, matching or resolution." />

      <DataTable
        columns={columns}
        data={vendorBills}
        keyField={r => r.id}
        onRowClick={r => navigate(`/vendor-bills/${r.id}`)}
        searchable
        searchPlaceholder="Search queue..."
        searchFields={r => `${r.billNumber} ${vendorName(r.vendorId)}`}
        emptyMessage="No vendor bills currently in the matching queue."
        emptyIcon={<Scale className="h-8 w-8" />}
      />

      <Modal
        open={!!exceptionTarget}
        onClose={() => setExceptionTarget(null)}
        title="Approve as Exception"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExceptionTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { if (exceptionTarget) verifyVendorBillAccounts(exceptionTarget.id, true); setExceptionTarget(null) }}>Confirm Override</Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{exceptionTarget?.billNumber}: {exceptionTarget?.mismatchReason ?? 'This bill failed the 3-way match check.'} Approving as an exception overrides the mismatch and moves the bill forward for payment.</span>
        </div>
      </Modal>
    </div>
  )
}
