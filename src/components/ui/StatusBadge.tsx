import { cls } from '../../lib/utils'

const SUCCESS = ['APPROVED', 'ACCEPTED', 'PAID', 'CLOSED', 'ACTIVE', 'COMPLETED', 'ISSUED', 'FULLY_RECEIVED', 'MATCHED', 'RESOLVED', 'VERIFIED', 'RECEIVED', 'CERTIFIED', 'PASS', 'RENEWED', 'TALLY_POSTED', 'MD_APPROVED', 'ACCOUNTS_VERIFIED', 'PE_VERIFIED', 'PM_VERIFIED', 'VENDOR_SELECTED']
const DANGER = ['REJECTED', 'MISMATCH', 'OVERDUE', 'FAIL', 'FAILED', 'EXPIRED', 'CANCELLED', 'HOLD', 'CRITICAL', 'DAMAGED', 'BREAKDOWN', 'FAILED_PENDING_CORRECTION']
const WARNING = ['CORRECTION_REQUIRED', 'SENT_BACK', 'ON_HOLD', 'DELAYED', 'WARNING', 'RENEWAL_DUE', 'EXPIRING_SOON', 'HALF_DAY', 'PARTIALLY_RECEIVED', 'IN_TRANSIT', 'FORECLOSURE_REQUESTED', 'MEDIUM', 'HIGH']
const INFO = ['SUBMITTED', 'PENDING', 'DRAFT', 'REVIEW', 'IN_PROGRESS', 'ASSIGNED', 'OPEN', 'REQUESTED', 'PLANNING', 'SENT', 'DISPATCHED', 'MGMT_APPROVAL_PENDING', 'MD_APPROVAL_PENDING', 'DOCUMENT_CHECK', 'THREE_WAY_MATCH', 'PROCUREMENT_PENDING', 'AT_SITE', 'LIFTED', 'READY_FOR_LIFTING', 'NA']

function tone(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  const s = status.toUpperCase()
  if (SUCCESS.some(k => s.includes(k))) return 'success'
  if (DANGER.some(k => s.includes(k))) return 'danger'
  if (WARNING.some(k => s.includes(k))) return 'warning'
  if (INFO.some(k => s.includes(k))) return 'info'
  return 'neutral'
}

const TONE_CLS: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-500/20',
}

const DOT_CLS: Record<string, string> = {
  success: 'bg-emerald-500', danger: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500', neutral: 'bg-ink-400',
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const t = tone(status)
  return (
    <span className={cls('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', TONE_CLS[t])}>
      <span className={cls('h-1.5 w-1.5 rounded-full', DOT_CLS[t])} />
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    LOW: 'bg-ink-100 text-ink-600', NORMAL: 'bg-blue-50 text-blue-700', MEDIUM: 'bg-blue-50 text-blue-700',
    HIGH: 'bg-amber-50 text-amber-800', URGENT: 'bg-red-50 text-red-700', CRITICAL: 'bg-red-50 text-red-700',
  }
  return <span className={cls('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', map[priority.toUpperCase()] ?? 'bg-ink-100 text-ink-600')}>{priority}</span>
}
