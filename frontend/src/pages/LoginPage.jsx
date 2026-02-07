import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api.js'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function LoginPage({ onLoggedIn }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(email.trim(), password)
      setToken(res?.token)
      await onLoggedIn?.()

      const from = location.state?.from
      navigate(from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card" style={{ marginTop: 60 }}>
        <h2 style={{ marginTop: 0, marginBottom: 6 }}>Sign in</h2>
        <div className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Use your account email and password.
        </div>



        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <Link className="muted" to="/signup">Create account</Link>
          <Link className="muted" to="/forgot-password">Forgot password?</Link>
        </div>
      </div>

      <EvaluatorNotes page="Login" />
    </div>
  )
}
