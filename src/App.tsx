import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/auth/Login'
import { ComingSoon } from './pages/dashboards/ComingSoon'
import DashboardRouter from './pages/dashboards/DashboardRouter'

import ProjectsListPage from './pages/projects/ProjectsList'
import ProjectDetailPage from './pages/projects/ProjectDetail'
import SitesListPage from './pages/projects/SitesList'
import SiteDetailPage from './pages/projects/SiteDetail'
import PlanningPage from './pages/projects/Planning'
import BOQListPage from './pages/boq/BOQList'
import BOQDetailPage from './pages/boq/BOQDetail'
import DrawingRegisterPage from './pages/drawings/DrawingRegister'
import DrawingDetailPage from './pages/drawings/DrawingDetail'

import DailyReportsList from './pages/execution/DailyReportsList'
import DailyReportDetail from './pages/execution/DailyReportDetail'
import Attendance from './pages/execution/Attendance'
import Labour from './pages/execution/Labour'
import Equipment from './pages/execution/Equipment'
import SiteIssuesList from './pages/execution/SiteIssuesList'
import SiteIssueDetail from './pages/execution/SiteIssueDetail'

import ChecklistList from './pages/tasks/ChecklistList'
import ChecklistDetail from './pages/tasks/ChecklistDetail'
import ChecklistTemplates from './pages/tasks/ChecklistTemplates'
import DelegationList from './pages/tasks/DelegationList'
import DelegationDetail from './pages/tasks/DelegationDetail'
import MyTasks from './pages/tasks/MyTasks'

import IndentsList from './pages/procurement/IndentsList'
import IndentDetail from './pages/procurement/IndentDetail'
import EnquiriesList from './pages/procurement/EnquiriesList'
import EnquiryDetail from './pages/procurement/EnquiryDetail'
import VendorQuotationsList from './pages/procurement/VendorQuotationsList'
import VendorComparison from './pages/procurement/VendorComparison'
import TechnicalApproval from './pages/procurement/TechnicalApproval'
import ManagementApproval from './pages/procurement/ManagementApproval'
import PurchaseOrdersList from './pages/procurement/PurchaseOrdersList'
import PODetail from './pages/procurement/PODetail'
import Lifting from './pages/procurement/Lifting'
import DispatchList from './pages/procurement/DispatchList'
import DispatchDetail from './pages/procurement/DispatchDetail'

import StoreDashboardPage from './pages/store/StoreDashboardPage'
import ExpectedDeliveries from './pages/store/ExpectedDeliveries'
import GRNList from './pages/store/GRNList'
import GRNDetail from './pages/store/GRNDetail'
import Inventory from './pages/store/Inventory'
import StockLedger from './pages/store/StockLedger'
import StoreIssueList from './pages/store/StoreIssueList'
import StoreReturnList from './pages/store/StoreReturnList'
import StockTransfer from './pages/store/StockTransfer'
import StockAuditList from './pages/store/StockAuditList'

import SubcontractorsList from './pages/subcontractors/SubcontractorsList'
import WorkOrdersList from './pages/subcontractors/WorkOrdersList'
import WorkOrderDetail from './pages/subcontractors/WorkOrderDetail'
import MeasurementsList from './pages/subcontractors/MeasurementsList'
import MeasurementDetail from './pages/subcontractors/MeasurementDetail'
import SubcontractorBillsList from './pages/subcontractors/SubcontractorBillsList'
import SubcontractorBillDetail from './pages/subcontractors/SubcontractorBillDetail'

import ClientsList from './pages/billing/ClientsList'
import ContractsList from './pages/billing/ContractsList'
import RABillsList from './pages/billing/RABillsList'
import RABillDetail from './pages/billing/RABillDetail'
import ClientInvoices from './pages/billing/ClientInvoices'
import Receivables from './pages/billing/Receivables'

import VendorBillsList from './pages/accounts/VendorBillsList'
import VendorBillDetail from './pages/accounts/VendorBillDetail'
import ThreeWayMatch from './pages/accounts/ThreeWayMatch'
import FreightList from './pages/accounts/FreightList'
import DebitNotesList from './pages/accounts/DebitNotesList'
import DebitNoteDetail from './pages/accounts/DebitNoteDetail'
import PaymentsList from './pages/accounts/PaymentsList'
import PaymentDetail from './pages/accounts/PaymentDetail'
import Expenses from './pages/accounts/Expenses'
import Tally from './pages/accounts/Tally'

import DocumentsList from './pages/documents/DocumentsList'
import DocumentApproval from './pages/documents/DocumentApproval'
import DocumentExpiry from './pages/documents/DocumentExpiry'
import SubscriptionsList from './pages/subscriptions/SubscriptionsList'
import LoansList from './pages/loans/LoansList'
import LoanDetail from './pages/loans/LoanDetail'

import ApprovalCenter from './pages/approvals/ApprovalCenter'
import Reports from './pages/reports/Reports'
import TraceabilityPage from './pages/traceability/TraceabilityPage'
import ExceptionsPage from './pages/exceptions/ExceptionsPage'
import UsersAdmin from './pages/admin/UsersAdmin'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />

          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/sites" element={<SitesListPage />} />
          <Route path="/sites/:id" element={<SiteDetailPage />} />
          <Route path="/boq" element={<BOQListPage />} />
          <Route path="/boq/:id" element={<BOQDetailPage />} />
          <Route path="/drawings" element={<DrawingRegisterPage />} />
          <Route path="/drawings/:id" element={<DrawingDetailPage />} />
          <Route path="/planning" element={<PlanningPage />} />

          <Route path="/dpr" element={<DailyReportsList />} />
          <Route path="/dpr/:id" element={<DailyReportDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/labour" element={<Labour />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/site-issues" element={<SiteIssuesList />} />
          <Route path="/site-issues/:id" element={<SiteIssueDetail />} />

          <Route path="/checklist" element={<ChecklistList />} />
          <Route path="/checklist/:id" element={<ChecklistDetail />} />
          <Route path="/checklist-templates" element={<ChecklistTemplates />} />
          <Route path="/delegation" element={<DelegationList />} />
          <Route path="/delegation/:id" element={<DelegationDetail />} />
          <Route path="/my-tasks" element={<MyTasks />} />

          <Route path="/indents" element={<IndentsList />} />
          <Route path="/indents/:id" element={<IndentDetail />} />
          <Route path="/enquiries" element={<EnquiriesList />} />
          <Route path="/enquiries/:id" element={<EnquiryDetail />} />
          <Route path="/quotations" element={<VendorQuotationsList />} />
          <Route path="/vendor-comparison" element={<VendorComparison />} />
          <Route path="/technical-approval" element={<TechnicalApproval />} />
          <Route path="/management-approval" element={<ManagementApproval />} />
          <Route path="/po/new" element={<PurchaseOrdersList />} />
          <Route path="/po" element={<PurchaseOrdersList />} />
          <Route path="/po/:id" element={<PODetail />} />
          <Route path="/lifting" element={<Lifting />} />
          <Route path="/dispatch" element={<DispatchList />} />
          <Route path="/dispatch/:id" element={<DispatchDetail />} />

          <Route path="/store/dashboard" element={<StoreDashboardPage />} />
          <Route path="/expected-deliveries" element={<ExpectedDeliveries />} />
          <Route path="/grn" element={<GRNList />} />
          <Route path="/grn/:id" element={<GRNDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stock-ledger" element={<StockLedger />} />
          <Route path="/store-issue" element={<StoreIssueList />} />
          <Route path="/store-return" element={<StoreReturnList />} />
          <Route path="/stock-transfer" element={<StockTransfer />} />
          <Route path="/stock-audit" element={<StockAuditList />} />

          <Route path="/subcontractors" element={<SubcontractorsList />} />
          <Route path="/work-orders" element={<WorkOrdersList />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
          <Route path="/measurements" element={<MeasurementsList />} />
          <Route path="/measurements/:id" element={<MeasurementDetail />} />
          <Route path="/subcontractor-bills" element={<SubcontractorBillsList />} />
          <Route path="/subcontractor-bills/:id" element={<SubcontractorBillDetail />} />

          <Route path="/clients" element={<ClientsList />} />
          <Route path="/contracts" element={<ContractsList />} />
          <Route path="/ra-bills" element={<RABillsList />} />
          <Route path="/ra-bills/:id" element={<RABillDetail />} />
          <Route path="/client-invoices" element={<ClientInvoices />} />
          <Route path="/receivables" element={<Receivables />} />

          <Route path="/vendor-bills" element={<VendorBillsList />} />
          <Route path="/vendor-bills/:id" element={<VendorBillDetail />} />
          <Route path="/three-way-match" element={<ThreeWayMatch />} />
          <Route path="/freight" element={<FreightList />} />
          <Route path="/debit-notes" element={<DebitNotesList />} />
          <Route path="/debit-notes/:id" element={<DebitNoteDetail />} />
          <Route path="/payments" element={<PaymentsList />} />
          <Route path="/payments/:id" element={<PaymentDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tally" element={<Tally />} />

          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/document-approval" element={<DocumentApproval />} />
          <Route path="/document-expiry" element={<DocumentExpiry />} />
          <Route path="/subscriptions" element={<SubscriptionsList />} />
          <Route path="/loans" element={<LoansList />} />
          <Route path="/loans/:id" element={<LoanDetail />} />

          <Route path="/approvals" element={<ApprovalCenter />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/admin" element={<UsersAdmin />} />

          <Route path="/profile" element={<ComingSoon title="My Profile" />} />
          <Route path="*" element={<ComingSoon title="Page not found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
