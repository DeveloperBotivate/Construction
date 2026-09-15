import { useMemo, useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import { cls } from '../../lib/utils'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  sortValue?: (row: T) => string | number
  hideBelow?: 'sm' | 'md' | 'lg'
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: (row: T) => string
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  emptyIcon?: ReactNode
  toolbar?: ReactNode
  searchFields?: (row: T) => string
  pageSize?: number
}

const HIDE_CLS = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

export function DataTable<T>({ columns, data, keyField, onRowClick, searchable, searchPlaceholder, emptyMessage, emptyIcon, toolbar, searchFields, pageSize = 25 }: Props<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    return data.filter(row => (searchFields ? searchFields(row) : JSON.stringify(row)).toLowerCase().includes(q))
  }, [data, query, searchFields])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find(c => c.key === sortKey)
    if (!col?.sortValue) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = col.sortValue!(a), bv = col.sortValue!(b)
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(0) }}
                placeholder={searchPlaceholder ?? 'Search...'}
                className="w-full rounded-md border border-ink-300 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
      )}
      {/* Desktop / tablet: table */}
      <div className="table-scroll hidden overflow-x-auto rounded-lg border border-ink-200 md:block">
        <table className="min-w-full divide-y divide-ink-200 bg-white text-sm">
          <thead className="bg-ink-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cls('whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500', col.sortValue && 'cursor-pointer select-none', col.hideBelow && HIDE_CLS[col.hideBelow])}
                  onClick={() => { if (!col.sortValue) return; if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(col.key); setSortDir('asc') } }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {pageRows.map(row => (
              <tr key={keyField(row)} className={cls('animate-fade-in', onRowClick && 'cursor-pointer hover:bg-ink-50')} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={col.key} className={cls('px-3 py-2.5 align-middle text-ink-700', col.className, col.hideBelow && HIDE_CLS[col.hideBelow])}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 && <EmptyState message={emptyMessage ?? 'No records found.'} icon={emptyIcon} />}
      </div>

      {/* Mobile: card view */}
      <div className="space-y-2.5 md:hidden">
        {pageRows.map(row => {
          const [primary, ...rest] = columns
          const actionsCol = rest.find(c => c.header === 'Actions')
          const detailCols = rest.filter(c => c !== actionsCol)
          return (
            <div
              key={keyField(row)}
              className={cls('animate-fade-in rounded-lg border border-ink-200 bg-white p-3.5 shadow-sm', onRowClick && 'cursor-pointer active:bg-ink-50')}
              onClick={() => onRowClick?.(row)}
            >
              <div className="text-sm font-medium text-ink-800">{primary.render(row)}</div>
              {detailCols.length > 0 && (
                <div className="mt-2.5 divide-y divide-ink-100 border-t border-ink-100 text-xs">
                  {detailCols.map(col => (
                    <div key={col.key} className="flex items-center justify-between gap-3 py-1.5">
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{col.header}</span>
                      <span className="min-w-0 text-right text-ink-700">{col.render(row)}</span>
                    </div>
                  ))}
                </div>
              )}
              {actionsCol && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3" onClick={e => e.stopPropagation()}>
                  {actionsCol.render(row)}
                </div>
              )}
            </div>
          )
        })}
        {pageRows.length === 0 && <EmptyState message={emptyMessage ?? 'No records found.'} icon={emptyIcon} />}
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
          <span>Showing {page * pageSize + 1}-{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded border border-ink-300 px-2 py-1 disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded border border-ink-300 px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
