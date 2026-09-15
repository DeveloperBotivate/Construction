import { CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { cls } from '../../lib/utils'

const STAGES = [
  { key: 'project', label: 'Project Creation' },
  { key: 'site', label: 'Site Setup' },
  { key: 'boq', label: 'BOQ Upload' },
  { key: 'drawing', label: 'Drawing Register' },
  { key: 'planning', label: 'Project Planning' },
  { key: 'execution', label: 'Site Execution' },
  { key: 'dpr', label: 'Daily Progress Reporting' },
  { key: 'attendance', label: 'Attendance Tracking' },
  { key: 'indent', label: 'Material Requirement / Indent' },
]

export default function PlanningPage() {
  const state = useStore()

  return (
    <div>
      <PageHeader title="Project Planning" subtitle="Stage-wise readiness across every active project" />
      <div className="space-y-4">
        {state.projects.map(project => {
          const sites = state.sites.filter(s => s.projectId === project.id)
          const boq = state.boqItems.filter(b => b.projectId === project.id)
          const drawings = state.drawings.filter(d => d.projectId === project.id)
          const dprs = state.dailyReports.filter(d => d.projectId === project.id)
          const attendance = state.attendance.filter(a => a.projectId === project.id)
          const indents = state.materialIndents.filter(i => i.projectId === project.id)

          const done: Record<string, boolean> = {
            project: true,
            site: sites.length > 0,
            boq: boq.length > 0,
            drawing: drawings.length > 0,
            planning: sites.length > 0 && boq.length > 0,
            execution: project.status === 'ACTIVE' || project.status === 'DELAYED',
            dpr: dprs.length > 0,
            attendance: attendance.length > 0,
            indent: indents.length > 0,
          }
          const completedCount = STAGES.filter(s => done[s.key]).length

          return (
            <Card key={project.id}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{project.code} - {project.name}</p>
                  <p className="text-xs text-ink-500">{completedCount}/{STAGES.length} stages reached</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage, i) => (
                  <div key={stage.key} className="flex items-center">
                    <span className={cls('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium', done[stage.key] ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500')}>
                      {done[stage.key] ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {stage.label}
                    </span>
                    {i < STAGES.length - 1 && <span className="mx-1 text-ink-300">&rarr;</span>}
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
