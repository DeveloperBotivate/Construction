let counter = 1000

export function genId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 6)}`
}

export function seqNumber(prefix: string, n: number, pad = 4): string {
  return `${prefix}-${String(n).padStart(pad, '0')}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function fmtDate(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function fmtCurrency(n: number): string {
  if (n == null || isNaN(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function fmtNumber(n: number, decimals = 2): string {
  if (n == null || isNaN(n)) return '0'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(n)
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime()
  const d2 = new Date(b).getTime()
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate).getTime() < Date.now()
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function cls(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
