import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Inbox, Menu as MenuIcon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { GlobalSearch } from './GlobalSearch'
import { cls } from '../../lib/utils'

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  const items = [
    { key: 'home', label: 'Dashboard', icon: LayoutDashboard, active: location.pathname === '/dashboard', onClick: () => navigate('/dashboard') },
    { key: 'search', label: 'Search', icon: Search, active: false, onClick: () => setSearchOpen(true) },
    { key: 'approvals', label: 'Approvals', icon: Inbox, active: location.pathname === '/approvals', onClick: () => navigate('/approvals') },
    { key: 'menu', label: 'Menu', icon: MenuIcon, active: false, onClick: onOpenMenu },
  ]

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map(item => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={cls(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium',
              item.active ? 'text-brand-700' : 'text-ink-500'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search" size="lg">
        <GlobalSearch autoFocus />
      </Modal>
    </>
  )
}
