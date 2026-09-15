import { useState, type ReactNode } from 'react'
import { Plus, X, Eye } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Button, IconButton } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import type { ChecklistTemplate, ChecklistTemplateItem } from '../../types'

export default function ChecklistTemplates() {
  const checklistTemplates = useStore(s => s.checklistTemplates)
  const createChecklistTemplate = useStore(s => s.createChecklistTemplate)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewing, setViewing] = useState<ChecklistTemplate | null>(null)

  const columns: Column<ChecklistTemplate>[] = [
    { key: 'name', header: 'Name', render: t => <span className="font-medium text-ink-800">{t.name}</span> },
    { key: 'category', header: 'Category', render: t => t.category },
    { key: 'count', header: 'Items', render: t => t.items.length },
    { key: 'active', header: 'Active', render: t => t.active ? 'Yes' : 'No', hideBelow: 'sm' },
    { key: 'actions', header: 'Actions', render: t => <IconButton icon={<Eye className="h-4 w-4" />} title="View items" onClick={e => { e.stopPropagation(); setViewing(t) }} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Checklist Templates"
        subtitle="Reusable checklist definitions used to assign checklist instances."
        actions={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDrawerOpen(true)}>New Template</Button>}
      />
      <DataTable
        columns={columns}
        data={checklistTemplates}
        keyField={t => t.id}
        searchable
        searchPlaceholder="Search template name, category..."
        searchFields={t => `${t.name} ${t.category}`}
        emptyMessage="No checklist templates defined yet."
      />

      <NewTemplateDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={data => { createChecklistTemplate(data); setDrawerOpen(false) }} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ''} size="lg" footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}>
        {viewing && (
          <ul className="space-y-2">
            {viewing.items.map((it, i) => (
              <li key={it.id} className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2 text-sm">
                <span>{i + 1}. {it.question}</span>
                {it.required && <span className="text-xs font-medium text-red-500">required</span>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}

function NewTemplateDrawer({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: Partial<ChecklistTemplate>) => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState<{ question: string; required: boolean }[]>([{ question: '', required: true }])

  function reset() { setName(''); setCategory(''); setItems([{ question: '', required: true }]) }

  function submit() {
    const validItems = items.filter(i => i.question.trim())
    if (!name.trim() || validItems.length === 0) return
    const templateItems: ChecklistTemplateItem[] = validItems.map((i, idx) => ({ id: `i${idx + 1}`, question: i.question.trim(), required: i.required }))
    onCreate({ name: name.trim(), category: category.trim() || 'General', items: templateItems })
    reset()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); reset() }}
      title="New Checklist Template"
      footer={<>
        <Button variant="secondary" onClick={() => { onClose(); reset() }}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!name.trim() || items.every(i => !i.question.trim())}>Create Template</Button>
      </>}
    >
      <div className="space-y-4">
        <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
        <Field label="Category"><input value={category} onChange={e => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Safety, Quality, Store" /></Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-600">Checklist Items</label>
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setItems(rows => [...rows, { question: '', required: true }])}>Add item</Button>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={it.question}
                  onChange={e => setItems(rows => rows.map((r, i) => i === idx ? { ...r, question: e.target.value } : r))}
                  placeholder={`Question ${idx + 1}`}
                  className="flex-1 rounded-md border border-ink-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <label className="flex items-center gap-1 text-xs text-ink-500">
                  <input type="checkbox" checked={it.required} onChange={e => setItems(rows => rows.map((r, i) => i === idx ? { ...r, required: e.target.checked } : r))} className="rounded border-ink-300" />
                  Required
                </label>
                <IconButton icon={<X className="h-3.5 w-3.5" />} title="Remove item" onClick={() => setItems(rows => rows.filter((_, i) => i !== idx))} />
              </div>
            ))}
          </div>
        </div>
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
