import { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4001';

const LoginForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, form);
      onSuccess({ token: response.data.token, user: response.data.user });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in');
    }
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
};

export default LoginForm;
