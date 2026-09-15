import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CircleDollarSign, ShieldCheck, FileWarning } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader, ProgressBar } from '../../components/ui/PageHeader'
import { KpiCard, SectionCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { APPROVAL_GATES } from '../../lib/permissions'
import { fmtCurrency, fmtDate } from '../../lib/utils'
import type { LoanInstallment } from '../../types'

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const loan = useStore(s => s.loans.find(l => l.id === id))
  const allInstallments = useStore(s => s.loanInstallments)
  const installments = allInstallments.filter(i => i.loanId === id)
  const payInstallment = useStore(s => s.payInstallment)
  const requestForeclosure = useStore(s => s.requestForeclosure)
  const approveForeclosure = useStore(s => s.approveForeclosure)

  const [confirmForeclose, setConfirmForeclose] = useState(false)

  const paidCount = useMemo(() => installments.filter(i => i.status === 'PAID').length, [installments])
  const progressPct = installments.length > 0 ? Math.round((paidCount / installments.length) * 100) : 0

  const canApproveForeclosure = APPROVAL_GATES.loanApproval.includes(user.role)

  if (!loan) {
    return (
      <div>
        <PageHeader title="Loan Not Found" breadcrumb={[{ label: 'Loans', to: '/loans' }, { label: 'Not Found' }]} />
        <EmptyState message="This loan record does not exist." action={<Button variant="secondary" onClick={() => navigate('/loans')}>Back to Loans</Button>} />
      </div>
    )
  }

  const columns: Column<LoanInstallment>[] = [
    { key: 'no', header: '#', render: i => i.installmentNo, sortValue: i => i.installmentNo },
    { key: 'dueDate', header: 'Due Date', render: i => fmtDate(i.dueDate), sortValue: i => i.dueDate },
    { key: 'amount', header: 'Amount', render: i => fmtCurrency(i.amount) },
    { key: 'status', header: 'Status', render: i => <StatusBadge status={i.status} /> },
    { key: 'paidDate', header: 'Paid Date', render: i => fmtDate(i.paidDate) },
    {
      key: 'actions', header: 'Actions', render: i => (
        <Button
          size="sm"
          variant="success"
          disabled={i.status === 'PAID'}
          title={i.status === 'PAID' ? 'Already paid' : undefined}
          onClick={() => payInstallment(loan.id, i.id)}
        >
          Pay
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={loan.name}
        subtitle={`${loan.loanNumber} · ${loan.lender}`}
        breadcrumb={[{ label: 'Loans', to: '/loans' }, { label: loan.loanNumber }]}
        actions={
          <>
            {loan.nocIssued && <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><ShieldCheck className="h-4 w-4" /> NOC Issued</span>}
            {loan.status === 'ACTIVE' && (
              <Button variant="secondary" icon={<FileWarning className="h-4 w-4" />} onClick={() => setConfirmForeclose(true)}>Request Foreclosure</Button>
            )}
            {loan.status === 'FORECLOSURE_REQUESTED' && (
              <Button
                variant="primary"
                icon={<CircleDollarSign className="h-4 w-4" />}
                disabled={!canApproveForeclosure}
                title={canApproveForeclosure ? undefined : 'Only MD can approve foreclosure'}
                onClick={() => approveForeclosure(loan.id)}
              >
                Approve Foreclosure
              </Button>
            )}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Principal" value={fmtCurrency(loan.principal)} />
        <KpiCard label="Outstanding" value={fmtCurrency(loan.outstanding)} tone={loan.outstanding > 0 ? 'warning' : 'success'} />
        <KpiCard label="EMI Amount" value={fmtCurrency(loan.emiAmount)} sub={`${loan.interestRate}% p.a. · ${loan.tenureMonths} months`} />
        <KpiCard label="Status" value={<StatusBadge status={loan.status} />} />
      </div>

      <SectionCard title="Installment Progress" className="mb-5">
        <div className="flex items-center gap-4">
          <div className="flex-1"><ProgressBar pct={progressPct} tone={progressPct === 100 ? 'success' : 'brand'} /></div>
          <span className="whitespace-nowrap text-sm font-medium text-ink-700">{paidCount} / {installments.length} paid ({progressPct}%)</span>
        </div>
      </SectionCard>

      <SectionCard title="Installment Schedule">
        {installments.length === 0 ? (
          <EmptyState message="No installment schedule has been generated for this loan yet." />
        ) : (
          <DataTable columns={columns} data={installments} keyField={i => i.id} pageSize={15} />
        )}
      </SectionCard>

      <Modal
        open={confirmForeclose}
        onClose={() => setConfirmForeclose(false)}
        title="Request Foreclosure"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmForeclose(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { requestForeclosure(loan.id); setConfirmForeclose(false) }}>Request Foreclosure</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">Request early closure of <span className="font-medium text-ink-800">{loan.name}</span> with outstanding balance {fmtCurrency(loan.outstanding)}? This will route the request to MD for approval.</p>
      </Modal>
    </div>
  )
}
