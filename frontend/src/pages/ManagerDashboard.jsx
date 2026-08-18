import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { managerService, orchestrationService } from '../services/api';
import {
  UserPlus, Users, User, LogOut,
  Building, Mail, Power,
  RefreshCw, CheckCircle2, AlertCircle,
  Briefcase, Wallet, CreditCard, UploadCloud, Download
} from 'lucide-react';

const NAV = [
  { id: 'agents', icon: <Users size={18} />, label: 'Agents' },
  { id: 'create', icon: <UserPlus size={18} />, label: 'Add Agent' },
  { id: 'debts', icon: <Wallet size={18} />, label: 'Debts' },
  { id: 'profile', icon: <User size={18} />, label: 'My Profile' },
];

export const ManagerDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const [tab, setTab] = useState('agents');

  const [agents, setAgents] = useState([]);
  const [loadingAgt, setLoadingAgt] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debts and Customers state
  const [customers, setCustomers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [debtPage, setDebtPage] = useState(0);
  const [debtTotalPages, setDebtTotalPages] = useState(0);
  const [debtTab, setDebtTab] = useState('list_debts'); // list_debts, create_customer, create_debt
  const [createMode, setCreateMode] = useState('single'); // single, bulk
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [debtForm, setDebtForm] = useState({ debtName: '', customerId: '', principalAmount: '', outStandingAmount: '', dueDate: '', status: 'ACTIVE' });
  const [creatingDebtOrCust, setCreatingDebtOrCust] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const [form, setForm] = useState({ name: '', password: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await managerService.createEmployee({
        name: form.name,
        password: form.password,
        email: form.email,
        company: user?.company,
        role: 'AGENT',
      });
      notify(`Agent "${form.name}" created successfully`);
      setForm({ name: '', password: '', email: '' });
      setTab('agents');
      fetchAgents();
    } catch (err) {
      notify(err.response?.data?.message || err.message || 'Failed to create agent', 'error');
    } finally {
      setCreating(false);
    }
  };

  const fetchAgents = async (pageNum = page) => {
    setLoadingAgt(true);
    try {
      const data = await managerService.getEmployees(pageNum, 5);
      setAgents(data?.content ?? (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages ?? 1);
    } catch {
      setAgents([]);
    } finally {
      setLoadingAgt(false);
    }
  };

  const fetchDebtsData = async (pageNum = debtPage) => {
    setLoadingDebts(true);
    try {
      const [cData, dData] = await Promise.all([
        orchestrationService.getCustomers(0, 100),
        orchestrationService.getDebts(pageNum, 5)
      ]);
      setCustomers(cData?.content ?? []);
      setDebts(dData?.content ?? []);
      setDebtTotalPages(dData?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDebts(false);
    }
  };

  useEffect(() => {
    if (tab === 'agents') {
      fetchAgents(page);
    } else if (tab === 'debts') {
      fetchDebtsData(debtPage);
    }
  }, [page, debtPage, tab]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreatingDebtOrCust(true);
    try {
      const msg = await orchestrationService.createCustomer(customerForm);
      notify(msg || `Customer "${customerForm.name}" created successfully`);
      setCustomerForm({ name: '', email: '', phoneNumber: '' });
      setDebtTab('list_debts');
      setDebtPage(0);
      fetchDebtsData(0);
    } catch (err) {
      notify(err.response?.data?.message || err.message || 'Failed to create customer', 'error');
    } finally {
      setCreatingDebtOrCust(false);
    }
  };

  const handleCreateDebt = async (e) => {
    e.preventDefault();
    setCreatingDebtOrCust(true);
    try {
      const msg = await orchestrationService.createDebt(debtForm);
      notify(msg || `Debt created successfully`);
      setDebtForm({ debtName: '', customerId: '', principalAmount: '', outStandingAmount: '', dueDate: '', status: 'ACTIVE' });
      setDebtTab('list_debts');
      setDebtPage(0);
      fetchDebtsData(0);
    } catch (err) {
      notify(err.response?.data?.message || err.message || 'Failed to create debt', 'error');
    } finally {
      setCreatingDebtOrCust(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBulk(true);
    try {
      const msg = await orchestrationService.bulkIngestion(file);
      notify(msg || 'Bulk upload successful');
      setDebtPage(0);
      fetchDebtsData(0);
      setDebtTab('list_debts');
    } catch (err) {
      notify(err.response?.data?.message || err.message || 'Failed to upload bulk data', 'error');
    } finally {
      setUploadingBulk(false);
      // Reset the file input
      e.target.value = null;
    }
  };

  const handleToggle = async (id) => {
    try {
      const msg = await managerService.toggleEmployeeStatus(id);
      notify(msg || 'Status updated');
      fetchAgents();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ name: m.name, email: m.email });
  };

  const saveEdit = async (m) => {
    try {
      await managerService.updateEmployee(m.id, { ...m, name: editForm.name, email: editForm.email });
      notify('Agent updated successfully');
      setEditingId(null);
      fetchAgents();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update agent', 'error');
    }
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', company: '', email: '' });

  const startEditProfile = () => {
    setProfileForm({ name: user?.name || '', company: user?.company || '', email: user?.email || '' });
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await managerService.updateSelf(user.id, {
        id: user.id,
        name: profileForm.name,
        company: profileForm.company,
        email: profileForm.email,
        role: 'MANAGER',
        enabled: true
      });
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
          <Briefcase size={17} color="#0e7490" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--t1)', letterSpacing: '-0.01em' }}>
            DCA Management
          </span>
          <span className="badge badge-manager" style={{ marginLeft: 4 }}>Manager</span>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              title={n.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 10,
                border: tab === n.id
                  ? '1px solid rgba(180,200,220,0.55)'
                  : '1px solid transparent',
                background: tab === n.id
                  ? 'rgba(255,255,255,0.80)'
                  : 'transparent',
                color: tab === n.id ? 'var(--t1)' : 'var(--t2)',
                fontFamily: 'inherit',
                fontSize: '0.84rem',
                fontWeight: tab === n.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: tab === n.id
                  ? '0 2px 8px rgba(100,130,180,0.12), inset 0 1px 0 white'
                  : 'none',
              }}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
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

        {/* ── Agents tab ── */}
        {tab === 'agents' && (
          <div className="fade-up">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              marginBottom: 24
            }}>
              {[
                { label: 'Total', value: agents.length, color: '#0e7490' },
                { label: 'Active', value: agents.filter(m => m.enabled !== false).length, color: '#047857' },
                { label: 'Inactive', value: agents.filter(m => m.enabled === false).length, color: '#b91c1c' },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="win">
              <div style={{ padding: '13px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>Agents</span>
                <button className="btn btn-ghost" style={{ padding: '5px 11px', fontSize: '0.78rem' }} onClick={() => fetchAgents()}>
                  <RefreshCw size={13} style={loadingAgt ? { animation: 'spin 0.7s linear infinite' } : {}} /> Refresh
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                {agents.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--t3)', fontSize: '0.86rem' }}>
                    {loadingAgt ? 'Loading…' : 'No agents found.'}
                  </div>
                ) : (
                  <table className="gtable">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map(m => {
                        const isEditing = editingId === m.id;
                        return (
                          <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>
                              {isEditing ? (
                                <input className="fi" style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                  value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                              ) : (
                                <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{m.name}</span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input className="fi" style={{ padding: '6px 10px', fontSize: '0.8rem' }} type="email"
                                  value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Mail size={12} color="var(--t3)" /> {m.email}
                                </span>
                              )}
                            </td>
                            <td>
                              {m.enabled !== false
                                ? <span className="badge badge-on">Active</span>
                                : <span className="badge badge-off">Inactive</span>}
                            </td>
                            <td style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              {isEditing ? (
                                <>
                                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => saveEdit(m)}>Save</button>
                                </>
                              ) : (
                                <>
                                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => startEdit(m)}>Edit</button>
                                  <button
                                    className={`btn ${m.enabled !== false ? 'btn-danger' : 'btn-ghost'}`}
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    onClick={() => handleToggle(m.id)}
                                  >
                                    <Power size={12} /> {m.enabled !== false ? 'Disable' : 'Enable'}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '12px', borderTop: '1px solid rgba(180,200,220,0.28)' }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 12px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--t2)', fontWeight: 600 }}>Page {page + 1} of {totalPages}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 12px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Add Agent tab ── */}
        {tab === 'create' && (
          <div className="fade-up win" style={{ maxWidth: 460, margin: '0 auto' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={15} color="#0e7490" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>New Agent</span>
            </div>
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="field">
                  <label>Username</label>
                  <input className="fi" style={{ paddingLeft: 14 }} type="text" required
                    placeholder="e.g. agent_smith"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="fi" style={{ paddingLeft: 14 }} type="email" required
                    placeholder="agent@company.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input className="fi" style={{ paddingLeft: 14 }} type="password" required
                    placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
                    onClick={() => setTab('agents')}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={creating}>
                    {creating && <span className="spinner" />}
                    {creating ? 'Creating…' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Debts tab ── */}
        {tab === 'debts' && (
          <div className="fade-up">
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button className={`btn ${debtTab === 'list_debts' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDebtTab('list_debts')}>
                <Wallet size={14} /> View Debts
              </button>
              <button className={`btn ${debtTab === 'create_customer' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDebtTab('create_customer')}>
                <UserPlus size={14} /> Create Customer
              </button>
              <button className={`btn ${debtTab === 'create_debt' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDebtTab('create_debt')}>
                <CreditCard size={14} /> Create Debt
              </button>
            </div>

            {debtTab === 'list_debts' && (
              <div className="win">
                <div style={{ padding: '13px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>All Debts</span>
                  <button className="btn btn-ghost" style={{ padding: '5px 11px', fontSize: '0.78rem' }} onClick={() => fetchDebtsData(debtPage)}>
                    <RefreshCw size={13} style={loadingDebts ? { animation: 'spin 0.7s linear infinite' } : {}} /> Refresh
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  {debts.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--t3)', fontSize: '0.86rem' }}>
                      {loadingDebts ? 'Loading…' : 'No debts found.'}
                    </div>
                  ) : (
                    <table className="gtable">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Debt Name</th>
                          <th>Customer</th>
                          <th>Principal</th>
                          <th>Outstanding</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map(d => (
                          <tr key={d.id}>
                            <td>{d.id}</td>
                            <td><span style={{ color: 'var(--t1)', fontWeight: 500 }}>{d.debtName}</span></td>
                            <td>
                              {d.customerName || d.customerId}
                            </td>
                            <td>${d.principalAmount}</td>
                            <td>${d.outstandingAmount}</td>
                            <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${d.status === 'ACTIVE' ? 'badge-on' : 'badge-off'}`}>
                                {d.status}
                              </span>
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

            {debtTab === 'create_customer' && (
              <div className="win fade-up" style={{ maxWidth: 460, margin: '0 auto' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>Create Customer</span>
                </div>
                <div style={{ padding: '24px' }}>
                  <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="field">
                      <label>Name</label>
                      <input className="fi" style={{ paddingLeft: 14 }} type="text" required
                        value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input className="fi" style={{ paddingLeft: 14 }} type="email" required
                        value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Phone Number</label>
                      <input className="fi" style={{ paddingLeft: 14 }} type="tel" required
                        value={customerForm.phoneNumber} onChange={e => setCustomerForm(f => ({ ...f, phoneNumber: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creatingDebtOrCust}>
                        {creatingDebtOrCust && <span className="spinner" />}
                        {creatingDebtOrCust ? 'Creating…' : 'Create Customer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {debtTab === 'create_debt' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto' }}>
                
                {/* Sub-navigation for Create Debt */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.6)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(180,200,220,0.3)', marginBottom: 10 }}>
                  <button 
                    onClick={() => setCreateMode('single')}
                    style={{ 
                      flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                      background: createMode === 'single' ? 'rgba(14,116,144,0.08)' : 'transparent',
                      color: createMode === 'single' ? 'var(--cyan)' : 'var(--t2)',
                    }}
                  >
                    <CreditCard size={15} /> Single Debt
                  </button>
                  <button 
                    onClick={() => setCreateMode('bulk')}
                    style={{ 
                      flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                      background: createMode === 'bulk' ? 'rgba(14,116,144,0.08)' : 'transparent',
                      color: createMode === 'bulk' ? 'var(--cyan)' : 'var(--t2)',
                    }}
                  >
                    <UploadCloud size={15} /> Bulk Upload
                  </button>
                </div>

                {createMode === 'single' && (
                  <div className="win fade-up">
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>Create Single Debt</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <form onSubmit={handleCreateDebt} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="field">
                          <label>Customer</label>
                          <select className="fi" style={{ paddingLeft: 14, backgroundColor: 'transparent' }} required
                            value={debtForm.customerId} onChange={e => setDebtForm(f => ({ ...f, customerId: e.target.value }))}>
                            <option value="">-- Select Customer --</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.customerName} ({c.email})</option>
                            ))}
                          </select>
                          {customers.length === 0 && <span style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: 4 }}>No customers available. Create one first.</span>}
                        </div>
                        <div className="field">
                          <label>Debt Name / Reference</label>
                          <input className="fi" style={{ paddingLeft: 14 }} type="text" required
                            value={debtForm.debtName} onChange={e => setDebtForm(f => ({ ...f, debtName: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Principal Amount ($)</label>
                          <input className="fi" style={{ paddingLeft: 14 }} type="number" step="0.01" min="0" required
                            value={debtForm.principalAmount} onChange={e => setDebtForm(f => ({ ...f, principalAmount: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Outstanding Amount ($)</label>
                          <input className="fi" style={{ paddingLeft: 14 }} type="number" step="0.01" min="0" required
                            value={debtForm.outStandingAmount} onChange={e => setDebtForm(f => ({ ...f, outStandingAmount: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Due Date</label>
                          <input className="fi" style={{ paddingLeft: 14 }} type="date" required
                            value={debtForm.dueDate} onChange={e => setDebtForm(f => ({ ...f, dueDate: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Status</label>
                          <select className="fi" style={{ paddingLeft: 14, backgroundColor: 'transparent' }} required
                            value={debtForm.status} onChange={e => setDebtForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="OVERDUE">OVERDUE</option>
                            <option value="IN_COLLECTION">IN_COLLECTION</option>
                            <option value="PARTIALLY_SETTLED">PARTIALLY_SETTLED</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creatingDebtOrCust || customers.length === 0}>
                            {creatingDebtOrCust && <span className="spinner" />}
                            {creatingDebtOrCust ? 'Creating…' : 'Create Debt'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {createMode === 'bulk' && (
                  <div className="win fade-up">
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(180,200,220,0.28)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--t1)' }}>Bulk Upload Debts</span>
                      <a href="/sample_debts.csv" download className="btn btn-ghost" style={{ padding: '5px 11px', fontSize: '0.78rem', textDecoration: 'none' }}>
                        <Download size={14} style={{ marginRight: 4 }} /> Sample CSV
                      </a>
                    </div>
                    <div style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(14,116,144,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e7490', marginBottom: 8 }}>
                        <UploadCloud size={32} />
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--t2)', fontSize: '0.9rem', marginBottom: 12, lineHeight: 1.5 }}>
                        Upload a CSV file to ingest multiple debts at once. <br/>
                        Ensure your file follows the required format.
                      </div>
                      <label className="btn btn-primary" style={{ minWidth: 200, display: 'flex', justifyContent: 'center', padding: '14px', cursor: uploadingBulk ? 'not-allowed' : 'pointer' }}>
                        {uploadingBulk ? (
                          <>
                            <span className="spinner" style={{ marginRight: 8 }} /> Uploading...
                          </>
                        ) : (
                          <>
                            Select CSV File
                          </>
                        )}
                        <input 
                          type="file" 
                          accept=".csv" 
                          style={{ display: 'none' }} 
                          onChange={handleBulkUpload}
                          disabled={uploadingBulk}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div className="win fade-up" style={{ maxWidth: 460, margin: '0 auto' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(180,200,220,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={15} color="#0e7490" />
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
                    <input className="fi" style={{ paddingLeft: 14 }} type="text" required
                      value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
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
                  { label: 'Company', value: user?.company || '—', icon: <Building size={14} color="var(--t3)" /> },
                  { label: 'Email', value: user?.email || '—', icon: <Mail size={14} color="var(--t3)" /> },
                  { label: 'Role', value: 'Manager', icon: <Briefcase size={14} color="#0e7490" /> },
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

      </div>
    </div>
  );
};
