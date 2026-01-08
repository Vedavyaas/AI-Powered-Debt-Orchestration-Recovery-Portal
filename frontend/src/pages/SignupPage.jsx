import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

const ROLES = ['FEDEX_ADMIN', 'DCA_MANAGER', 'DCA_AGENT']

function isLikelySignupKey(text) {
  const s = String(text || '').trim()
  if (!s) return false
  // UUID (most common for signup keys)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true
  // Numeric OTP (e.g., 6 digits)
  if (/^\d{4,8}$/.test(s)) return true
  // Hex-like token
  if (/^[0-9a-f]{16,64}$/i.test(s)) return true
  return false
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('DCA_AGENT')
  const [agencyId, setAgencyId] = useState('')
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const onCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) return setError('Email is required')
    if (!password) return setError('Password is required')

    setLoadingCreate(true)
    try {
      const body = {
        email: trimmedEmail,
        password,
        role,
        agencyId: agencyId.trim() || null
      }

      const res = await api.signupCreateAccount(body)
      setMessage(typeof res === 'string' ? res : 'Account created')
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e?.message || 'Failed to create account')
    } finally {
      setLoadingCreate(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <div className="card" style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Create account</h2>
          <Link className="muted" to="/login">Back to sign in</Link>
        </div>

        <div className="card" style={{ padding: 14, borderStyle: 'dashed' }}>
          <h3 style={{ marginTop: 0 }}>Create</h3>
          <form onSubmit={onCreate}>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />

            <div style={{ marginTop: 12 }}>
              <label className="label">Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="label">Agency ID (optional)</label>
              <input className="input" value={agencyId} onChange={(e) => setAgencyId(e.target.value)} placeholder="Agency identifier" />
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="button" type="submit" disabled={loadingCreate}>
                {loadingCreate ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </form>
        </div>

        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
        {message ? <div style={{ marginTop: 12 }}>{message}</div> : null}
      </div>

      <EvaluatorNotes page="Signup" />
    </div>
  )
}
