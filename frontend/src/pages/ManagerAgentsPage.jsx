import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'

export default function ManagerAgentsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [email, setEmail] = useState('')

  const run = async (fn) => {
    setError('')
    setData(null)
    setLoading(true)
    try {
      const res = await fn()
      setData(res)
    } catch (e) {
      setError(e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Manager Agents</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row">
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.managerAgentsList())}>List</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.managerAgentsPerformance())}>Performance</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.managerAgentsWorkload())}>Workload</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label className="label">Agent email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@example.com" />
            </div>
            <button className="button" type="button" disabled={loading || !email.trim()} onClick={() => run(() => api.managerAgentsDetails(email.trim()))}>Details</button>
            <button className="button secondary" type="button" disabled={loading || !email.trim()} onClick={() => run(() => api.managerAgentsDeactivate(email.trim()))}>Deactivate</button>
            <button className="button secondary" type="button" disabled={loading || !email.trim()} onClick={() => run(() => api.managerAgentsActivate(email.trim()))}>Activate</button>
          </div>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
