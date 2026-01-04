import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

function StatCard({ title, value }) {
  return (
    <div className="card">
      <div className="muted" style={{ fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.dashboardStats()
        if (alive) setStats(data)
      } catch (e) {
        if (alive) setError(e?.message || 'Failed to load dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Dashboard</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {stats ? (
        <div className="grid">
          <StatCard title="Total cases" value={stats.totalCases} />
          <StatCard title="Pending cases" value={stats.pendingCases} />
          <StatCard title="Collected today" value={stats.collectedToday} />
          <StatCard title="Total agents" value={stats.totalAgents} />
          <StatCard title="Total managers" value={stats.totalManagers} />
          <StatCard title="Portfolio value" value={stats.totalPortfolioValue} />
        </div>
      ) : null}

      <EvaluatorNotes page="Dashboard" />
    </div>
  )
}
