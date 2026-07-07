import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4001';

const EmployeeDashboard = ({ token, user }) => {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [status, setStatus] = useState({ message: '', type: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/logs`, { headers });
      setLogs(response.data);
    } catch (error) {
      setStatus({ message: 'Unable to load logs', type: 'error' });
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ message: '', type: '' });
    try {
      await axios.post(`${API_BASE}/logs`, form, { headers });
      setStatus({ message: 'Log submitted successfully!', type: 'success' });
      setForm((prev) => ({ ...prev, title: '', description: '' }));
      fetchLogs();
    } catch (error) {
      setStatus({
        message: error.response?.data?.error || 'Could not submit log',
        type: 'error',
      });
    }
  };

  const todayString = useMemo(() => {
    const dateValue = new Date(form.date);
    return dateValue.toDateString();
  }, [form.date]);

  const todaysLog = useMemo(
    () => logs.find((log) => new Date(log.date).toDateString() === todayString),
    [logs, todayString]
  );

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Submit log</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} required />
          <label htmlFor="log-date">Date</label>
          <input
            id="log-date"
            name="date"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
          <button type="submit" className="primary">
            Save log
          </button>
          {status.message && <p className={`form-${status.type}`}>{status.message}</p>}
        </form>
        <div className="info-box">
          <strong>Today's log</strong>
          {todaysLog ? (
            <p>{todaysLog.title}</p>
          ) : (
            <p>No log created for today yet.</p>
          )}
        </div>
      </section>
      <section className="card">
        <h2>History</h2>
        {logs.length === 0 ? (
          <p>No logged entries yet.</p>
        ) : (
          <ul className="log-list">
            {logs.map((log) => (
              <li key={log.id} className="log-row">
                <div>
                  <h4>{log.title}</h4>
                  <time>{new Date(log.date).toLocaleDateString()}</time>
                </div>
                <p>{log.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default EmployeeDashboard;
