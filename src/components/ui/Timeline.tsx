import type { ReactNode } from 'react'
import { Check, X, CornerUpLeft, Send, Eye } from 'lucide-react'
import { fmtDateTime, cls } from '../../lib/utils'
import { EmptyState } from './EmptyState'

export interface TimelineStep {
  id: string
  title: string
  subtitle?: string
  timestamp?: string
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
  icon?: ReactNode
}

const TONE_DOT: Record<string, string> = {
  success: 'bg-emerald-500 ring-emerald-100', danger: 'bg-red-500 ring-red-100', warning: 'bg-amber-500 ring-amber-100',
  info: 'bg-blue-500 ring-blue-100', neutral: 'bg-ink-400 ring-ink-100',
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  if (steps.length === 0) return <EmptyState message="No activity recorded yet." />
  return (
    <ol className="relative border-l border-ink-200 pl-5">
      {steps.map(step => (
        <li key={step.id} className="mb-5 last:mb-0">
          <span className={cls('absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4', TONE_DOT[step.tone ?? 'neutral'])} />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium text-ink-800">{step.title}</p>
            {step.timestamp && <span className="text-xs text-ink-400">{fmtDateTime(step.timestamp)}</span>}
          </div>
          {step.subtitle && <p className="mt-0.5 text-sm text-ink-500">{step.subtitle}</p>}
        </li>
      ))}
    </ol>
  )
}

export function approvalStepIcon(action: string) {
  switch (action) {
    case 'APPROVED': return <Check className="h-3 w-3 text-white" />
    case 'REJECTED': return <X className="h-3 w-3 text-white" />
    case 'SENT_BACK': return <CornerUpLeft className="h-3 w-3 text-white" />
    case 'SUBMITTED': return <Send className="h-3 w-3 text-white" />
    default: return <Eye className="h-3 w-3 text-white" />
  }
}

export function approvalStepTone(action: string): TimelineStep['tone'] {
  switch (action) {
    case 'APPROVED': case 'VERIFIED': return 'success'
    case 'REJECTED': return 'danger'
    case 'SENT_BACK': return 'warning'
    default: return 'info'
  }
}
