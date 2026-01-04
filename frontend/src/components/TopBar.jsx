import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'

export default function TopBar({ user }) {
  const navigate = useNavigate()

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
          <span className="brand-title">FedEx Nexus</span>
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
          <NavLink className={({ isActive }) => `navlink${isActive ? ' active' : ''}`} to="/profile">Profile</NavLink>
          <button className="button secondary" onClick={onLogout} type="button">Logout</button>
        </nav>
      </div>
    </header>
  )
}
