import { Construction } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState message="This module is being wired up." icon={<Construction className="h-8 w-8" />} />
    </div>
  )
}
