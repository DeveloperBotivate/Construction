import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import type { TraceNode } from '../../store/selectors'
import { recordLink } from '../../lib/recordLinks'
import { fmtDate } from '../../lib/utils'
import { StatusBadge } from './StatusBadge'
import { cls } from '../../lib/utils'

export function TraceabilityPanel({ nodes }: { nodes: TraceNode[] }) {
  const navigate = useNavigate()
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-0">
        {nodes.map((node, i) => {
          const link = recordLink(node.recordType, node.recordId)
          return (
            <div key={node.stage} className="flex items-stretch">
              <button
                disabled={!link}
                onClick={() => link && navigate(link)}
                className={cls(
                  'flex w-48 flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors',
                  node.done ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50' : 'border-ink-200 bg-ink-50/50',
                  link && 'cursor-pointer hover:border-brand-300',
                  !link && 'cursor-default'
                )}
              >
                <div className="flex items-center gap-1.5">
                  {node.done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-ink-300" />}
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{node.stage}</span>
                </div>
                <span className="text-sm font-medium leading-snug text-ink-800">{node.label}</span>
                {node.status && <StatusBadge status={node.status} />}
                {node.date && <span className="text-xs text-ink-400">{fmtDate(node.date)}</span>}
              </button>
              {i < nodes.length - 1 && (
                <div className="flex w-6 items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-ink-300" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
