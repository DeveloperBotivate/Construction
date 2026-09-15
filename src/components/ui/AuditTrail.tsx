import { useStore } from '../../store/useStore'
import { fmtDateTime } from '../../lib/utils'
import { EmptyState } from './EmptyState'
import { roleLabel } from '../../lib/permissions'

export function AuditTrail({ recordType, recordId }: { recordType: string; recordId: string }) {
  const auditLog = useStore(s => s.auditLog)
  const entries = auditLog.filter(a => a.recordType === recordType && a.recordId === recordId).slice().reverse()
  if (entries.length === 0) return <EmptyState message="No audit events recorded for this record yet." />
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200">
      <table className="min-w-full divide-y divide-ink-200 text-sm">
        <thead className="bg-ink-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Action</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Change</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">User</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 bg-white">
          {entries.map(e => (
            <tr key={e.id}>
              <td className="px-3 py-2 font-medium text-ink-800">{e.action}</td>
              <td className="px-3 py-2 text-ink-500">
                {e.oldValue || e.newValue ? <span>{e.oldValue ?? '-'} <span className="text-ink-300">&rarr;</span> {e.newValue ?? '-'}</span> : '-'}
                {e.reason && <div className="mt-0.5 text-xs italic text-ink-400">"{e.reason}"</div>}
              </td>
              <td className="px-3 py-2 text-ink-600">{e.userName}<div className="text-xs text-ink-400">{roleLabel(e.role)}</div></td>
              <td className="px-3 py-2 whitespace-nowrap text-ink-500">{fmtDateTime(e.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
