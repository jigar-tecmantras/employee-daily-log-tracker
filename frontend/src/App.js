import React, { useEffect, useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';

const STORAGE_KEY = 'daily-log-auth';

function App() {
  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  return (
    <div className="app-shell">
      {!auth && (
        <div className="auth-container">
          <LoginForm onSuccess={(payload) => setAuth(payload)} />
        </div>
      )}
      {auth && (
        <div className="app-container">
          <header className="app-header">
            <h1>Employee Daily Log Tracker</h1>
            <div className="profile-pill">
              <div>
                <strong>{auth.user.name}</strong>
                <p>{auth.user.role.toLowerCase()}</p>
              </div>
              <button type="button" className="plain-button" onClick={() => setAuth(null)}>
                Logout
              </button>
            </div>
          </header>
          <main>
            {auth.user.role === 'EMPLOYEE' ? (
              <EmployeeDashboard token={auth.token} user={auth.user} />
            ) : (
              <ManagerDashboard token={auth.token} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
