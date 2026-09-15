import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarX, FileWarning, Clock3, CalendarClock, CheckCircle2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { fmtDate, fmtCurrency, daysUntil, cls } from '../../lib/utils'
import { recordLink } from '../../lib/recordLinks'

interface ExpiryRow {
  id: string
  recordType: 'AppDocument' | 'Subscription'
  name: string
  subLabel: string
  date: string
  days: number
  amount?: number
}

type Tier = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'UPCOMING'

function tierOf(days: number): Tier | null {
  if (days <= 0) return 'EXPIRED'
  if (days <= 7) return 'CRITICAL'
  if (days <= 15) return 'WARNING'
  if (days <= 30) return 'UPCOMING'
  return null
}

const TIER_META: Record<Tier, { label: string; icon: typeof FileWarning; toneCls: string; headerCls: string }> = {
  EXPIRED: { label: 'Expired', icon: FileWarning, toneCls: 'border-red-200 bg-red-50/40', headerCls: 'text-red-700' },
  CRITICAL: { label: 'Critical (1-7 days)', icon: Clock3, toneCls: 'border-amber-200 bg-amber-50/40', headerCls: 'text-amber-700' },
  WARNING: { label: 'Warning (8-15 days)', icon: CalendarClock, toneCls: 'border-blue-200 bg-blue-50/40', headerCls: 'text-blue-700' },
  UPCOMING: { label: 'Upcoming (16-30 days)', icon: CheckCircle2, toneCls: 'border-ink-200 bg-ink-50/40', headerCls: 'text-ink-700' },
}

export default function DocumentExpiry() {
  const documents = useStore(s => s.documents)
  const subscriptions = useStore(s => s.subscriptions)
  const navigate = useNavigate()

  const tiers = useMemo(() => {
    const rows: ExpiryRow[] = []
    for (const d of documents) {
      if (!d.expiryDate) continue
      rows.push({ id: d.id, recordType: 'AppDocument', name: d.name, subLabel: `${d.docNumber} · ${d.type}`, date: d.expiryDate, days: daysUntil(d.expiryDate) })
    }
    for (const s of subscriptions) {
      rows.push({ id: s.id, recordType: 'Subscription', name: s.name, subLabel: `${s.provider} · ${s.type}`, date: s.renewalDate, days: daysUntil(s.renewalDate), amount: s.cost })
    }
    const grouped: Record<Tier, ExpiryRow[]> = { EXPIRED: [], CRITICAL: [], WARNING: [], UPCOMING: [] }
    for (const row of rows) {
      const t = tierOf(row.days)
      if (t) grouped[t].push(row)
    }
    for (const t of Object.keys(grouped) as Tier[]) grouped[t].sort((a, b) => a.days - b.days)
    return grouped
  }, [documents, subscriptions])

  const totalCount = tiers.EXPIRED.length + tiers.CRITICAL.length + tiers.WARNING.length + tiers.UPCOMING.length

  return (
    <div>
      <PageHeader title="Document &amp; Subscription Expiry" subtitle="Tiered view of documents and subscriptions approaching or past their expiry/renewal date." />

      {totalCount === 0 ? (
        <EmptyState message="Nothing is expiring within the next 30 days." icon={<CalendarX className="h-8 w-8" />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(TIER_META) as Tier[]).map(tier => {
            const meta = TIER_META[tier]
            const rows = tiers[tier]
            return (
              <SectionCard key={tier} title={<span className={cls('flex items-center gap-1.5', meta.headerCls)}><meta.icon className="h-4 w-4" />{meta.label}</span>} actions={<span className="text-xs font-semibold text-ink-500">{rows.length}</span>} className={cls('border', meta.toneCls)}>
                {rows.length === 0 ? (
                  <p className="py-4 text-center text-xs text-ink-400">None</p>
                ) : (
                  <ul className="space-y-2">
                    {rows.map(row => {
                      const link = recordLink(row.recordType, row.id)
                      return (
                        <li key={`${row.recordType}-${row.id}`} className={cls('rounded-md border border-ink-200 bg-white p-2.5', link && 'cursor-pointer hover:border-brand-300')} onClick={() => link && navigate(link)}>
                          <p className="text-sm font-medium text-ink-800">{row.name}</p>
                          <p className="text-xs text-ink-500">{row.subLabel}</p>
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className={row.days <= 0 ? 'font-medium text-red-600' : 'text-ink-500'}>{row.days <= 0 ? `Expired ${fmtDate(row.date)}` : `${fmtDate(row.date)} (${row.days}d)`}</span>
                            {row.amount !== undefined && <span className="font-medium text-ink-700">{fmtCurrency(row.amount)}</span>}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </SectionCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
