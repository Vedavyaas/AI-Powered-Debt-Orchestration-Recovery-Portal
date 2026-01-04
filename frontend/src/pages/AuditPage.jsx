import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'

function fmtTimestamp(ts) {
  if (!ts) return '—'
  try {
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return String(ts)
    return d.toLocaleString()
  } catch {
    return String(ts)
  }
}

function toIsoDateTime(value) {
  const v = (value || '').trim()
  if (!v) return ''
  // datetime-local is usually yyyy-MM-ddTHH:mm, backend accepts ISO_DATE_TIME
  return v.length === 16 ? `${v}:00` : v
}

function AuditTable({ items }) {
  if (!items || items.length === 0) return <div className="muted">No results</div>

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((row) => (
        <div
          key={row.id ?? `${row.timestamp}-${row.action}-${row.entityId}`}
          style={{
            borderRadius: 14,
            padding: 12,
            border: '1px solid var(--border)',
            background: 'var(--panel-solid)',
            boxShadow: 'var(--shadow-inset)'
          }}
        >
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Time</div>
              <div>{fmtTimestamp(row.timestamp)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">User</div>
              <div>{row.userEmail || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Action</div>
              <div>{row.action || '—'}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 10 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Entity</div>
              <div>{row.entityType || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Id</div>
              <div>{row.entityId || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Status</div>
              <div>{row.status || '—'}</div>
            </div>
          </div>
          {row.details ? (
            <div style={{ marginTop: 10 }}>
              <div className="muted">Details</div>
              <div style={{ wordBreak: 'break-word' }}>{row.details}</div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function AuditPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [myActivity, setMyActivity] = useState([])
  const [allPage, setAllPage] = useState(null)
  const [stats, setStats] = useState(null)

  const [statsHours, setStatsHours] = useState('24')
  const [allPageNum, setAllPageNum] = useState('0')
  const [allPageSize, setAllPageSize] = useState('50')

  const [userEmail, setUserEmail] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const [resultsTitle, setResultsTitle] = useState('My activity')
  const [results, setResults] = useState([])

  const actionCounts = useMemo(() => stats?.actionCounts || null, [stats])
  const entityTypeCounts = useMemo(() => stats?.entityTypeCounts || null, [stats])

  const loadMyActivity = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.auditMyActivity()
      setMyActivity(Array.isArray(data) ? data : [])
      setResultsTitle('My activity')
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  const loadAll = async () => {
    setError('')
    setLoading(true)
    try {
      const page = Number(allPageNum || 0)
      const size = Number(allPageSize || 50)
      const data = await api.auditAll({ page, size })
      setAllPage(data)
      setResultsTitle('All audit logs')
      setResults(Array.isArray(data?.content) ? data.content : [])
    } catch (e) {
      setError(e?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setError('')
    setLoading(true)
    try {
      const hours = Number(statsHours || 24)
      const data = await api.auditStats({ hours })
      setStats(data)
    } catch (e) {
      setError(e?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async (e) => {
    e.preventDefault()
    setError('')
    const email = userEmail.trim()
    if (!email) {
      setError('Enter an email')
      return
    }
    setLoading(true)
    try {
      const data = await api.auditUserActivity(email)
      setResultsTitle(`User activity: ${email}`)
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load user activity')
    } finally {
      setLoading(false)
    }
  }

  const loadEntity = async (e) => {
    e.preventDefault()
    setError('')
    const type = entityType.trim()
    const id = entityId.trim()
    if (!type || !id) {
      setError('Enter entity type and id')
      return
    }
    setLoading(true)
    try {
      const data = await api.auditEntityHistory(type, id)
      setResultsTitle(`Entity history: ${type}/${id}`)
      setResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load entity history')
    } finally {
      setLoading(false)
    }
  }

  const loadRange = async (e) => {
    e.preventDefault()
    setError('')
    const start = toIsoDateTime(rangeStart)
    const end = toIsoDateTime(rangeEnd)
    if (!start || !end) {
      setError('Select start and end')
      return
    }
    setLoading(true)
    try {
      const data = await api.auditRange({ start, end, page: 0, size: 100 })
      setResultsTitle('Activity range')
      setResults(Array.isArray(data?.content) ? data.content : [])
    } catch (e) {
      setError(e?.message || 'Failed to load range')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Audit</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="label">Stats window (hours)</label>
              <input className="input" value={statsHours} onChange={(e) => setStatsHours(e.target.value)} placeholder="24" />
            </div>
            <button className="button" type="button" onClick={loadStats} disabled={loading}>Load stats</button>
          </div>

          {stats ? (
            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ marginBottom: 6 }}>Action counts</div>
              <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(actionCounts, null, 2)}</pre>
              <div className="muted" style={{ marginTop: 12, marginBottom: 6 }}>Entity types</div>
              <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(entityTypeCounts, null, 2)}</pre>
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="label">All logs page</label>
              <input className="input" value={allPageNum} onChange={(e) => setAllPageNum(e.target.value)} placeholder="0" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="label">Size</label>
              <input className="input" value={allPageSize} onChange={(e) => setAllPageSize(e.target.value)} placeholder="50" />
            </div>
            <button className="button" type="button" onClick={loadAll} disabled={loading}>Load</button>
            <button className="button secondary" type="button" onClick={loadMyActivity} disabled={loading}>My activity</button>
          </div>

          {allPage ? (
            <div className="muted" style={{ marginTop: 10 }}>
              Total: {allPage.totalElements ?? '—'} | Page: {(allPage.number ?? 0) + 1} / {allPage.totalPages ?? '—'}
            </div>
          ) : null}
        </div>

        <div className="card">
          <form onSubmit={loadUser}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">User email</label>
                <input className="input" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="user@company.com" />
              </div>
              <button className="button" type="submit" disabled={loading}>Lookup</button>
            </div>
          </form>

          <form onSubmit={loadEntity} style={{ marginTop: 12 }}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="label">Entity type</label>
                <input className="input" value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder="DEBT_CASE" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="label">Entity id</label>
                <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="INV-000123" />
              </div>
              <button className="button" type="submit" disabled={loading}>History</button>
            </div>
          </form>

          <form onSubmit={loadRange} style={{ marginTop: 12 }}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="label">Start</label>
                <input className="input" type="datetime-local" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="label">End</label>
                <input className="input" type="datetime-local" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
              </div>
              <button className="button" type="submit" disabled={loading}>Range</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>{resultsTitle}</h3>
        <AuditTable items={results} />
      </div>
    </div>
  )
}
