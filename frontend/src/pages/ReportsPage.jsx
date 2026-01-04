import React, { useState } from 'react'
import { api } from '../api.js'

function JsonBlock({ value }) {
  if (value === null || value === undefined) return null
  return (
    <pre style={{ margin: 0, overflowX: 'auto' }}>
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  )
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
        {data === null ? <div className="muted">Pick a report</div> : <JsonBlock value={data} />}
      </div>
    </div>
  )
}
