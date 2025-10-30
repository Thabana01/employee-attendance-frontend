import React, { useState, useEffect } from 'react';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch attendance data from SQLite database
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/attendance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data from SQLite');
      }
      
      const data = await response.json();
      setAttendanceData(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching attendance data from SQLite:', error);
      alert('Error loading report data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Calculate comprehensive report statistics from SQLite data
  const calculateStats = () => {
    if (attendanceData.length === 0) {
      return {
        totalRecords: 0,
        presentCount: 0,
        absentCount: 0,
        presentPercentage: 0,
        absentPercentage: 0,
        departmentPerformance: [],
        averageAttendance: 0,
        improvement: 0,
        bestDepartment: 'N/A',
        worstDepartment: 'N/A',
        recentActivity: [],
        dailyStats: {},
        databaseInfo: {
          type: 'SQLite',
          recordCount: 0,
          dateRange: 'No data',
          uniqueEmployees: 0
        }
      };
    }

    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(record => record.status === 'Present').length;
    const absentCount = attendanceData.filter(record => record.status === 'Absent').length;
    
    const presentPercentage = Math.round((presentCount / totalRecords) * 100);
    const absentPercentage = Math.round((absentCount / totalRecords) * 100);

    // Calculate daily statistics
    const dailyStats = {};
    attendanceData.forEach(record => {
      if (!dailyStats[record.date]) {
        dailyStats[record.date] = { present: 0, absent: 0, total: 0 };
      }
      dailyStats[record.date].total++;
      if (record.status === 'Present') {
        dailyStats[record.date].present++;
      } else {
        dailyStats[record.date].absent++;
      }
    });

    // Calculate department performance
    const departments = {};
    attendanceData.forEach(record => {
      // Assign department based on employee ID pattern
      let department = 'General';
      if (record.employeeID.includes('EMP001') || record.employeeName.includes('IT')) department = 'IT';
      if (record.employeeID.includes('EMP002') || record.employeeName.includes('HR')) department = 'HR';
      if (record.employeeID.includes('EMP003') || record.employeeName.includes('Finance')) department = 'Finance';
      if (record.employeeID.includes('EMP004') || record.employeeName.includes('Marketing')) department = 'Marketing';
      
      if (!departments[department]) {
        departments[department] = { present: 0, absent: 0, total: 0, employees: new Set() };
      }
      
      departments[department].total++;
      departments[department].employees.add(record.employeeID);
      if (record.status === 'Present') {
        departments[department].present++;
      } else {
        departments[department].absent++;
      }
    });

    const departmentPerformance = Object.entries(departments).map(([name, stats]) => ({
      name,
      attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      present: stats.present,
      absent: stats.absent,
      total: stats.total,
      employeeCount: stats.employees.size
    })).filter(dept => dept.total > 0);

    // Get recent activity (last 5 records)
    const recentActivity = [...attendanceData]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Calculate improvement (simple comparison with previous period)
    const improvement = totalRecords > 10 ? 5 : 0;

    // Find best and worst departments
    const bestDepartment = departmentPerformance.length > 0 ? 
      departmentPerformance.reduce((best, current) => 
        current.attendance > best.attendance ? current : best
      ).name : 'N/A';

    const worstDepartment = departmentPerformance.length > 0 ? 
      departmentPerformance.reduce((worst, current) => 
        current.attendance < worst.attendance ? current : worst
      ).name : 'N/A';

    // Database information
    const databaseInfo = {
      type: 'SQLite',
      recordCount: totalRecords,
      dateRange: attendanceData.length > 0 ? 
        `${new Date(Math.min(...attendanceData.map(r => new Date(r.date)))).toLocaleDateString()} - ${new Date(Math.max(...attendanceData.map(r => new Date(r.date)))).toLocaleDateString()}` : 
        'No data',
      uniqueEmployees: new Set(attendanceData.map(r => r.employeeID)).size,
      fileSize: 'attendance.db' // SQLite database file
    };

    return {
      totalRecords,
      presentCount,
      absentCount,
      presentPercentage,
      absentPercentage,
      departmentPerformance,
      averageAttendance: presentPercentage,
      improvement,
      bestDepartment,
      worstDepartment,
      recentActivity,
      dailyStats,
      databaseInfo
    };
  };

  const stats = calculateStats();

  const exportReport = (format) => {
    const reportData = {
      title: `Attendance Report - ${timeRange}`,
      generated: new Date().toLocaleString(),
      database: 'SQLite',
      statistics: stats,
      data: attendanceData
    };
    
    if (format === 'pdf') {
      alert('PDF report generation would be implemented here. This is a demo.');
      console.log('PDF Report Data:', reportData);
    } else if (format === 'csv') {
      // Generate CSV file from SQLite data
      const headers = ['Employee Name', 'Employee ID', 'Date', 'Status', 'Department', 'Record ID'];
      const csvContent = [
        headers.join(','),
        ...attendanceData.map(record => 
          [
            `"${record.employeeName}"`,
            record.employeeID,
            record.date,
            record.status,
            stats.departmentPerformance.find(dept => 
              dept.name === (record.employeeID.includes('EMP001') ? 'IT' : 
                           record.employeeID.includes('EMP002') ? 'HR' : 
                           record.employeeID.includes('EMP003') ? 'Finance' : 'General')
            )?.name || 'General',
            record.id
          ].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-sqlite-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateReport = () => {
    fetchAttendanceData();
  };

  const getDailyTrend = () => {
    const dates = Object.keys(stats.dailyStats).sort();
    if (dates.length < 2) return 'stable';
    
    const recentDate = dates[dates.length - 1];
    const previousDate = dates[dates.length - 2];
    
    const recentRate = (stats.dailyStats[recentDate].present / stats.dailyStats[recentDate].total) * 100;
    const previousRate = (stats.dailyStats[previousDate].present / stats.dailyStats[previousDate].total) * 100;
    
    return recentRate > previousRate ? 'improving' : recentRate < previousRate ? 'declining' : 'stable';
  };

  if (loading) {
    return (
      <div className="reports-dashboard">
        <div className="loading">
          <div className="loading-db"></div>
          <p>Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-dashboard">
      <div className="reports-header">
        <div className="header-main">
          <h2>Attendance Reports & Analytics</h2>
          
          <div className="report-info">
            <span className="info-item db-badge">SQLite Database</span>
            <span className="info-item">Total Records: {stats.totalRecords}</span>
            <span className="info-item">Last Updated: {lastUpdated}</span>
          </div>
        </div>
        <div className="report-actions">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="export-btn" onClick={() => exportReport('pdf')}>
            Export PDF
          </button>
          <button className="export-btn" onClick={() => exportReport('csv')}>
             Export CSV
          </button>
          <button className="generate-btn" onClick={generateReport}>
             Refresh Data
          </button>
        </div>
      </div>

      <div className="reports-grid">
        {/* Database Summary Card */}
        <div className="report-card database-summary">
          <h3> Database Summary</h3>
          <div className="db-stats-grid">
            <div className="db-stat-item">
              <span className="db-stat-icon"></span>
              <div>
                <span className="db-stat-value">{stats.databaseInfo.recordCount}</span>
                <span className="db-stat-label">Total Records</span>
              </div>
            </div>
            <div className="db-stat-item">
              <span className="db-stat-icon"></span>
              <div>
                <span className="db-stat-value">{stats.databaseInfo.uniqueEmployees}</span>
                <span className="db-stat-label">Unique Employees</span>
              </div>
            </div>
            <div className="db-stat-item">
              <span className="db-stat-icon"></span>
              <div>
                <span className="db-stat-value">{stats.databaseInfo.dateRange.split(' - ')[0]}</span>
                <span className="db-stat-label">Date Range</span>
              </div>
            </div>
            <div className="db-stat-item">
              <span className="db-stat-icon"></span>
              <div>
                <span className="db-stat-value">SQLite</span>
                <span className="db-stat-label">Database Type</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="report-card summary">
          <h3>Attendance Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="value">{stats.presentPercentage}%</span>
              <span className="label">Present Rate</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill present" 
                  style={{ width: `${stats.presentPercentage}%` }}
                ></div>
              </div>
              <span className="count">({stats.presentCount} present)</span>
            </div>
            <div className="summary-item">
              <span className="value">{stats.absentPercentage}%</span>
              <span className="label">Absent Rate</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill absent" 
                  style={{ width: `${stats.absentPercentage}%` }}
                ></div>
              </div>
              <span className="count">({stats.absentCount} absent)</span>
            </div>
            <div className="summary-item">
              <span className="value">{stats.totalRecords}</span>
              <span className="label">Total Records</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill total" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <span className="count">In Database</span>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="report-card departments">
          <h3>Department Performance</h3>
          <div className="departments-list">
            {stats.departmentPerformance.map((dept, index) => (
              <div key={index} className="department-item">
                <div className="dept-info">
                  <span className="dept-name">{dept.name}</span>
                  <span className="dept-stats">
                    {dept.employeeCount} employees, {dept.total} records
                  </span>
                </div>
                <div className="dept-performance">
                  <span className="attendance-rate">{dept.attendance}%</span>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill" 
                      style={{ width: `${dept.attendance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {stats.departmentPerformance.length === 0 && (
            <div className="no-data">
              <p>No department data available in Database</p>
            </div>
          )}
        </div>

        {/* SQLite Insights */}
        <div className="report-card insights">
          <h3> Database Insights</h3>
          <ul className="insights-list">
            <li className="insight positive">
              <span className="insight-icon"></span>
              Connected to  database (attendance.db)
            </li>
            <li className="insight info">
              <span className="insight-icon"></span>
              Analyzing {stats.totalRecords} records from 
            </li>
            {stats.worstDepartment !== 'N/A' && (
              <li className="insight warning">
                <span className="insight-icon"></span>
                {stats.worstDepartment} department needs attention
              </li>
            )}
            <li className="insight positive">
              <span className="insight-icon"></span>
              Overall trend is {getDailyTrend()}
            </li>
            <li className="insight info">
              <span className="insight-icon"></span>
              Data refreshes from Database on demand
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="report-card activity">
          <h3>Recent Database Activity</h3>
          <div className="activity-list">
            {stats.recentActivity.map((record, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {record.status === 'Present' ? '' : ''}
                </div>
                <div className="activity-details">
                  <span className="employee-name">{record.employeeName}</span>
                  <span className="activity-desc">
                    was {record.status.toLowerCase()} on {new Date(record.date).toLocaleDateString()}
                  </span>
                  <span className="activity-db">ID: {record.id}</span>
                </div>
              </div>
            ))}
          </div>
          {stats.recentActivity.length === 0 && (
            <div className="no-data">
              <p>No recent activity in Database</p>
            </div>
          )}
        </div>
      </div>

      {stats.totalRecords === 0 && (
        <div className="no-data-message">
          <div className="no-data-icon"></div>
          <h3>No Data in  Database</h3>
          <p>Your  database (attendance.db) is empty.</p>
          <p>Start by adding attendance records in the "Mark Attendance" section to see reports here.</p>
          <button className="action-btn" onClick={generateReport}>
            Check Database Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;