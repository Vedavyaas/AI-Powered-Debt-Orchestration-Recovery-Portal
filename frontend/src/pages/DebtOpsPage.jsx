import React, { useState } from 'react'
import { api } from '../api.js'
import ResultView from '../components/ResultView.jsx'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

const STATUSES = ['ASSIGNED', 'UN_ASSIGNED', 'ASSIGNED_AND_WAITING']

export default function DebtOpsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const [invoice, setInvoice] = useState('')
  const [minAmount, setMinAmount] = useState('10000')
  const [minDays, setMinDays] = useState('30')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchInvoice, setSearchInvoice] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchMinAmount, setSearchMinAmount] = useState('')
  const [searchMaxAmount, setSearchMaxAmount] = useState('')

  const [bulkInvoices, setBulkInvoices] = useState('')
  const [bulkStatus, setBulkStatus] = useState('UN_ASSIGNED')
  const [bulkAssignedTo, setBulkAssignedTo] = useState('')
  const [bulkStage, setBulkStage] = useState('PENDING')
  const [bulkAgentEmail, setBulkAgentEmail] = useState('')

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

  const parseInvoices = () => bulkInvoices
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)

  const buildSearchPayload = () => {
    const payload = {}
    if (searchCustomer.trim()) payload.customerName = searchCustomer.trim()
    if (searchInvoice.trim()) payload.invoiceNumber = searchInvoice.trim()
    if (searchStatus.trim()) payload.status = searchStatus.trim()
    if (searchMinAmount.trim()) payload.minAmount = Number(searchMinAmount)
    if (searchMaxAmount.trim()) payload.maxAmount = Number(searchMaxAmount)
    return payload
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Debt Ops</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Lookups</h3>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Invoice number</label>
              <input className="input" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="INV-000123" />
            </div>
            <button className="button" type="button" disabled={loading || !invoice.trim()} onClick={() => run(() => api.debtCase(invoice.trim()))}>Case</button>
            <button className="button secondary" type="button" disabled={loading || !invoice.trim()} onClick={() => run(() => api.debtCaseDetails(invoice.trim()))}>Details</button>
            <button className="button secondary" type="button" disabled={loading || !invoice.trim()} onClick={() => run(() => api.debtStatusHistory(invoice.trim()))}>Status history</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Search</h3>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">Customer</label>
              <input className="input" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Invoice</label>
              <input className="input" value={searchInvoice} onChange={(e) => setSearchInvoice(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Status (optional)</label>
              <select className="input" value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                <option value="">(any)</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ alignItems: 'end', marginTop: 10 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Min amount</label>
              <input className="input" value={searchMinAmount} onChange={(e) => setSearchMinAmount(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="label">Max amount</label>
              <input className="input" value={searchMaxAmount} onChange={(e) => setSearchMaxAmount(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.debtSearch(Object.keys(buildSearchPayload()).length ? buildSearchPayload() : null))}>Search</button>
            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.debtSearch(null))}>All</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Lists</h3>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">High value minAmount</label>
              <input className="input" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.debtHighValue({ minAmount: Number(minAmount) || 10000 }))}>High value</button>

            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Overdue minDays</label>
              <input className="input" value={minDays} onChange={(e) => setMinDays(e.target.value)} />
            </div>
            <button className="button" type="button" disabled={loading} onClick={() => run(() => api.debtOverdue({ minDays: Number(minDays) || 30 }))}>Overdue</button>

            <button className="button secondary" type="button" disabled={loading} onClick={() => run(() => api.debtStats())}>Stats</button>
          </div>

          <div className="row" style={{ alignItems: 'end', marginTop: 10 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Start date</label>
              <input className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="2026-01-01" />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">End date</label>
              <input className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="2026-01-31" />
            </div>
            <button className="button" type="button" disabled={loading || !startDate.trim() || !endDate.trim()} onClick={() => run(() => api.debtDateRange({ startDate: startDate.trim(), endDate: endDate.trim() }))}>Date range</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Bulk operations</h3>
          <label className="label">Invoice numbers (comma or newline separated)</label>
          <textarea
            className="input"
            style={{ minHeight: 100, resize: 'vertical' }}
            value={bulkInvoices}
            onChange={(e) => setBulkInvoices(e.target.value)}
            placeholder="INV-1\nINV-2\nINV-3"
          />
          <div className="muted" style={{ marginTop: 10 }}>Count: {parseInvoices().length}</div>

          <div className="row" style={{ alignItems: 'end', marginTop: 10 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">New status</label>
              <select className="input" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="label">Assigned to (optional)</label>
              <input className="input" value={bulkAssignedTo} onChange={(e) => setBulkAssignedTo(e.target.value)} placeholder="agent@example.com" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading || parseInvoices().length === 0}
              onClick={() => run(() => api.debtBulkStatus({ invoiceNumbers: parseInvoices(), newStatus: bulkStatus, assignedTo: bulkAssignedTo.trim() || null }))}
            >
              Bulk status
            </button>
          </div>

          <div className="row" style={{ alignItems: 'end', marginTop: 10 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="label">Stage</label>
              <input className="input" value={bulkStage} onChange={(e) => setBulkStage(e.target.value)} placeholder="PENDING" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading || parseInvoices().length === 0 || !bulkStage.trim()}
              onClick={() => run(() => api.debtBulkStage({ invoiceNumbers: parseInvoices(), stage: bulkStage.trim() }))}
            >
              Bulk stage
            </button>

            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="label">Assign to agent email</label>
              <input className="input" value={bulkAgentEmail} onChange={(e) => setBulkAgentEmail(e.target.value)} placeholder="agent@example.com" />
            </div>
            <button
              className="button"
              type="button"
              disabled={loading || parseInvoices().length === 0 || !bulkAgentEmail.trim()}
              onClick={() => run(() => api.debtBulkAssign({ invoiceNumbers: parseInvoices(), agentEmail: bulkAgentEmail.trim() }))}
            >
              Bulk assign
            </button>
          </div>
        </div>

        {data !== null ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <ResultView data={data} />
          </div>
        ) : null}
      </div>

      <EvaluatorNotes page="Debt Ops" />
    </div>
  )
}
