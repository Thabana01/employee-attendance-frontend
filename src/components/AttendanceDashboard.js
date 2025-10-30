import React, { useState, useEffect } from 'react';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0
  });

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.search) params.append('search', filters.search);

      const url = `http://localhost:5000/api/attendance?${params}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Set attendance using the `data` array from backend
      const records = data.data || [];
      setAttendance(records);

      // Calculate statistics
      calculateStats(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error loading attendance data. Make sure the backend server is running.');
      setAttendance([]);
      setStats({ total: 0, present: 0, absent: 0, attendanceRate: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from attendance data
  const calculateStats = (records) => {
    const total = records.length;
    const present = records.filter(record => record.status === 'Present').length;
    const absent = records.filter(record => record.status === 'Absent').length;
    const attendanceRate = total > 0 ? ((present / total) * 100) : 0;

    setStats({
      total,
      present,
      absent,
      attendanceRate: Math.round(attendanceRate * 100) / 100 // Round to 2 decimal places
    });
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/attendance/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAttendance();
          alert('Record deleted successfully!');
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete record');
        }
      } catch (error) {
        alert('Error connecting to server');
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ date: '', search: '' });
  };

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Attendance Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-content">
            <h3>Total Records</h3>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">All time attendance</div>
          </div>
        </div>

        <div className="stat-card present">
          <div className="stat-content">
            <h3>Present</h3>
            <div className="stat-number">{stats.present}</div>
            <div className="stat-label">
              {stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-content">
            <h3>Absent</h3>
            <div className="stat-number">{stats.absent}</div>
            <div className="stat-label">
              {stats.total > 0 ? `${((stats.absent / stats.total) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-content">
            <h3>Attendance Rate</h3>
            <div className="stat-number">{stats.attendanceRate}%</div>
            <div className="stat-label">Overall performance</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Search by Name or ID:</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search employees..."
          />
        </div>
        
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
        
        {(filters.date || filters.search) && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button onClick={fetchAttendance} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {/* Attendance Table */}
      {attendance.length === 0 ? (
        <div className="no-data">
          <p>No attendance records found.</p>
          {(filters.date || filters.search) ? (
            <p>Try adjusting your search criteria or <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}>clear filters</button>.</p>
          ) : (
            <p>Go to "Mark Attendance" to add records.</p>
          )}
        </div>
      ) : (
        <div className="attendance-table-container">
          <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#333' }}>
            Showing {attendance.length} record{attendance.length !== 1 ? 's' : ''}
          </div>
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
                  <td>
                    <span className={`status ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(record.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
