import { useMemo, useState } from 'react'
import { Route as RouteIcon } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { buildIndentTrace } from '../../store/selectors'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { TraceabilityPanel } from '../../components/ui/TraceabilityPanel'
import { fmtCurrency, fmtNumber, fmtDate } from '../../lib/utils'

export default function TraceabilityPage() {
  const state = useStore()
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? '')
  const [materialId, setMaterialId] = useState('')
  const [indentId, setIndentId] = useState('')

  const matchingIndents = useMemo(
    () => state.materialIndents
      .filter(i => i.projectId === projectId && i.materialId === materialId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.materialIndents, projectId, materialId]
  )

  const resolvedIndentId = indentId || matchingIndents[0]?.id || ''
  const nodes = useMemo(() => resolvedIndentId ? buildIndentTrace(state, resolvedIndentId) : [], [state, resolvedIndentId])

  return (
    <div>
      <PageHeader title="Traceability" subtitle="Trace a material's full lifecycle from BOQ through indent, procurement, store and billing to payment." />

      <SectionCard title="Select Project &amp; Material" className="mb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Project</label>
            <select
              value={projectId}
              onChange={e => { setProjectId(e.target.value); setMaterialId(''); setIndentId('') }}
              className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a project</option>
              {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Material</label>
            <select
              value={materialId}
              onChange={e => { setMaterialId(e.target.value); setIndentId('') }}
              disabled={!projectId}
              className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50 disabled:text-ink-400"
            >
              <option value="">Select a material</option>
              {state.materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {matchingIndents.length > 1 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Indent (multiple found)</label>
              <select
                value={resolvedIndentId}
                onChange={e => setIndentId(e.target.value)}
                className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {matchingIndents.map(i => <option key={i.id} value={i.id}>{i.indentNumber} &mdash; {fmtDate(i.createdAt)} ({i.requiredQty} {i.unit})</option>)}
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      {!projectId || !materialId ? (
        <EmptyState message="Select a project and a material to trace its procurement chain." icon={<RouteIcon className="h-8 w-8" />} />
      ) : matchingIndents.length === 0 ? (
        <EmptyState message="No material indent has been raised for this material on this project yet — the procurement chain has not started." icon={<RouteIcon className="h-8 w-8" />} />
      ) : (
        <>
          <SectionCard title="Procurement Chain" className="mb-5">
            <TraceabilityPanel nodes={nodes} />
          </SectionCard>

          <SectionCard title="Stage Summary">
            <div className="overflow-x-auto rounded-lg border border-ink-200">
              <table className="min-w-full divide-y divide-ink-200 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Stage</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Record</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-ink-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {nodes.map(n => (
                    <tr key={n.stage}>
                      <td className="px-3 py-2 font-medium text-ink-800">{n.stage}</td>
                      <td className="px-3 py-2 text-ink-600">{n.label}</td>
                      <td className="px-3 py-2 text-ink-500">{n.status ?? '-'}</td>
                      <td className="px-3 py-2 text-ink-500">{n.qty !== undefined ? fmtNumber(n.qty) : '-'}</td>
                      <td className="px-3 py-2 text-ink-500">{n.amount !== undefined ? fmtCurrency(n.amount) : '-'}</td>
                      <td className="px-3 py-2 text-ink-500">{fmtDate(n.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
