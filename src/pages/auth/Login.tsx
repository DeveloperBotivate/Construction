import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

const DEMO_ACCOUNTS: { id: string; pass: string; role: string; name: string }[] = [
  { id: 'MD001', pass: 'MD@123', role: 'Managing Director', name: 'Rajesh Agarwal' },
  { id: 'PM001', pass: 'PM@123', role: 'Project Manager', name: 'Suresh Nair' },
  { id: 'ACC001', pass: 'ACC@123', role: 'Accounts Manager', name: 'Priya Menon' },
  { id: 'BILL001', pass: 'BILL@123', role: 'Billing & Liaison Engineer', name: 'Anita Rao' },
  { id: 'PROC001', pass: 'PROC@123', role: 'Procurement Executive', name: 'Vikram Singh' },
  { id: 'PE001', pass: 'PE@123', role: 'Project Engineer', name: 'Arjun Verma' },
  { id: 'STORE001', pass: 'STORE@123', role: 'Store Keeper / Supervisor', name: 'Deepak Chauhan' },
  { id: 'VENDOR001', pass: 'VENDOR@123', role: 'Vendor', name: 'Ramesh Gupta' },
  { id: 'SUB001', pass: 'SUB@123', role: 'Subcontractor', name: 'Manoj Tiwari' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login = useStore(s => s.login)
  const [idOrEmail, setIdOrEmail] = useState(DEMO_ACCOUNTS[0].id)
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].pass)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = login(idOrEmail.trim(), password)
    if (!result.ok) { setError(result.error ?? 'Login failed.'); return }
    navigate('/dashboard')
  }

  function useDemo(acc: typeof DEMO_ACCOUNTS[number]) {
    setIdOrEmail(acc.id)
    setPassword(acc.pass)
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-100">
      <div className="w-full max-w-md rounded-xl bg-white px-6 py-10 shadow-lg sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-ink-900">Construction ERP</h1>
              <p className="text-xs leading-tight text-ink-500">Project, Procurement, Store, Site &amp; Finance Management</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Employee ID / Email</label>
              <input
                value={idOrEmail}
                onChange={e => setIdOrEmail(e.target.value)}
                placeholder="e.g. PM001 or pm@constructionerp.demo"
                autoComplete="username"
                className="w-full rounded-md border border-ink-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-ink-300 px-3 py-2.5 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-600">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-ink-300" />
                Remember Me
              </label>
              <button type="button" onClick={() => setForgotOpen(true)} className="font-medium text-brand-600 hover:underline">Forgot Password?</button>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Demo Account</label>
              <select
                value={DEMO_ACCOUNTS.find(a => a.id === idOrEmail) ? idOrEmail : ""}
                onChange={e => {
                  const acc = DEMO_ACCOUNTS.find(a => a.id === e.target.value)
                  if (acc) useDemo(acc)
                }}
                className="w-full rounded-md border border-ink-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="" disabled>Select an account</option>
                {DEMO_ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.role} ({acc.name})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full justify-center py-2.5">Login</Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-400">Role and permissions are determined automatically from your account. Role selection at login is not permitted.</p>
        </div>
      </div>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Forgot Password" footer={<Button variant="primary" onClick={() => setForgotOpen(false)}>Close</Button>}>
        <p className="text-sm text-ink-600">This is a prototype environment. In production this would trigger an OTP/2FA-verified password reset email to your registered address. Please use one of the demo accounts shown on the login screen.</p>
      </Modal>
    </div>
  )
}
