import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [agencyID, setAgencyID] = useState('')
  const [accountBusy, setAccountBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.profileGet()
        if (alive) setProfile(data)
      } catch (e) {
        if (alive) setError(e?.message || 'Failed to load profile')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const updateField = (key, value) => {
    setProfile((p) => ({ ...(p || {}), [key]: value }))
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const res = await api.profileUpdate(profile)
      setMessage(typeof res === 'string' ? res : 'Saved')
    } catch (e) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onChangeAgency = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const value = agencyID.trim()
    if (!value) {
      setError('Enter an agency ID')
      return
    }
    setAccountBusy(true)
    try {
      const res = await api.changeAgencyId(value)
      setMessage(typeof res === 'string' ? res : 'Updated')
    } catch (e) {
      setError(e?.message || 'Update failed')
    } finally {
      setAccountBusy(false)
    }
  }

  const onDeleteAccount = async () => {
    setError('')
    setMessage('')
    const ok = window.confirm('Delete account? This cannot be undone.')
    if (!ok) return

    setAccountBusy(true)
    try {
      const res = await api.deleteAccount()
      clearToken()
      setMessage(typeof res === 'string' ? res : 'Account deleted')
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e?.message || 'Delete failed')
    } finally {
      setAccountBusy(false)
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 10 }}>Profile</h2>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {profile ? (
        <div className="card">
          <form onSubmit={onSave}>
            <div className="row">
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Email</label>
                <input className="input" value={profile.email || ''} readOnly />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Role</label>
                <input className="input" value={profile.role || ''} readOnly />
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
            </div>

            {message ? <div style={{ marginTop: 12 }}>{message}</div> : null}

            <div style={{ marginTop: 12 }}>
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Account</h3>
            <form onSubmit={onChangeAgency} className="row" style={{ alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Agency ID</label>
                <input className="input" value={agencyID} onChange={(e) => setAgencyID(e.target.value)} placeholder="Enter agency ID" />
              </div>
              <button className="button secondary" type="submit" disabled={accountBusy}>Change</button>
            </form>

            <div style={{ marginTop: 12 }}>
              <button className="button" type="button" disabled={accountBusy} onClick={onDeleteAccount}>
                Delete account
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
