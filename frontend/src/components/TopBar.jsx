import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'

export default function TopBar({ user }) {
  const navigate = useNavigate()
  const isAdmin = user?.role === 'FEDEX_ADMIN'

  const onLogout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore network/auth errors on logout
    } finally {
      clearToken()
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-title">FedEx Pheonix</span>
          {user?.email ? (
            <span className="badge">
              <span className="muted">{user.email}</span>
              {user.role ? <span>({user.role})</span> : null}
            </span>
          ) : null}
        </div>
        <nav className="nav">
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/debt-search">Debt Search</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/my-debts">My Debts</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/audit">Audit</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/reports">Reports</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/export">Export</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/csv-upload">CSV Upload</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/ai">AI</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/analytics">Analytics</NavLink>
          {isAdmin ? (
            <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/backlog">Backlog</NavLink>
          ) : null}
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/admin-users">Admin Users</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/manager-agents">Manager Agents</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/manager-tasks">Manager Tasks</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/debt-ops">Debt Ops</NavLink>
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/profile">Profile</NavLink>
          <button className="button secondary" onClick={onLogout} type="button">Logout</button>
        </nav>
      </div>
    </header>
  )
}
