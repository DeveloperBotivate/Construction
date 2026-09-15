import { useStore } from '../../store/useStore'
import MDDashboard from './MDDashboard'
import PMDashboard from './PMDashboard'
import AccountsDashboard from './AccountsDashboard'
import BillingDashboard from './BillingDashboard'
import ProcurementDashboard from './ProcurementDashboard'
import PEDashboard from './PEDashboard'
import StoreDashboardPage from '../store/StoreDashboardPage'
import VendorDashboard from './VendorDashboard'
import SubcontractorDashboard from './SubcontractorDashboard'
import type { Role } from '../../types'

const DASHBOARDS: Record<Role, React.ComponentType> = {
  MD: MDDashboard,
  PM: PMDashboard,
  ACCOUNTS: AccountsDashboard,
  BILLING: BillingDashboard,
  PROCUREMENT: ProcurementDashboard,
  PE: PEDashboard,
  STORE: StoreDashboardPage,
  VENDOR: VendorDashboard,
  SUBCONTRACTOR: SubcontractorDashboard,
}

export default function DashboardRouter() {
  const role = useStore(s => s.currentUser!.role)
  const Dashboard = DASHBOARDS[role]
  return <Dashboard />
}
