import { useState } from 'react';

const STATIC_CREDENTIALS = {
  'manager@example.com': {
    email: 'manager@example.com',
    password: 'manager123',
    name: 'Manager',
    role: 'manager',
    token: 'static-manager-token',
  },
  'employee@example.com': {
    email: 'employee@example.com',
    password: 'employee123',
    name: 'Employee',
    role: 'employee',
    token: 'static-employee-token',
  },
};

const LoginForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = form.email.trim().toLowerCase();
    const account = STATIC_CREDENTIALS[normalizedEmail];

    if (account && account.password === form.password) {
      onSuccess({
        token: account.token,
        user: { email: account.email, name: account.name, role: account.role },
      });
      setForm({ email: '', password: '' });
      return;
    }

    setError('Invalid email or password');
  };

  return (
    <form className="card auth-card form-stack" onSubmit={handleSubmit}>
      <h2>Sign in</h2>
      <p>Use your employee or manager account to continue.</p>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
      <button type="submit" className="primary">
        Log in
      </button>
      {error && <p className="form-error">{error}</p>}
      <p className="form-hint">
        Try manager@example.com / manager123 or employee@example.com / employee123
      </p>
    </form>
  );
}

export default LoginForm;