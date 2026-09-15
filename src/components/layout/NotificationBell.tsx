import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { recordLink } from '../../lib/recordLinks'
import { fmtDateTime, cls } from '../../lib/utils'

const ICON = { INFO: Info, WARNING: AlertTriangle, CRITICAL: AlertCircle }
const ICON_CLS = { INFO: 'text-blue-500', WARNING: 'text-amber-500', CRITICAL: 'text-red-500' }

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const user = useStore(s => s.currentUser!)
  const allNotifications = useStore(s => s.notifications)
  const notifications = allNotifications.filter(n => n.toUserId === user.id || n.toRole === user.role).slice().reverse()
  const markRead = useStore(s => s.markNotificationRead)
  const markAllRead = useStore(s => s.markAllNotificationsRead)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative rounded-md p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-ink-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <span className="text-sm font-semibold text-ink-800">Notifications</span>
              <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-400">No notifications.</p>}
              {notifications.map(n => {
                const Icon = ICON[n.severity]
                const link = recordLink(n.relatedRecordType ?? '', n.relatedRecordId)
                return (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); if (link) { navigate(link); setOpen(false) } }}
                    className={cls('flex w-full items-start gap-2.5 border-b border-ink-100 px-4 py-3 text-left hover:bg-ink-50', !n.read && 'bg-brand-50/40')}
                  >
                    <Icon className={cls('mt-0.5 h-4 w-4 shrink-0', ICON_CLS[n.severity])} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-ink-800">{n.title}</span>
                      <span className="block text-xs text-ink-500">{n.message}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-400">{fmtDateTime(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
