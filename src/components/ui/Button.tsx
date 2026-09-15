import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cls } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type Size = 'sm' | 'md'

const VARIANT_CLS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-ink-300',
  secondary: 'bg-white text-ink-700 ring-1 ring-inset ring-ink-300 hover:bg-ink-50 disabled:text-ink-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-ink-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-ink-300',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 disabled:text-ink-300',
}
const SIZE_CLS: Record<Size, string> = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-2 text-sm' }

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  title?: string
}

export function Button({ variant = 'secondary', size = 'md', icon, className, children, title, ...rest }: Props) {
  return (
    <button
      title={title}
      className={cls('inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed', VARIANT_CLS[variant], SIZE_CLS[size], className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({ icon, className, title, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode; title: string }) {
  return (
    <button title={title} className={cls('inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-800', className)} {...rest}>
      {icon}
    </button>
  )
}
