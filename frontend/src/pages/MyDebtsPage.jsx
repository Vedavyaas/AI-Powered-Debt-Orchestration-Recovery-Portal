import React, { useEffect, useState } from 'react'
import { api } from '../api.js'

const STAGES = ['PENDING', 'IN_PROGRESS', 'DISPUTED', 'COLLECTED']

export default function MyDebtsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const [busyInvoice, setBusyInvoice] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api.agentGetDebts()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load debts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateLocal = (invoiceNumber, updater) => {
    setItems((prev) => prev.map((it) => {
      const inv = it?.caseEntity?.invoiceNumber
      if (inv !== invoiceNumber) return it
      return updater(it)
    }))
  }

  const onChangeStage = async (invoiceNumber, stage) => {
    setError('')
    setMessage('')
    setBusyInvoice(invoiceNumber)
    try {
      const res = await api.agentChangeStage({ invoiceNumber, stage })
      updateLocal(invoiceNumber, (it) => ({ ...it, stage }))
      setMessage(typeof res === 'string' ? res : 'Updated')
    } catch (e) {
      setError(e?.message || 'Failed to update stage')
    } finally {
      setBusyInvoice('')
    }
  }

  const onSaveMessage = async (invoiceNumber, msg) => {
    setError('')
    setMessage('')
    setBusyInvoice(invoiceNumber)
    try {
      const res = await api.agentChangeMessage({ invoiceNumber, message: msg })
      updateLocal(invoiceNumber, (it) => ({ ...it, message: msg }))
      setMessage(typeof res === 'string' ? res : 'Saved')
    } catch (e) {
      setError(e?.message || 'Failed to save message')
    } finally {
      setBusyInvoice('')
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>My Debts</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}
      {message ? <div style={{ marginTop: 10 }}>{message}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="muted">Items: {items.length}</div>
          <button className="button secondary" type="button" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {items.map((it) => {
          const c = it.caseEntity || {}
          const inv = c.invoiceNumber || ''
          const stage = it.stage || 'PENDING'
          const msg = it.message || ''

          return (
            <div key={inv || `${c.customerName}-${c.amount}`} className="card">
              <div className="row">
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="muted">Invoice</div>
                  <div style={{ fontWeight: 700 }}>{c.invoiceNumber || '—'}</div>
                </div>
                <div style={{ flex: 2, minWidth: 260 }}>
                  <div className="muted">Customer</div>
                  <div>{c.customerName || '—'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div className="muted">Amount</div>
                  <div>{c.amount ?? '—'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div className="muted">Overdue</div>
                  <div>{c.daysOverdue ?? '—'}</div>
                </div>
              </div>

              <div className="row" style={{ alignItems: 'end', marginTop: 12 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label className="label">Stage</label>
                  <select className="input" value={stage} onChange={(e) => onChangeStage(inv, e.target.value)} disabled={busyInvoice === inv}>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    {!STAGES.includes(stage) ? <option value={stage}>{stage}</option> : null}
                  </select>
                </div>

                <div style={{ flex: 3, minWidth: 260 }}>
                  <label className="label">Message</label>
                  <input
                    className="input"
                    value={msg}
                    onChange={(e) => updateLocal(inv, (x) => ({ ...x, message: e.target.value }))}
                    placeholder="Add a note"
                    disabled={busyInvoice === inv}
                  />
                </div>

                <button
                  className="button"
                  type="button"
                  disabled={busyInvoice === inv}
                  onClick={() => onSaveMessage(inv, msg)}
                >
                  Save
                </button>
              </div>
            </div>
          )
        })}

        {!loading && items.length === 0 ? (
          <div className="card">
            <div className="muted">No debts assigned</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
