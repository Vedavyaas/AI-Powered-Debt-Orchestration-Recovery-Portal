import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

const ROLES = ['FEDEX_ADMIN', 'DCA_MANAGER', 'DCA_AGENT']

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [role, setRole] = useState('DCA_AGENT')
  const [agencyId, setAgencyId] = useState('')
  const [query, setQuery] = useState('')

  const [email, setEmail] = useState('')
  const [newRole, setNewRole] = useState('DCA_AGENT')
  const [newAgencyId, setNewAgencyId] = useState('')

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
      <h2 style={{ marginTop: 10 }}>Admin Users</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row">
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.adminUsersList())}>List all</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.adminUsersCount())}>Counts</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">List by role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.adminUsersListByRole(role))}>Load</button>

            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">List by agency</label>
              <input className="input" value={agencyId} onChange={(e) => setAgencyId(e.target.value)} placeholder="AGENCY-001" />
            </div>
            <button className="button" type="button" disabled={loading || !agencyId.trim()} onClick={() => run(() => api.adminUsersListByAgency(agencyId.trim()))}>Load</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label className="label">Search users</label>
              <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="email or agency" />
            </div>
            <button className="button" type="button" disabled={loading || !query.trim()} onClick={() => run(() => api.adminUsersSearch(query.trim()))}>Search</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Update user</h3>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Role</label>
              <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button className="button" type="button" disabled={loading || !email.trim()} onClick={() => run(() => api.adminUsersUpdateRole({ email: email.trim(), role: newRole }))}>Update role</button>
          </div>

          <div className="row" style={{ alignItems: 'end', marginTop: 10 }}>
            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="label">Agency ID</label>
              <input className="input" value={newAgencyId} onChange={(e) => setNewAgencyId(e.target.value)} placeholder="AGENCY-001" />
            </div>
            <button className="button" type="button" disabled={loading || !email.trim() || !newAgencyId.trim()} onClick={() => run(() => api.adminUsersUpdateAgency({ email: email.trim(), agencyId: newAgencyId.trim() }))}>Update agency</button>
            <button className="button secondary" type="button" disabled={loading || !email.trim()} onClick={() => run(() => api.adminUsersDelete(email.trim()))}>Delete user</button>
          </div>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>

      <EvaluatorNotes page="Admin Users" />
    </div>
  )
}
