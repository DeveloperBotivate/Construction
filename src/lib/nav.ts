import {
  LayoutDashboard, Building2, MapPin, ListChecks, FileText, CalendarRange, NotebookPen, Users, HardHat,
  Truck, AlertTriangle, PackageSearch, FileSearch, Quote, Scale, BadgeCheck, ShieldCheck, FileSignature,
  ArrowUpFromLine, Warehouse, PackageCheck, Boxes, BookOpen, PackageMinus, PackageX, ArrowLeftRight, ClipboardCheck,
  Wrench, ClipboardList, HandCoins, ScrollText, Receipt, Banknote, FileBarChart, Coins,
  FolderKanban, FileCheck2, Share2, CalendarX, RefreshCw, Landmark, Layers, PieChart, CheckSquare, ListTodo,
  CalendarCheck, Inbox, BarChart3, Route, TriangleAlert, Settings,
} from 'lucide-react'
import type { ModuleKey } from './permissions'

export interface NavItem { key: ModuleKey; label: string; path: string; icon: typeof LayoutDashboard }
export interface NavSection { title: string; items: NavItem[] }

export const NAV_SECTIONS: NavSection[] = [
  { title: 'Main', items: [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]},
  { title: 'Project Management', items: [
    { key: 'projects', label: 'Projects', path: '/projects', icon: Building2 },
    { key: 'sites', label: 'Sites', path: '/sites', icon: MapPin },
    { key: 'boq', label: 'BOQ', path: '/boq', icon: ListChecks },
    { key: 'drawings', label: 'Drawings', path: '/drawings', icon: FileText },
  ]},
  { title: 'Site Operations', items: [
    { key: 'dpr', label: 'Daily Reports', path: '/dpr', icon: NotebookPen },
    { key: 'attendance', label: 'Attendance', path: '/attendance', icon: Users },
    { key: 'labour', label: 'Labour', path: '/labour', icon: HardHat },
    { key: 'equipment', label: 'Equipment', path: '/equipment', icon: Wrench },
    { key: 'siteIssues', label: 'Site Issues', path: '/site-issues', icon: AlertTriangle },
  ]},
  { title: 'Procurement', items: [
    { key: 'indents', label: 'Material Indents', path: '/indents', icon: PackageSearch },
    { key: 'enquiries', label: 'Enquiries / RFQ', path: '/enquiries', icon: FileSearch },
    { key: 'quotations', label: 'Vendor Quotations', path: '/quotations', icon: Quote },
    { key: 'comparison', label: 'Vendor Comparison', path: '/vendor-comparison', icon: Scale },
    { key: 'techApproval', label: 'Technical Approval', path: '/technical-approval', icon: BadgeCheck },
    { key: 'mgmtApproval', label: 'Management Approval', path: '/management-approval', icon: ShieldCheck },
    { key: 'po', label: 'Purchase Orders', path: '/po', icon: FileSignature },
    { key: 'lifting', label: 'Lifting', path: '/lifting', icon: ArrowUpFromLine },
    { key: 'dispatch', label: 'Dispatch Tracking', path: '/dispatch', icon: Truck },
  ]},
  { title: 'Store', items: [
    { key: 'storeDashboard', label: 'Store Dashboard', path: '/store/dashboard', icon: Warehouse },
    { key: 'expectedDeliveries', label: 'Expected Deliveries', path: '/expected-deliveries', icon: PackageCheck },
    { key: 'grn', label: 'GRN / Store In', path: '/grn', icon: ClipboardCheck },
    { key: 'inventory', label: 'Inventory', path: '/inventory', icon: Boxes },
    { key: 'stockLedger', label: 'Stock Ledger', path: '/stock-ledger', icon: BookOpen },
    { key: 'storeIssue', label: 'Store Issue', path: '/store-issue', icon: PackageMinus },
    { key: 'storeReturn', label: 'Store Return', path: '/store-return', icon: PackageX },
    { key: 'stockTransfer', label: 'Stock Transfer', path: '/stock-transfer', icon: ArrowLeftRight },
    { key: 'stockAudit', label: 'Stock Audit', path: '/stock-audit', icon: FileBarChart },
  ]},
  { title: 'Subcontractor', items: [
    { key: 'subcontractors', label: 'Subcontractors', path: '/subcontractors', icon: HardHat },
    { key: 'workOrders', label: 'Work Orders', path: '/work-orders', icon: ClipboardList },
    { key: 'measurements', label: 'Measurements', path: '/measurements', icon: Layers },
    { key: 'subcontractorBills', label: 'Subcontractor Bills', path: '/subcontractor-bills', icon: Receipt },
  ]},
  { title: 'Billing', items: [
    { key: 'clients', label: 'Clients', path: '/clients', icon: Landmark },
    { key: 'contracts', label: 'Contracts', path: '/contracts', icon: ScrollText },
    { key: 'raBills', label: 'RA Bills', path: '/ra-bills', icon: FileCheck2 },
    { key: 'clientInvoices', label: 'Client Invoices', path: '/client-invoices', icon: Receipt },
    { key: 'receivables', label: 'Receivables', path: '/receivables', icon: HandCoins },
  ]},
  { title: 'Accounts', items: [
    { key: 'vendorBills', label: 'Vendor Bills', path: '/vendor-bills', icon: Receipt },
    { key: 'threeWayMatch', label: '3-Way Matching', path: '/three-way-match', icon: Scale },
    { key: 'freight', label: 'Freight', path: '/freight', icon: Truck },
    { key: 'debitNotes', label: 'Debit Notes', path: '/debit-notes', icon: FileText },
    { key: 'payments', label: 'Payments', path: '/payments', icon: Banknote },
    { key: 'expenses', label: 'Expenses', path: '/expenses', icon: Coins },
    { key: 'tally', label: 'Tally', path: '/tally', icon: PieChart },
  ]},
  { title: 'Documents', items: [
    { key: 'documents', label: 'Document Management', path: '/documents', icon: FolderKanban },
    { key: 'documentApproval', label: 'Document Approval', path: '/document-approval', icon: FileCheck2 },
    { key: 'documentExpiry', label: 'Document Expiry', path: '/document-expiry', icon: CalendarX },
  ]},
  { title: 'Subscriptions', items: [
    { key: 'subscriptions', label: 'Subscriptions', path: '/subscriptions', icon: RefreshCw },
  ]},
  { title: 'Loans', items: [
    { key: 'loans', label: 'Loans', path: '/loans', icon: Landmark },
  ]},
  { title: 'Task Management', items: [
    { key: 'checklist', label: 'Checklist', path: '/checklist', icon: CheckSquare },
    { key: 'checklistTemplates', label: 'Checklist Templates', path: '/checklist-templates', icon: ListTodo },
    { key: 'delegation', label: 'Delegation', path: '/delegation', icon: Share2 },
    { key: 'myTasks', label: 'My Tasks', path: '/my-tasks', icon: CalendarCheck },
  ]},
  { title: 'Approvals', items: [
    { key: 'approvals', label: 'Approval Center', path: '/approvals', icon: Inbox },
  ]},
  { title: 'Reports', items: [
    { key: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
    { key: 'traceability', label: 'Traceability', path: '/traceability', icon: Route },
    { key: 'exceptions', label: 'Exceptions', path: '/exceptions', icon: TriangleAlert },
  ]},
  { title: 'Admin', items: [
    { key: 'admin', label: 'Users & Settings', path: '/admin', icon: Settings },
  ]},
]
