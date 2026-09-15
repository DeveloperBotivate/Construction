import { useMemo, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { KpiCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtCurrency } from '../../lib/utils'
import type { AttendanceRecord, AttendanceStatus } from '../../types'

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY']

function laborCost(a: AttendanceRecord): number {
  const overtime = a.overtimeHours > 0 ? (a.wageRate / 8) * a.overtimeHours * 1.5 : 0
  return a.wageRate + overtime
}

export default function Attendance() {
  const user = useStore(s => s.currentUser!)
  const attendance = useStore(s => s.attendance)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const addAttendance = useStore(s => s.addAttendance)

  const scoped = useMemo(() => {
    if (user.role === 'MD') return attendance
    return attendance.filter(a => a.projectId === selectedProjectId && a.siteId === selectedSiteId)
  }, [attendance, selectedProjectId, selectedSiteId, user.role])

  const mostRecentDate = useMemo(() => {
    return scoped.reduce((latest, a) => (!latest || a.date > latest ? a.date : latest), '')
  }, [scoped])

  const [dateFilter, setDateFilter] = useState(mostRecentDate ? mostRecentDate.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const categories = useMemo(() => Array.from(new Set(scoped.map(a => a.category))).sort(), [scoped])

  const filtered = useMemo(() => scoped.filter(a =>
    a.date.slice(0, 10) === dateFilter && (categoryFilter === 'ALL' || a.category === categoryFilter)
  ), [scoped, dateFilter, categoryFilter])

  const totalPresent = filtered.filter(a => a.status === 'PRESENT').length
  const totalCost = filtered.reduce((sum, a) => sum + laborCost(a), 0)

  const columns: Column<AttendanceRecord>[] = [
    { key: 'name', header: 'Name', render: a => <span className="font-medium text-ink-800">{a.personName}</span> },
    { key: 'category', header: 'Category', render: a => a.category },
    { key: 'status', header: 'Status', render: a => <StatusBadge status={a.status} /> },
    { key: 'in', header: 'In', render: a => a.inTime ?? '-', hideBelow: 'md' },
    { key: 'out', header: 'Out', render: a => a.outTime ?? '-', hideBelow: 'md' },
    { key: 'ot', header: 'OT (hrs)', render: a => a.overtimeHours, hideBelow: 'lg' },
    { key: 'wage', header: 'Wage Rate', render: a => fmtCurrency(a.wageRate), hideBelow: 'lg' },
    { key: 'cost', header: 'Cost (incl. OT)', render: a => fmtCurrency(laborCost(a)) },
    { key: 'remarks', header: 'Remarks', render: a => a.remarks || '-', hideBelow: 'lg' },
  ]

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Daily labour attendance and wage cost tracking."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>Add Attendance</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Present" value={totalPresent} sub={`of ${filtered.length} records`} tone="success" />
        <KpiCard label="Absent / Leave" value={filtered.filter(a => a.status === 'ABSENT' || a.status === 'LEAVE').length} tone="warning" />
        <KpiCard label="Total Labour Cost" value={fmtCurrency(totalCost)} sub="incl. 1.5x overtime" tone="brand" />
        <KpiCard label="Categories" value={categories.length} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Date</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="rounded-md border border-ink-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Category</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-md border border-ink-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField={a => a.id}
        searchable
        searchPlaceholder="Search by name..."
        searchFields={a => `${a.personName} ${a.category}`}
        emptyMessage="No attendance records for this date/category."
      />

      <AddAttendanceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={data => {
          addAttendance({ ...data, projectId: selectedProjectId, siteId: selectedSiteId })
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

function AddAttendanceDrawer({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Partial<AttendanceRecord>) => void }) {
  const [personName, setPersonName] = useState('')
  const [category, setCategory] = useState('')
  const [isEmployee, setIsEmployee] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [inTime, setInTime] = useState('08:00')
  const [outTime, setOutTime] = useState('18:00')
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT')
  const [overtimeHours, setOvertimeHours] = useState('0')
  const [wageRate, setWageRate] = useState('0')
  const [remarks, setRemarks] = useState('')

  function reset() {
    setPersonName(''); setCategory(''); setIsEmployee(false); setDate(new Date().toISOString().slice(0, 10))
    setInTime('08:00'); setOutTime('18:00'); setStatus('PRESENT'); setOvertimeHours('0'); setWageRate('0'); setRemarks('')
  }

  function submit() {
    if (!personName.trim() || !category.trim()) return
    onCreate({
      personName: personName.trim(), category: category.trim(), isEmployee, date: new Date(date).toISOString(),
      inTime, outTime, status, overtimeHours: Number(overtimeHours) || 0, wageRate: Number(wageRate) || 0, remarks,
    })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Add Attendance"
      width="sm"
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!personName.trim() || !category.trim()}>Add</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Person Name"><input value={personName} onChange={e => setPersonName(e.target.value)} className={inputCls} /></Field>
        <Field label="Category"><input value={category} onChange={e => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Mason, Helper" /></Field>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={isEmployee} onChange={e => setIsEmployee(e.target.checked)} className="rounded border-ink-300" />
          On company payroll (employee)
        </label>
        <Field label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="In Time"><input type="time" value={inTime} onChange={e => setInTime(e.target.value)} className={inputCls} /></Field>
          <Field label="Out Time"><input type="time" value={outTime} onChange={e => setOutTime(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value as AttendanceStatus)} className={inputCls}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Overtime Hours"><input type="number" value={overtimeHours} onChange={e => setOvertimeHours(e.target.value)} className={inputCls} /></Field>
          <Field label="Wage Rate (per day)"><input type="number" value={wageRate} onChange={e => setWageRate(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Remarks"><textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className={inputCls} /></Field>
      </div>
    </Drawer>
  )
}

const inputCls = 'w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}</label>
      {children}
    </div>
  )
}
