import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cls } from '../../lib/utils'

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'md' }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; width?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!open) return null
  const widthCls = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }[width]
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/40 animate-fade-in" onClick={onClose}>
      <div className={cls('flex h-full w-full flex-col bg-white shadow-2xl', widthCls)} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-ink-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
