import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';

const RoleRouter = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--t2)',
        fontSize: '0.9rem',
        gap: 10
      }}>
        <span className="spinner" style={{ borderTopColor: 'var(--blue)' }} />
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  switch (user?.role) {
    case 'ADMIN':   return <Dashboard />;
    case 'MANAGER': return <ManagerDashboard />;
    case 'AGENT':   return <AgentDashboard />;
    default:        return <Login />;
  }
};

function App() {
  return (
    <AuthProvider>
      <RoleRouter />
    </AuthProvider>
  );
}

export default App;
