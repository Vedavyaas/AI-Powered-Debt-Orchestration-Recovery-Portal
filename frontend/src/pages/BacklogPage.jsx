import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function BacklogPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [page, setPage] = useState('0')
  const [size, setSize] = useState('20')
  const [hours, setHours] = useState('24')

  const [userEmail, setUserEmail] = useState('')
  const [module, setModule] = useState('')
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [id, setId] = useState('')

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

  const num = (v, fallback) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Backlog</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="label">Page</label>
              <input className="input" value={page} onChange={(e) => setPage(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="label">Size</label>
              <input className="input" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.backlogAll({ page: num(page, 0), size: num(size, 20) }))}>Get all</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.backlogFailed({ page: num(page, 0), size: num(size, 20) }))}>Failed</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Hours</label>
              <input className="input" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.backlogSummary({ hours: num(hours, 24) }))}>Summary</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.backlogModuleStats({ hours: num(hours, 24) }))}>Module stats</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.backlogActionStats({ hours: num(hours, 24) }))}>Action stats</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 2, minWidth: 260 }}>
              <label className="label">User email</label>
              <input className="input" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <button className="button" type="button" disabled={loading || !userEmail.trim()} onClick={() => run(() => api.backlogByUser(userEmail.trim()))}>By user</button>
            <button className="button secondary" type="button" disabled={loading || !userEmail.trim()} onClick={() => run(() => api.backlogUserRecent({ userEmail: userEmail.trim(), hours: num(hours, 24) }))}>User recent</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Module</label>
              <input className="input" value={module} onChange={(e) => setModule(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading || !module.trim()} onClick={() => run(() => api.backlogByModule(module.trim()))}>By module</button>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Action</label>
              <input className="input" value={action} onChange={(e) => setAction(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading || !action.trim()} onClick={() => run(() => api.backlogByAction(action.trim()))}>By action</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Entity type</label>
              <input className="input" value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder="DebtCaseEntity" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Entity id</label>
              <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="123" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading || !entityType.trim() || !entityId.trim()}
              onClick={() => run(() => api.backlogByEntity({ entityType: entityType.trim(), entityId: entityId.trim() }))}
            >
              By entity
            </button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Range / search (ISO-8601 timestamps)</label>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Start</label>
              <input className="input" value={start} onChange={(e) => setStart(e.target.value)} placeholder="2026-01-04T00:00:00" />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">End</label>
              <input className="input" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="2026-01-04T23:59:59" />
            </div>
            <button className="button" type="button" disabled={loading || !start.trim() || !end.trim()} onClick={() => run(() => api.backlogRange({ start: start.trim(), end: end.trim(), page: num(page, 0), size: num(size, 20) }))}>Range</button>
            <button className="button secondary" type="button" disabled={loading || !start.trim() || !end.trim()} onClick={() => run(() => api.backlogSearch({ module: module.trim() || undefined, action: action.trim() || undefined, userEmail: userEmail.trim() || undefined, start: start.trim(), end: end.trim(), page: num(page, 0), size: num(size, 20) }))}>Search</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Get by ID</label>
              <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="1" />
            </div>
            <button className="button" type="button" disabled={loading || !id.trim()} onClick={() => run(() => api.backlogById(id.trim()))}>Load</button>
          </div>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>

      <EvaluatorNotes page="Backlog" />
    </div>
  )
}
