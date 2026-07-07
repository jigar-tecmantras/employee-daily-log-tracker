import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4001';

const ManagerDashboard = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ employeeId: '', date: '' });
  const [status, setStatus] = useState({ message: '', type: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`, { headers });
      setEmployees(response.data);
    } catch (error) {
      setStatus({ message: 'Unable to load employees', type: 'error' });
    }
  };

  const fetchLogs = async (currentFilters = filters) => {
    setStatus({ message: '', type: '' });
    try {
      const params = {};
      if (currentFilters.employeeId) {
        params.employeeId = currentFilters.employeeId;
      }
      if (currentFilters.date) {
        params.date = currentFilters.date;
      }
      const response = await axios.get(`${API_BASE}/logs`, {
        headers,
        params,
      });
      setLogs(response.data);
    } catch (error) {
      setStatus({ message: 'Unable to load logs', type: 'error' });
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ employeeId: '', date: '' });
    fetchLogs({ employeeId: '', date: '' });
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Filters</h2>
        <div className="filter-grid">
          <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange}>
            <option value="">All employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <input name="date" type="date" value={filters.date} onChange={handleFilterChange} />
        </div>
        <div className="manager-actions">
          <button type="button" className="primary" onClick={() => fetchLogs()}>
            Refresh logs
          </button>
          <button type="button" className="filter-reset" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
        {status.message && <p className={`form-${status.type}`}>{status.message}</p>}
      </section>
      <section className="card">
        <h2>Logs</h2>
        {logs.length === 0 ? (
          <p>No logs matching the current filters.</p>
        ) : (
          <ul className="log-list">
            {logs.map((log) => (
              <li key={log.id} className="log-row">
                <div>
                  <h4>{log.title}</h4>
                  <time>{new Date(log.date).toLocaleDateString()}</time>
                </div>
                <p>
                  <strong>{log.user.name}</strong>
                </p>
                <p>{log.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ManagerDashboard;
