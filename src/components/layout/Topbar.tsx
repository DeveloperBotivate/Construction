import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { roleLabel } from '../../lib/permissions'
import { GlobalSearch } from './GlobalSearch'
import { NotificationBell } from './NotificationBell'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const allProjects = useStore(s => s.projects)
  const allSites = useStore(s => s.sites)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const projects = allProjects.filter(p => user.projectIds.includes(p.id) || user.role === 'MD')
  const sites = allSites.filter(si => si.projectId === selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const setSelectedProject = useStore(s => s.setSelectedProject)
  const setSelectedSite = useStore(s => s.setSelectedSite)
  const logout = useStore(s => s.logout)
  const [userMenu, setUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-3">
      <button onClick={onOpenMobileNav} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {projects.length > 0 && (
        <div className="hidden items-center gap-2 sm:flex">
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProject(e.target.value)}
            className="rounded-md border border-ink-300 bg-ink-50 px-2.5 py-1.5 text-sm font-medium text-ink-700 focus:border-brand-500 focus:outline-none"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
          </select>
          {sites.length > 0 && (
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSite(e.target.value)}
              className="hidden rounded-md border border-ink-300 bg-ink-50 px-2.5 py-1.5 text-sm font-medium text-ink-700 focus:border-brand-500 focus:outline-none md:block"
            >
              {sites.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
            </select>
          )}
        </div>
      )}

      <div className="hidden flex-1 justify-center md:flex">
        <GlobalSearch />
      </div>
      <div className="flex-1 md:hidden" />

      <NotificationBell />

      <div className="relative">
        <button onClick={() => setUserMenu(o => !o)} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-ink-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-none text-ink-800">{user.name}</span>
            <span className="block text-xs leading-none text-ink-400">{roleLabel(user.role)}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
        </button>
        {userMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-ink-800">{user.name}</p>
                <p className="text-xs text-ink-500">{user.employeeId} &middot; {roleLabel(user.role)}</p>
              </div>
              <button onClick={() => { setUserMenu(false); navigate('/profile') }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-ink-50">
                <UserIcon className="h-4 w-4" /> My Profile
              </button>
              <button onClick={() => { logout(); navigate('/login') }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
