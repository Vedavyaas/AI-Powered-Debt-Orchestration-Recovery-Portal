import React, { useMemo, useState } from 'react'
import { api } from '../api.js'

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

function KeyValueCard({ title, value }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {value === null || value === undefined ? (
        <div className="muted">Not loaded</div>
      ) : isPlainObject(value) ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
            {Object.entries(value).map(([k, v]) => (
              <React.Fragment key={k}>
                <div className="muted" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{k}</div>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', wordBreak: 'break-word' }}>
                  {isPlainObject(v) || Array.isArray(v) ? <span className="muted">{describeComposite(v)}</span> : prettyScalar(v)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ wordBreak: 'break-word' }}>{prettyScalar(value)}</div>
      )}
    </div>
  )
}

function downloadText(filename, text, mime) {
  const blob = new Blob([text || ''], { type: mime || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState('')
  const [stage, setStage] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [minDaysOverdue, setMinDaysOverdue] = useState('')
  const [sortBy, setSortBy] = useState('amount')
  const [ascending, setAscending] = useState(false)
  const [includeInvestData, setIncludeInvestData] = useState(false)

  const [summary, setSummary] = useState(null)
  const [preview, setPreview] = useState(null)
  const [count, setCount] = useState(null)

  const filters = useMemo(() => {
    const f = {}
    if (status.trim()) f.status = status.trim()
    if (stage.trim()) f.stage = stage.trim()
    if (minAmount.trim()) f.minAmount = Number(minAmount)
    if (maxAmount.trim()) f.maxAmount = Number(maxAmount)
    if (minDaysOverdue.trim()) f.minDaysOverdue = Number(minDaysOverdue)
    f.sortBy = sortBy || 'amount'
    f.ascending = Boolean(ascending)
    return f
  }, [status, stage, minAmount, maxAmount, minDaysOverdue, sortBy, ascending])

  const run = async (fn) => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await fn()
    } catch (e) {
      setError(e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = () => run(async () => {
    const data = await api.exportSummary()
    setSummary(data)
  })

  const loadCount = () => run(async () => {
    const data = await api.exportCount(filters)
    setCount(data)
  })

  const loadPreview = () => run(async () => {
    const data = await api.exportAll(filters)
    setPreview(Array.isArray(data) ? data.slice(0, 20) : [])
  })

  const downloadCsv = () => run(async () => {
    const text = await api.exportCsv(filters)
    downloadText('export.csv', text, 'text/csv;charset=utf-8')
    setMessage('CSV downloaded')
  })

  const downloadJson = () => run(async () => {
    const text = await api.exportJson({ ...filters, includeInvestData })
    downloadText('export.json', text, 'application/json;charset=utf-8')
    setMessage('JSON downloaded')
  })

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Export</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}
      {message ? <div style={{ marginTop: 10 }}>{message}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Status</label>
              <input className="input" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="ASSIGNED" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Stage</label>
              <input className="input" value={stage} onChange={(e) => setStage(e.target.value)} placeholder="PENDING" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Min amount</label>
              <input className="input" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="10000" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Max amount</label>
              <input className="input" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="50000" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Min overdue days</label>
              <input className="input" value={minDaysOverdue} onChange={(e) => setMinDaysOverdue(e.target.value)} placeholder="30" />
            </div>
          </div>

          <div className="row" style={{ alignItems: 'end', marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Sort by</label>
              <input className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} placeholder="amount" />
            </div>
            <label className="row" style={{ alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={ascending} onChange={(e) => setAscending(e.target.checked)} />
              <span className="muted">Ascending</span>
            </label>
            <label className="row" style={{ alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={includeInvestData} onChange={(e) => setIncludeInvestData(e.target.checked)} />
              <span className="muted">Include invest data (JSON)</span>
            </label>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="button" type="button" disabled={loading} onClick={loadSummary}>Summary</button>
            <button className="button secondary" type="button" disabled={loading} onClick={loadCount}>Count</button>
            <button className="button secondary" type="button" disabled={loading} onClick={loadPreview}>Preview</button>
            <button className="button" type="button" disabled={loading} onClick={downloadCsv}>Download CSV</button>
            <button className="button" type="button" disabled={loading} onClick={downloadJson}>Download JSON</button>
          </div>
        </div>

        <KeyValueCard title="Summary" value={summary} />
        <KeyValueCard title="Count" value={count} />

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Preview (first 20)</h3>
          {!preview ? <div className="muted">Not loaded</div> : null}
          {preview && preview.length === 0 ? <div className="muted">No results</div> : null}
          {preview && preview.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {preview.map((c) => (
                <div key={c.invoiceNumber || `${c.customerName}-${c.amount}`}
                  style={{
                    borderRadius: 14,
                    padding: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--panel-solid)',
                    boxShadow: 'var(--shadow-inset)'
                  }}>
                  <div className="row">
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="muted">Invoice</div>
                      <div>{c.invoiceNumber || '—'}</div>
                    </div>
                    <div style={{ flex: 2, minWidth: 220 }}>
                      <div className="muted">Customer</div>
                      <div>{c.customerName || '—'}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div className="muted">Amount</div>
                      <div>{c.amount ?? '—'}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div className="muted">Days overdue</div>
                      <div>{c.daysOverdue ?? '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
