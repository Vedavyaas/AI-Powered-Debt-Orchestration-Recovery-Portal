import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'

function money(v) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function CaseTable({ rows, selected, onToggle }) {
  if (!rows || rows.length === 0) return <div className="muted">No cases</div>

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
        <thead>
          <tr>
            <th className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)', width: 44 }}>
              Select
            </th>
            <th className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Invoice</th>
            <th className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Customer</th>
            <th className="muted" style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Service</th>
            <th className="muted" style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Amount</th>
            <th className="muted" style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Days overdue</th>
            <th className="muted" style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Past defaults</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const inv = r.invoiceNumber || ''
            const isChecked = !!(inv && selected.has(inv))
            return (
              <tr key={inv || `${r.customerName}-${r.amount}`}
                style={{ background: isChecked ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!inv}
                    onChange={() => inv && onToggle(inv)}
                  />
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{inv || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{r.customerName || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>{r.serviceType || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{money(r.amount)}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{r.daysOverdue ?? '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{r.pastDefaults ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function CsvUploadPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [file, setFile] = useState(null)
  const [rows, setRows] = useState([])

  const [agencyID, setAgencyID] = useState('')
  const [selected, setSelected] = useState(() => new Set())

  const selectedList = useMemo(() => Array.from(selected), [selected])

  const load = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const data = await api.csvList()
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load CSV cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (invoiceNumber) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(invoiceNumber)) next.delete(invoiceNumber)
      else next.add(invoiceNumber)
      return next
    })
  }

  const upload = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!file) {
      setError('Choose a CSV file')
      return
    }

    setLoading(true)
    try {
      const res = await api.csvUpload(file)
      setMessage(typeof res === 'string' ? res : 'Uploaded')
      setFile(null)
      await load()
    } catch (e) {
      setError(e?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const assign = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const agency = agencyID.trim()
    if (!agency) {
      setError('Enter agency ID')
      return
    }
    if (selectedList.length === 0) {
      setError('Select at least one invoice')
      return
    }

    setLoading(true)
    try {
      const res = await api.csvAssignToAgency({ agencyID: agency, invoiceNumber: selectedList })
      setMessage(typeof res === 'string' ? res : 'Assigned')
      setSelected(new Set())
    } catch (e) {
      setError(e?.message || 'Assignment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>CSV Upload</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}
      {message ? <div style={{ marginTop: 10 }}>{message}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <form onSubmit={upload}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <label className="label">CSV file</label>
                <input
                  className="input"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <button className="button" type="submit" disabled={loading}>Upload</button>
              <button className="button secondary" type="button" disabled={loading} onClick={load}>Reload</button>
            </div>
          </form>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <form onSubmit={assign}>
            <div className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Assign selected invoices to agency ID</label>
                <input className="input" value={agencyID} onChange={(e) => setAgencyID(e.target.value)} placeholder="AGENCY-001" />
              </div>
              <button className="button" type="submit" disabled={loading}>Assign</button>
              <button className="button secondary" type="button" disabled={loading} onClick={() => setSelected(new Set())}>Clear</button>
            </div>
            <div className="muted" style={{ marginTop: 10 }}>
              Selected: {selectedList.length}
            </div>
          </form>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Imported cases</h3>
          <CaseTable rows={rows} selected={selected} onToggle={toggle} />
        </div>
      </div>
    </div>
  )
}
