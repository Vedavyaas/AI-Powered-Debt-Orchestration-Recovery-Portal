import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/auth/LoginPage'
import DebtSearchPage from '@/pages/debt/DebtSearchPage'
import DebtCaseDetailsPage from '@/pages/debt/DebtCaseDetailsPage'
import AgentListPage from '@/pages/agent/AgentListPage'
import ReportsSummaryPage from '@/pages/reports/ReportsSummaryPage'
import BacklogPage from '@/pages/backlog/BacklogPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <AppLayout
              breadcrumbs={[{ label: 'Dashboard' }]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FX</span>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    FedEx Debt Management
                  </span>
                </div>
              }
            >
              <DashboardPage />
            </AppLayout>
          } />
          <Route path="/dashboard" element={
            <AppLayout
              breadcrumbs={[{ label: 'Dashboard' }]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FX</span>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    Dashboard
                  </span>
                </div>
              }
            >
              <DashboardPage />
            </AppLayout>
          } />
          <Route path="/debt/search" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Debt Management', href: '/debt/search' },
                { label: 'Search Cases' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">💰</span>
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                    Debt Case Search
                  </span>
                </div>
              }
            >
              <DebtSearchPage />
            </AppLayout>
          } />
          <Route path="/debt/details/:invoiceNumber" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Debt Management', href: '/debt/search' },
                { label: 'Case Details' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📋</span>
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent font-bold">
                    Case Details
                  </span>
                </div>
              }
            >
              <DebtCaseDetailsPage />
            </AppLayout>
          } />
          <Route path="/agents/list" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Agent Management' },
                { label: 'Agent List' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">👥</span>
                  </div>
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
                    Agent Management
                  </span>
                </div>
              }
            >
              <AgentListPage />
            </AppLayout>
          } />
          <Route path="/reports/summary" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports & Analytics' },
                { label: 'Summary Report' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📊</span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                    Reports & Analytics
                  </span>
                </div>
              }
            >
              <ReportsSummaryPage />
            </AppLayout>
          } />
          <Route path="/backlog/all" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Backlog' },
                { label: 'All Logs' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📝</span>
                  </div>
                  <span className="bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent font-bold">
                    System Backlog
                  </span>
                </div>
              }
            >
              <BacklogPage />
            </AppLayout>
          } />
          <Route path="/admin/users" element={
            <AppLayout
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Admin' },
                { label: 'User Management' }
              ]}
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">⚙️</span>
                  </div>
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-bold">
                    User Management
                  </span>
                </div>
              }
            >
              <AdminUsersPage />
            </AppLayout>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App