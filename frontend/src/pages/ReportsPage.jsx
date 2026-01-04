import React, { useState } from 'react'
import { api } from '../api.js'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function describeComposite(v) {
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? '' : 's'}`
  if (isPlainObject(v)) return 'Object'
  return ''
}

function prettyScalar(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return Number.isFinite(v) ? v.toLocaleString() : String(v)
  return String(v)
}

function KeyValueGrid({ title, obj }) {
  if (!isPlainObject(obj)) return null
  const entries = Object.entries(obj)
  if (!entries.length) return <div className="muted">No data</div>

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {title ? <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }} className="muted">{title}</div> : null}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
        {entries.map(([k, v]) => (
          <React.Fragment key={k}>
            <div className="muted" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{k}</div>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', wordBreak: 'break-word' }}>
              {isPlainObject(v) || Array.isArray(v) ? <span className="muted">{describeComposite(v)}</span> : prettyScalar(v)}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function DataTable({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return <div className="muted">No results</div>

  const first = rows.find((r) => isPlainObject(r))
  if (!first) {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.slice(0, 50).map((r, idx) => (
          <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 10, background: 'var(--panel-solid)' }}>
            {prettyScalar(r)}
          </div>
        ))}
      </div>
    )
  }

  const columns = Object.keys(first).slice(0, 8)
  const displayRows = rows.slice(0, 50)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => {
                const v = r?.[c]
                const cell = isPlainObject(v) || Array.isArray(v) ? describeComposite(v) : prettyScalar(v)
                return (
                  <td key={c} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>{cell}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > displayRows.length ? (
        <div className="muted" style={{ padding: '10px 12px' }}>Showing first {displayRows.length} of {rows.length}</div>
      ) : null}
    </div>
  )
}

function ResultView({ value }) {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return <DataTable rows={value} />
  if (isPlainObject(value)) return <KeyValueGrid obj={value} />
  return <div style={{ wordBreak: 'break-word' }}>{prettyScalar(value)}</div>
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [data, setData] = useState(null)

  const [minAmount, setMinAmount] = useState('10000')
  const [minDays, setMinDays] = useState('30')

  const run = async (label, fn) => {
    setError('')
    setTitle(label)
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
      <h2 style={{ marginTop: 10 }}>Reports</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <button className="button" type="button" disabled={loading} onClick={() => run('Summary', () => api.reportsSummary())}>Summary</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run('By status', () => api.reportsByStatus())}>By status</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run('By stage', () => api.reportsByStage())}>By stage</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run('Collection trend', () => api.reportsCollectionTrend())}>Collection trend</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run('Trend analysis', () => api.reportsTrendAnalysis())}>Trend analysis</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run('Manager summary', () => api.reportsManagerSummary())}>Manager summary</button>
        </div>

        <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">High value min amount</label>
            <input className="input" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          </div>
          <button className="button" type="button" disabled={loading} onClick={() => run('High value cases', () => api.reportsHighValue({ minAmount: Number(minAmount || 10000) }))}>
            High value
          </button>

          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Overdue min days</label>
            <input className="input" value={minDays} onChange={(e) => setMinDays(e.target.value)} />
          </div>
          <button className="button" type="button" disabled={loading} onClick={() => run('Overdue cases', () => api.reportsOverdue({ minDays: Number(minDays || 30) }))}>
            Overdue
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>{title || 'Result'}</h3>
        {data === null ? <div className="muted">Pick a report</div> : <ResultView value={data} />}
      </div>

      <EvaluatorNotes page="Reports" />
    </div>
  )
}
