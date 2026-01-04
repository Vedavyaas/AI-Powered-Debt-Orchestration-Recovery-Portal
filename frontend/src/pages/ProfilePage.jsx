import React, { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
                <label className="label">First name</label>
                <input className="input" value={profile.firstName || ''} onChange={(e) => updateField('firstName', e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Last name</label>
                <input className="input" value={profile.lastName || ''} onChange={(e) => updateField('lastName', e.target.value)} />
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label className="label">Title</label>
                <input className="input" value={profile.title || ''} onChange={(e) => updateField('title', e.target.value)} />
              </div>
            </div>

            {message ? <div style={{ marginTop: 12 }}>{message}</div> : null}

            <div style={{ marginTop: 12 }}>
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
