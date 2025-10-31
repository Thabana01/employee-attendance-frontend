import React, { useState, useEffect } from 'react';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', search: '' });
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, attendanceRate: 0 });

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.search) params.append('search', filters.search);

      const url = `https://employee-attendance-backend-1.onrender.com/api/attendance?${params}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const rawData = await response.json();

      // Normalize backend data
      const data = rawData.map((item) => ({
        id: item.id,
        employeeName: item.name || item.employeeName || 'Unknown',
        employeeID: item.employee_id || item.employeeID || '-',
        date: item.date,
        status: item.status || 'Unknown'
      }));

      setAttendance(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error loading attendance data. Make sure the backend server is running.');
      setAttendance([]);
      setStats({ total: 0, present: 0, absent: 0, attendanceRate: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(record => record.status.toLowerCase() === 'present').length;
    const absent = data.filter(record => record.status.toLowerCase() === 'absent').length;
    const attendanceRate = total > 0 ? ((present / total) * 100) : 0;

    setStats({
      total,
      present,
      absent,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    });
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await fetch(`https://employee-attendance-backend-1.onrender.com/api/attendance/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAttendance();
          alert('Record deleted successfully!');
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete record');
        }
      } catch {
        alert('Error connecting to server');
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => setFilters({ date: '', search: '' });

  if (loading) return <div className="loading">Loading attendance records...</div>;

  return (
    <div className="dashboard">
      <h2>Attendance Dashboard</h2>

      {/* Stats */}
      <div className="stats-cards">
        <div className="stat-card total"><h3>Total</h3><div>{stats.total}</div></div>
        <div className="stat-card present"><h3>Present</h3><div>{stats.present}</div></div>
        <div className="stat-card absent"><h3>Absent</h3><div>{stats.absent}</div></div>
        <div className="stat-card rate"><h3>Rate</h3><div>{stats.attendanceRate}%</div></div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input type="text" placeholder="Search employees..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
        <input type="date" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
        {(filters.date || filters.search) && <button onClick={clearFilters}>Clear</button>}
      </div>

      <button onClick={fetchAttendance}>Refresh Data</button>

      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.employeeName}</td>
                <td>{record.employeeID}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.status}</td>
                <td><button onClick={() => handleDelete(record.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceDashboard;
