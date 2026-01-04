import React, { useState } from 'react'
import { api } from '../api.js'

export default function DebtSearchPage() {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onSearch = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    const inv = invoiceNumber.trim()
    if (!inv) {
      setError('Enter an invoice number')
      return
    }

    setLoading(true)
    try {
      const data = await api.debtFull(inv)
      if (!data) {
        setError('No case found')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Debt Search</h2>

      <div className="card">
        <form onSubmit={onSearch} className="row" style={{ alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label className="label">Invoice number</label>
            <input className="input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-000123" />
          </div>
          <button className="button" disabled={loading} type="submit">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
      </div>

      {result ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Case details</h3>
          <div className="row">
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Customer</div>
              <div>{result.customerName || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Invoice</div>
              <div>{result.invoiceNumber || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Amount</div>
              <div>{result.amount ?? '—'}</div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Status</div>
              <div>{result.status || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Stage</div>
              <div>{result.stage || '—'}</div>
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="muted">Assigned to</div>
              <div>{result.assignedTo || '—'}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted">Agent message</div>
            <div>{result.agentMessage || '—'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
