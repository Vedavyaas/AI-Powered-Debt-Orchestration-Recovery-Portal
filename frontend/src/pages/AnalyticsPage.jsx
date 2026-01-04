import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

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
      <h2 style={{ marginTop: 10 }}>Analytics</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <button className="button" type="button" disabled={loading} onClick={() => run(() => api.analyticsCollections())}>Collections stats</button>
          <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.analyticsAgentPerformance())}>Agent performance</button>
        </div>
      </div>

      {data !== null ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Result</h3>
          <ResultView data={data} />
        </div>
      ) : null}

      <EvaluatorNotes page="Analytics" />
    </div>
  )
}
