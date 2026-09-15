import { useState, type ReactNode } from 'react'
import { cls } from '../../lib/utils'

export interface TabItem {
  key: string
  label: string
  badge?: number
  content: ReactNode
}

export function Tabs({ tabs, defaultTab }: { tabs: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key)
  const current = tabs.find(t => t.key === active) ?? tabs[0]
  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-ink-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cls(
              'relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors',
              active === t.key ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800'
            )}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-600">{t.badge}</span>
            )}
            {active === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">{current?.content}</div>
    </div>
  )
}
