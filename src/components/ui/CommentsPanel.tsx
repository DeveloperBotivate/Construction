import { useState } from 'react'
import { Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { fmtDateTime } from '../../lib/utils'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

export function CommentsPanel({ recordType, recordId }: { recordType: string; recordId: string }) {
  const allComments = useStore(s => s.comments)
  const comments = allComments.filter(c => c.recordType === recordType && c.recordId === recordId)
  const addComment = useStore(s => s.addComment)
  const [text, setText] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) { addComment(recordType, recordId, text.trim()); setText('') } }}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-ink-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button variant="primary" size="sm" icon={<Send className="h-3.5 w-3.5" />} onClick={() => { if (text.trim()) { addComment(recordType, recordId, text.trim()); setText('') } }}>Post</Button>
      </div>
      {comments.length === 0 ? (
        <EmptyState message="No comments yet." />
      ) : (
        <ul className="space-y-3">
          {comments.slice().reverse().map(c => (
            <li key={c.id} className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-800">{c.userName}</span>
                <span className="text-xs text-ink-400">{fmtDateTime(c.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm text-ink-600">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
