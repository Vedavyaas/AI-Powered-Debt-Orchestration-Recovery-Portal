import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function ManagerTasksPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [agentEmail, setAgentEmail] = useState('')
  const [invoiceNumbers, setInvoiceNumbers] = useState('')

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

  const parseInvoices = () => invoiceNumbers
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)

  const onAssign = (e) => {
    e.preventDefault()
    const invoices = parseInvoices()
    if (!agentEmail.trim()) {
      setError('Enter agent email')
      return
    }
    if (invoices.length === 0) {
      setError('Enter at least one invoice')
      return
    }
    run(() => api.managerAssignDebt({ agentEmail: agentEmail.trim(), invoiceNumber: invoices }))
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Manager Tasks</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="row">
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.managerGetTasks())}>Get my tasks</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Assign debts</h3>
          <form onSubmit={onAssign}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <label className="label">Agent email</label>
                <input className="input" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} placeholder="agent@example.com" />
              </div>
              <button className="button" type="submit" disabled={loading}>Assign</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <label className="label">Invoice numbers (comma or newline separated)</label>
              <textarea
                className="input"
                style={{ minHeight: 110, resize: 'vertical' }}
                value={invoiceNumbers}
                onChange={(e) => setInvoiceNumbers(e.target.value)}
                placeholder="INV-1\nINV-2\nINV-3"
              />
              <div className="muted" style={{ marginTop: 10 }}>Count: {parseInvoices().length}</div>
            </div>
          </form>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>

      <EvaluatorNotes page="Manager Tasks" />
    </div>
  )
}
