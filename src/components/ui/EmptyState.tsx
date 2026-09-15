import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ message, icon, action }: { message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="text-ink-300">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <p className="text-sm text-ink-500">{message}</p>
      {action}
    </div>
  )
}
