import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Send, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button, IconButton } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { fmtDate } from '../../lib/utils'
import type { DailyReport, MaterialUsageLine } from '../../types'

const SHIFTS = ['DAY', 'NIGHT'] as const

export default function DailyReportsList() {
  const navigate = useNavigate()
  const user = useStore(s => s.currentUser!)
  const dailyReports = useStore(s => s.dailyReports)
  const boqItems = useStore(s => s.boqItems)
  const materials = useStore(s => s.materials)
  const projects = useStore(s => s.projects)
  const sites = useStore(s => s.sites)
  const selectedProjectId = useStore(s => s.selectedProjectId)
  const selectedSiteId = useStore(s => s.selectedSiteId)
  const createDailyReport = useStore(s => s.createDailyReport)
  const submitDPR = useStore(s => s.submitDPR)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const canCreate = user.role === 'PE' || user.role === 'STORE'

  const rows = useMemo(() => {
    if (user.role === 'MD') return dailyReports
    return dailyReports.filter(d => d.projectId === selectedProjectId)
  }, [dailyReports, selectedProjectId, user.role])

  function projectSiteLabel(d: DailyReport) {
    const p = projects.find(pr => pr.id === d.projectId)
    const s = sites.find(st => st.id === d.siteId)
    return `${p?.code ?? d.projectId} / ${s?.name ?? d.siteId}`
  }

  const columns: Column<DailyReport>[] = [
    { key: 'dprNumber', header: 'DPR #', render: d => <span className="font-medium text-ink-800">{d.dprNumber}</span>, sortValue: d => d.dprNumber },
    { key: 'projSite', header: 'Project / Site', render: d => projectSiteLabel(d), hideBelow: 'md' },
    { key: 'date', header: 'Date', render: d => fmtDate(d.date), sortValue: d => d.date },
    { key: 'activity', header: 'Activity', render: d => <span className="line-clamp-1 max-w-xs">{d.activity}</span> },
    { key: 'qty', header: 'Today / Cumulative', render: d => `${d.todayQty} / ${d.cumulativeQty}`, hideBelow: 'sm' },
    { key: 'labour', header: 'Labour', render: d => d.labourCount, hideBelow: 'lg' },
    { key: 'status', header: 'Status', render: d => <StatusBadge status={d.status} /> },
    {
      key: 'actions', header: 'Actions', render: d => (
        <div className="flex items-center gap-1">
          <IconButton icon={<Eye className="h-4 w-4" />} title="View DPR" onClick={e => { e.stopPropagation(); navigate(`/dpr/${d.id}`) }} />
          {d.status === 'DRAFT' && d.preparedBy === user.id && (
            <IconButton icon={<Send className="h-4 w-4" />} title="Submit for PE review" onClick={e => { e.stopPropagation(); submitDPR(d.id) }} />
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Daily Progress Reports"
        subtitle="Site daily activity, manpower, materials and issue log."
        actions={
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            title={canCreate ? undefined : 'Only PE or STORE can create a Daily Report'}
            onClick={() => setDrawerOpen(true)}
          >
            Create DPR
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        keyField={d => d.id}
        searchable
        searchPlaceholder="Search DPR number, activity, work area..."
        searchFields={d => `${d.dprNumber} ${d.activity} ${d.workArea}`}
        onRowClick={d => navigate(`/dpr/${d.id}`)}
        emptyMessage="No daily reports found for the selected project."
      />

      <CreateDPRDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        boqItems={boqItems.filter(b => b.projectId === selectedProjectId)}
        materials={materials}
        onCreate={data => {
          createDailyReport({ ...data, projectId: selectedProjectId, siteId: selectedSiteId })
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

function CreateDPRDrawer({ open, onClose, boqItems, materials, onCreate }: {
  open: boolean
  onClose: () => void
  boqItems: { id: string; boqNumber: string; description: string; unit: string }[]
  materials: { id: string; name: string; unit: string }[]
  onCreate: (data: Partial<DailyReport>) => void
}) {
  const dailyReports = useStore(s => s.dailyReports)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [shift, setShift] = useState<'DAY' | 'NIGHT'>('DAY')
  const [weather, setWeather] = useState('')
  const [workArea, setWorkArea] = useState('')
  const [boqItemId, setBoqItemId] = useState('')
  const [activity, setActivity] = useState('')
  const [plannedQty, setPlannedQty] = useState('0')
  const [todayQty, setTodayQty] = useState('0')
  const [labourCount, setLabourCount] = useState('0')
  const [equipmentUsed, setEquipmentUsed] = useState('')
  const [materialsUsed, setMaterialsUsed] = useState<MaterialUsageLine[]>([])
  const [safetyIssues, setSafetyIssues] = useState('')
  const [siteIssues, setSiteIssues] = useState('')
  const [delayReason, setDelayReason] = useState('')
  const [drawingRef, setDrawingRef] = useState('')
  const [remarks, setRemarks] = useState('')

  function reset() {
    setDate(new Date().toISOString().slice(0, 10)); setShift('DAY'); setWeather(''); setWorkArea(''); setBoqItemId('')
    setActivity(''); setPlannedQty('0'); setTodayQty('0'); setLabourCount('0'); setEquipmentUsed('')
    setMaterialsUsed([]); setSafetyIssues(''); setSiteIssues(''); setDelayReason(''); setDrawingRef(''); setRemarks('')
  }

  function addMaterialRow() {
    const first = materials[0]
    if (!first) return
    setMaterialsUsed(rows => [...rows, { materialId: first.id, materialName: first.name, qty: 0, unit: first.unit }])
  }
  function updateMaterialRow(idx: number, materialId: string) {
    const mat = materials.find(m => m.id === materialId)
    if (!mat) return
    setMaterialsUsed(rows => rows.map((r, i) => i === idx ? { ...r, materialId: mat.id, materialName: mat.name, unit: mat.unit } : r))
  }
  function updateMaterialQty(idx: number, qty: number) {
    setMaterialsUsed(rows => rows.map((r, i) => i === idx ? { ...r, qty } : r))
  }
  function removeMaterialRow(idx: number) {
    setMaterialsUsed(rows => rows.filter((_, i) => i !== idx))
  }

  function submit() {
    if (!boqItemId || !activity.trim()) return
    const today = Number(todayQty) || 0
    const priorCumulative = dailyReports
      .filter(d => d.boqItemId === boqItemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.cumulativeQty ?? 0
    onCreate({
      date: new Date(date).toISOString(), shift, weather, workArea, boqItemId, activity,
      plannedQty: Number(plannedQty) || 0, todayQty: today, cumulativeQty: priorCumulative + today,
      labourCount: Number(labourCount) || 0,
      equipmentUsed: equipmentUsed.split(',').map(s => s.trim()).filter(Boolean),
      materialsUsed, safetyIssues, siteIssues, delayReason, drawingRef, photos: [], remarks,
    })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Create Daily Progress Report"
      subtitle="Recorded as Draft until submitted for PE review."
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!boqItemId || !activity.trim()} title={!boqItemId ? 'Select a BOQ item' : !activity.trim() ? 'Activity is required' : undefined}>Create Draft</Button>
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
          <Field label="Shift">
            <select value={shift} onChange={e => setShift(e.target.value as 'DAY' | 'NIGHT')} className={inputCls}>
              {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weather"><input value={weather} onChange={e => setWeather(e.target.value)} className={inputCls} placeholder="e.g. Clear" /></Field>
          <Field label="Work Area"><input value={workArea} onChange={e => setWorkArea(e.target.value)} className={inputCls} placeholder="e.g. Block A, Grid A1-A6" /></Field>
        </div>
        <Field label="BOQ Item">
          <select value={boqItemId} onChange={e => setBoqItemId(e.target.value)} className={inputCls}>
            <option value="">Select BOQ item...</option>
            {boqItems.map(b => <option key={b.id} value={b.id}>{b.boqNumber} - {b.description}</option>)}
          </select>
        </Field>
        <Field label="Activity"><input value={activity} onChange={e => setActivity(e.target.value)} className={inputCls} placeholder="e.g. Foundation Concrete Pour" /></Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Planned Qty"><input type="number" value={plannedQty} onChange={e => setPlannedQty(e.target.value)} className={inputCls} /></Field>
          <Field label="Today Qty"><input type="number" value={todayQty} onChange={e => setTodayQty(e.target.value)} className={inputCls} /></Field>
          <Field label="Labour Count"><input type="number" value={labourCount} onChange={e => setLabourCount(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Equipment Used (comma separated)"><input value={equipmentUsed} onChange={e => setEquipmentUsed(e.target.value)} className={inputCls} placeholder="e.g. Concrete Mixer M1, Vibrator V2" /></Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-600">Materials Used</label>
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={addMaterialRow} disabled={materials.length === 0}>Add material</Button>
          </div>
          <div className="space-y-2">
            {materialsUsed.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={row.materialId} onChange={e => updateMaterialRow(idx, e.target.value)} className={inputCls}>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="number" value={row.qty} onChange={e => updateMaterialQty(idx, Number(e.target.value) || 0)} className="w-24 rounded-md border border-ink-300 px-2 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                <span className="w-12 text-xs text-ink-500">{row.unit}</span>
                <IconButton icon={<X className="h-3.5 w-3.5" />} title="Remove" onClick={() => removeMaterialRow(idx)} />
              </div>
            ))}
            {materialsUsed.length === 0 && <p className="text-xs italic text-ink-400">No materials added yet.</p>}
          </div>
        </div>

        <Field label="Safety Issues"><textarea value={safetyIssues} onChange={e => setSafetyIssues(e.target.value)} rows={2} className={inputCls} /></Field>
        <Field label="Site Issues"><textarea value={siteIssues} onChange={e => setSiteIssues(e.target.value)} rows={2} className={inputCls} /></Field>
        <Field label="Delay Reason"><input value={delayReason} onChange={e => setDelayReason(e.target.value)} className={inputCls} /></Field>
        <Field label="Drawing Ref"><input value={drawingRef} onChange={e => setDrawingRef(e.target.value)} className={inputCls} placeholder="e.g. DRG-STR-001 Rev A" /></Field>
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
