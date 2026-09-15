import { useMemo, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtDate } from '../../lib/utils'
import type { EquipmentLog } from '../../types'

const STATUSES: EquipmentLog['status'][] = ['IDLE', 'RUNNING', 'MAINTENANCE', 'BREAKDOWN']

export default function Equipment() {
  const user = useStore(s => s.currentUser!)
  const equipmentLogs = useStore(s => s.equipmentLogs)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const addEquipmentLog = useStore(s => s.addEquipmentLog)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const rows = useMemo(() => {
    if (user.role === 'MD') return equipmentLogs
    return equipmentLogs.filter(e => e.projectId === selectedProjectId)
  }, [equipmentLogs, selectedProjectId, user.role])

  const columns: Column<EquipmentLog>[] = [
    { key: 'name', header: 'Equipment', render: e => <span className="font-medium text-ink-800">{e.equipmentName}</span> },
    { key: 'type', header: 'Type', render: e => e.equipmentType },
    { key: 'date', header: 'Date', render: e => fmtDate(e.date), sortValue: e => e.date },
    { key: 'operator', header: 'Operator', render: e => e.operator },
    { key: 'hours', header: 'Hours Used', render: e => e.hoursUsed, hideBelow: 'sm' },
    { key: 'status', header: 'Status', render: e => <StatusBadge status={e.status} /> },
    { key: 'remarks', header: 'Remarks', render: e => e.remarks || '-', hideBelow: 'lg' },
  ]

  return (
    <div>
      <PageHeader
        title="Equipment Log"
        subtitle="Machinery usage, operator hours and status at site."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>Log Equipment Usage</Button>}
      />
      <DataTable
        columns={columns}
        data={rows}
        keyField={e => e.id}
        searchable
        searchPlaceholder="Search equipment, operator..."
        searchFields={e => `${e.equipmentName} ${e.equipmentType} ${e.operator}`}
        emptyMessage="No equipment usage logged yet."
      />

      <LogEquipmentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={data => {
          addEquipmentLog({ ...data, projectId: selectedProjectId, siteId: selectedSiteId })
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

function LogEquipmentDrawer({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Partial<EquipmentLog>) => void }) {
  const [equipmentName, setEquipmentName] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [operator, setOperator] = useState('')
  const [hoursUsed, setHoursUsed] = useState('0')
  const [status, setStatus] = useState<EquipmentLog['status']>('RUNNING')
  const [remarks, setRemarks] = useState('')

  function reset() {
    setEquipmentName(''); setEquipmentType(''); setDate(new Date().toISOString().slice(0, 10))
    setOperator(''); setHoursUsed('0'); setStatus('RUNNING'); setRemarks('')
  }

  function submit() {
    if (!equipmentName.trim()) return
    onCreate({ equipmentName: equipmentName.trim(), equipmentType: equipmentType.trim(), date: new Date(date).toISOString(), operator: operator.trim(), hoursUsed: Number(hoursUsed) || 0, status, remarks })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Log Equipment Usage"
      width="sm"
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!equipmentName.trim()}>Log</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Equipment Name"><input value={equipmentName} onChange={e => setEquipmentName(e.target.value)} className={inputCls} placeholder="e.g. Tower Crane TC-1" /></Field>
        <Field label="Equipment Type"><input value={equipmentType} onChange={e => setEquipmentType(e.target.value)} className={inputCls} placeholder="e.g. Crane" /></Field>
        <Field label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
        <Field label="Operator"><input value={operator} onChange={e => setOperator(e.target.value)} className={inputCls} /></Field>
        <Field label="Hours Used"><input type="number" value={hoursUsed} onChange={e => setHoursUsed(e.target.value)} className={inputCls} /></Field>
        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value as EquipmentLog['status'])} className={inputCls}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
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
