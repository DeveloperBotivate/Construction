import { NavLink } from 'react-router-dom'
import { HardHat } from 'lucide-react'
import { NAV_SECTIONS } from '../../lib/nav'
import { canAccessModule } from '../../lib/permissions'
import { useStore } from '../../store/useStore'
import { cls } from '../../lib/utils'

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const role = useStore(s => s.currentUser?.role)
  if (!role) return null

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden" onClick={onCloseMobile} />}
      <aside className={cls(
        'fixed inset-y-0 left-0 z-40 w-64 shrink-0 -translate-x-full overflow-y-auto border-r border-ink-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        mobileOpen && 'translate-x-0'
      )}>
        <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <HardHat className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-ink-900">Construction ERP</p>
            <p className="text-[11px] leading-none text-ink-400">Project Operations System</p>
          </div>
        </div>
        <nav className="px-2 py-3">
          {NAV_SECTIONS.map(section => {
            const items = section.items.filter(i => canAccessModule(role, i.key))
            if (items.length === 0) return null
            return (
              <div key={section.title} className="mb-4">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{section.title}</p>
                <ul className="space-y-0.5">
                  {items.map(item => (
                    <li key={item.key}>
                      <NavLink
                        to={item.path}
                        onClick={onCloseMobile}
                        className={({ isActive }) => cls(
                          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
