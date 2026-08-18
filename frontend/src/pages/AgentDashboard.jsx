import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../services/api';
import {
  User, LogOut,
  Building, Mail, CheckCircle2, AlertCircle,
  Phone
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user, logout, setUser } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', company: '', email: '' });
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startEditProfile = () => {
    setProfileForm({ name: user?.name || '', company: user?.company || '', email: user?.email || '' });
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await agentService.updateSelf(user.id, profileForm.email);
      notify('Profile updated successfully');
      setUser(prev => ({ ...prev, ...profileForm }));
      setIsEditingProfile(false);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fade-up alert alert-${toast.type}`} style={{
          position: 'fixed', top: 70, right: 20, zIndex: 300,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', maxWidth: 360,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 24px rgba(100,130,180,0.18)'
        }}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Nav ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderBottom: '1px solid rgba(180,200,220,0.40)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.90), 0 4px 20px rgba(30,64,175,0.08)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.75)), linear-gradient(90deg, rgba(59,130,246,0.5) 0%, rgba(217,119,6,0.4) 50%, rgba(59,130,246,0.3) 100%)',
        backgroundSize: '100% calc(100% - 2px), 100% 2px',
        backgroundPosition: '0 0, 0 100%',
        backgroundRepeat: 'no-repeat',
        padding: '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={17} color="#1d4ed8" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--t1)', letterSpacing: '-0.01em' }}>
            DCA Management
          </span>
          <span className="badge badge-agent" style={{ marginLeft: 4 }}>Agent</span>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            title="My Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: '1px solid rgba(180,200,220,0.55)',
              background: 'rgba(255,255,255,0.80)',
              color: 'var(--t1)',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 8px rgba(100,130,180,0.12), inset 0 1px 0 white',
            }}
          >
            <User size={18} />
            <span>My Profile</span>
          </button>
        </div>

        {/* Logout */}
        <button
          className="btn btn-ghost"
          style={{ padding: '7px 14px', fontSize: '0.83rem', gap: 6 }}
          onClick={logout}
        >
          <LogOut size={15} /> Sign out
        </button>
      </nav>

      {/* ── Page content ── */}
      <div style={{ flex: 1, padding: '32px 28px', maxWidth: 900, width: '100%', margin: '0 auto', paddingTop: 88 }}>

        {/* ── Profile tab ── */}
        <div className="win fade-up" style={{ maxWidth: 460, margin: '0 auto' }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(180,200,220,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={15} color="#1d4ed8" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>My Profile</span>
            </div>
            {!isEditingProfile && (
              <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={startEditProfile}>
                Edit
              </button>
            )}
          </div>
          
          {isEditingProfile ? (
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="field">
                  <label>Username</label>
                  <input className="fi" style={{ paddingLeft: 14, opacity: 0.7, cursor: 'not-allowed' }} type="text"
                    value={profileForm.name} disabled />
                </div>
                <div className="field">
                  <label>Company</label>
                  <input className="fi" style={{ paddingLeft: 14 }} type="text" disabled={true}
                    value={profileForm.company} onChange={e => setProfileForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="fi" style={{ paddingLeft: 14 }} type="email"
                    value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Changes</button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Username', value: user?.name, icon: <User size={14} color="var(--t3)" /> },
                { label: 'Company',  value: user?.company || '—', icon: <Building size={14} color="var(--t3)" /> },
                { label: 'Email',    value: user?.email   || '—', icon: <Mail size={14} color="var(--t3)" /> },
                { label: 'Role',     value: 'Agent', icon: <Phone size={14} color="#1d4ed8" /> },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < 3 ? '1px solid rgba(180,200,220,0.20)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {row.icon}
                    <span style={{ fontSize: '0.82rem', color: 'var(--t2)', fontWeight: 500 }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--t1)', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
