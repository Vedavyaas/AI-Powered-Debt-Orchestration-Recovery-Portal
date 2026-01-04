import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function AiPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [invoice, setInvoice] = useState('')
  const [batch, setBatch] = useState('')
  const [topLimit, setTopLimit] = useState('10')

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

  const invoicesFromText = () => {
    return batch
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>AI</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row">
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.aiHealth())}>Health</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.aiScoreStatistics())}>Score statistics</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.aiScoreAllUnassigned())}>Score all unassigned</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Score invoice</label>
              <input className="input" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="INV-000123" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading || !invoice.trim()}
              onClick={() => run(() => api.aiScore(invoice.trim()))}
            >
              Score
            </button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Top scored cases</label>
              <input className="input" value={topLimit} onChange={(e) => setTopLimit(e.target.value)} placeholder="10" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading}
              onClick={() => run(() => api.aiTopScores({ limit: Number(topLimit) || 10 }))}
            >
              Load
            </button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Batch score (invoice numbers; comma or newline separated)</label>
          <textarea
            className="input"
            style={{ minHeight: 110, resize: 'vertical' }}
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="INV-1\nINV-2\nINV-3"
          />
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="button"
              type="button"
              disabled={loading || invoicesFromText().length === 0}
              onClick={() => run(() => api.aiScoreBatch(invoicesFromText()))}
            >
              Score batch
            </button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => { setBatch(''); setData(null); setError('') }}>Clear</button>
          </div>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>

      <EvaluatorNotes page="AI" />
    </div>
  )
}
