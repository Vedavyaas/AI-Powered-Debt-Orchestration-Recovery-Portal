import React, { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { api, clearToken, getToken } from './api.js'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import TopBar from './components/TopBar.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DebtSearchPage from './pages/DebtSearchPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AuditPage from './pages/AuditPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import ExportPage from './pages/ExportPage.jsx'
import MyDebtsPage from './pages/MyDebtsPage.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)

  const refreshMe = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setChecked(true)
      return
    }

    try {
      const me = await api.me()
      setUser(me)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  if (!checked) {
    return <div className="container"><div className="muted">Starting…</div></div>
  }

  return (
    <>
      {getToken() ? <TopBar user={user} /> : null}
      <Routes>
        <Route path="/login" element={<LoginPage onLoggedIn={refreshMe} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/debt-search" element={<DebtSearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/my-debts" element={<MyDebtsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={getToken() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}
