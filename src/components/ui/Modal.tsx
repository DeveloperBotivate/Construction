import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!open) return null
  const widthCls = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 animate-fade-in" onClick={onClose}>
      <div className={`w-full ${widthCls} max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-200 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
