import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentService, assignmentService } from '../services/api';
import {
  User, LogOut,
  Building, Mail, CheckCircle2, AlertCircle,
  Phone, Wallet, Edit2, ChevronLeft
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user, logout, setUser } = useAuth();
  
  const [tab, setTab] = useState('debts'); // 'profile' or 'debts'
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', company: '', email: '' });
  const [toast, setToast] = useState(null);

  // Debts State
  const [debts, setDebts] = useState([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [debtPage, setDebtPage] = useState(0);
  const [debtTotalPages, setDebtTotalPages] = useState(1);
  const [selectedDebt, setSelectedDebt] = useState(null); // When a debt is selected for details
  const [statusForm, setStatusForm] = useState('');
  const [noteForm, setNoteForm] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (tab === 'debts' && !selectedDebt) {
      fetchDebts();
    }
  }, [tab, debtPage, selectedDebt]);

  const fetchDebts = async (page = debtPage) => {
    setLoadingDebts(true);
    try {
      const data = await assignmentService.getDebts(page, 5);
      setDebts(data?.content || []);
      setDebtTotalPages(data?.totalPages || 1);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to fetch debts', 'error');
    } finally {
      setLoadingDebts(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm || !selectedDebt) return;
    setUpdating(true);
    try {
      const msg = await assignmentService.changeStatus(selectedDebt.id, statusForm);
      notify(msg || 'Status updated successfully');
      setSelectedDebt({ ...selectedDebt, status: statusForm });
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteForm.trim() || !selectedDebt) return;
    setUpdating(true);
    try {
      const msg = await assignmentService.addDetails(selectedDebt.id, noteForm);
      notify(msg || 'Note added successfully');
      setSelectedDebt({
        ...selectedDebt,
        sightInformation: [...(selectedDebt.sightInformation || []), noteForm]
      });
      setNoteForm('');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add note', 'error');
    } finally {
      setUpdating(false);
    }
  };

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
            onClick={() => { setTab('debts'); setSelectedDebt(null); }}
            title="Debts"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: tab === 'debts' ? '1px solid rgba(180,200,220,0.55)' : '1px solid transparent',
              background: tab === 'debts' ? 'rgba(255,255,255,0.80)' : 'transparent',
              color: tab === 'debts' ? 'var(--t1)' : 'var(--t2)',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              fontWeight: tab === 'debts' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: tab === 'debts' ? '0 2px 8px rgba(100,130,180,0.12), inset 0 1px 0 white' : 'none',
            }}
          >
            <Wallet size={18} />
            <span>Assigned Debts</span>
          </button>
          <button
            onClick={() => { setTab('profile'); setSelectedDebt(null); }}
            title="My Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: tab === 'profile' ? '1px solid rgba(180,200,220,0.55)' : '1px solid transparent',
              background: tab === 'profile' ? 'rgba(255,255,255,0.80)' : 'transparent',
              color: tab === 'profile' ? 'var(--t1)' : 'var(--t2)',
              fontFamily: 'inherit',
              fontSize: '0.84rem',
              fontWeight: tab === 'profile' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: tab === 'profile' ? '0 2px 8px rgba(100,130,180,0.12), inset 0 1px 0 white' : 'none',
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
        {tab === 'profile' && (
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
        )}

        {/* ── Debts tab ── */}
        {tab === 'debts' && !selectedDebt && (
          <div className="win fade-up">
            <div style={{ padding: '13px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>My Assigned Debts</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {debts.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--t3)', fontSize: '0.86rem' }}>
                  {loadingDebts ? 'Loading…' : 'No assigned debts found.'}
                </div>
              ) : (
                <table className="gtable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Debt Name</th>
                      <th>Manager</th>
                      <th>Recovery Prob.</th>
                      <th>Trust Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map(d => (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td><span style={{ color: 'var(--t1)', fontWeight: 500 }}>{d.debtName}</span></td>
                        <td>{d.managerName}</td>
                        <td>{d.recoveryProbability !== null ? d.recoveryProbability : 'N/A'}</td>
                        <td>{d.trustScore !== null ? d.trustScore : 'N/A'}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedDebt(d);
                              setStatusForm(d.status || 'ACTIVE');
                            }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination for Debts */}
            {debtTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '12px', borderTop: '1px solid rgba(180,200,220,0.28)' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 12px' }} disabled={debtPage === 0} onClick={() => setDebtPage(p => p - 1)}>Prev</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--t2)', fontWeight: 600 }}>Page {debtPage + 1} of {debtTotalPages}</span>
                <button className="btn btn-ghost" style={{ padding: '4px 12px' }} disabled={debtPage >= debtTotalPages - 1} onClick={() => setDebtPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── Single Debt Management View ── */}
        {tab === 'debts' && selectedDebt && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '6px 12px' }} onClick={() => setSelectedDebt(null)}>
              <ChevronLeft size={16} /> Back to List
            </button>
            
            <div className="win" style={{ padding: '24px' }}>
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(180,200,220,0.28)' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wallet size={20} color="#1d4ed8" /> Debt: {selectedDebt.debtName}
                </h2>
                <div style={{ display: 'flex', gap: 20, marginTop: 10, color: 'var(--t2)', fontSize: '0.9rem' }}>
                  <span><strong>ID:</strong> {selectedDebt.id}</span>
                  <span><strong>Manager:</strong> {selectedDebt.managerName}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Status Update Form */}
                <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--t1)' }}>Change Status</h3>
                  <div className="field">
                    <select className="fi" style={{ paddingLeft: 14, backgroundColor: 'transparent' }} required
                      value={statusForm} onChange={e => setStatusForm(e.target.value)}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="OVERDUE">OVERDUE</option>
                      <option value="IN_COLLECTION">IN_COLLECTION</option>
                      <option value="PARTIALLY_SETTLED">PARTIALLY_SETTLED</option>
                      <option value="APPROVED">APPROVED</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={updating}>
                    {updating ? 'Saving...' : 'Update Status'}
                  </button>
                </form>

                {/* Add Notes Form */}
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--t1)' }}>Add Insight / Note</h3>
                  <div className="field">
                    <textarea className="fi" style={{ padding: 14, minHeight: 80, resize: 'vertical' }} required
                      placeholder="Add an observation..."
                      value={noteForm} onChange={e => setNoteForm(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={updating}>
                    {updating ? 'Saving...' : 'Add Note'}
                  </button>
                </form>
              </div>

              {/* Notes History */}
              <div style={{ marginTop: 30 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--t1)' }}>Notes History</h3>
                {selectedDebt.sightInformation && selectedDebt.sightInformation.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--t2)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedDebt.sightInformation.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: 'var(--t3)', fontSize: '0.85rem' }}>No notes added yet.</div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
