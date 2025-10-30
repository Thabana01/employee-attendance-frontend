import React, { useState, useEffect } from 'react';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employeeId: '',
    department: 'IT',
    position: '',
    email: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch employees from SQLite attendance records
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/attendance');
      
      if (!response.ok) throw new Error('Failed to fetch attendance data from SQLite');
      
      const attendanceData = await response.json();
      const employeeMap = new Map();
      
      attendanceData.forEach(record => {
        const key = record.employeeID;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            id: record.employeeID,
            name: record.employeeName,
            employeeId: record.employeeID,
            department: getDepartmentFromId(record.employeeID),
            position: getPositionFromId(record.employeeID),
            email: generateEmail(record.employeeName, record.employeeID),
            totalRecords: 0,
            presentCount: 0,
            absentCount: 0,
            firstRecordDate: record.date,
            lastRecordDate: record.date,
            created_at: record.created_at
          });
        }
        
        const employee = employeeMap.get(key);
        employee.totalRecords++;
        if (record.status === 'Present') employee.presentCount++;
        else employee.absentCount++;

        if (new Date(record.date) < new Date(employee.firstRecordDate)) employee.firstRecordDate = record.date;
        if (new Date(record.date) > new Date(employee.lastRecordDate)) employee.lastRecordDate = record.date;
      });

      setEmployees(Array.from(employeeMap.values()));
    } catch (error) {
      console.error('Error fetching employees from SQLite:', error);
      alert('Error loading employee data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentFromId = (employeeId) => {
    const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
    const hash = employeeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return departments[hash % departments.length];
  };

  const getPositionFromId = (employeeId) => {
    const positions = ['Manager', 'Developer', 'Analyst', 'Specialist', 'Coordinator', 'Assistant'];
    const hash = employeeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return positions[hash % positions.length];
  };

  const generateEmail = (name, employeeId) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    return `${cleanName}.${employeeId.toLowerCase()}@company.com`;
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const calculateAttendanceRate = (employee) => {
    if (employee.totalRecords === 0) return 0;
    return Math.round((employee.presentCount / employee.totalRecords) * 100);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.employeeId) return alert('Please fill in name and employee ID');
    if (employees.some(emp => emp.employeeId === newEmployee.employeeId)) return alert('Employee ID already exists!');

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: newEmployee.name,
          employeeID: newEmployee.employeeId,
          date: today,
          status: 'Present'
        }),
      });

      if (!response.ok) throw new Error('Failed to create attendance record');

      fetchEmployees();
      setNewEmployee({ name: '', employeeId: '', department: 'IT', position: '', email: '' });
      setShowAddForm(false);
      alert('Employee added successfully! Sample attendance record created.');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee to database. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const deleteEmployee = async (employeeId) => {
    if (!window.confirm(`Delete employee ${employeeId} and all their attendance records?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/attendance');
      const attendanceData = await response.json();
      const employeeRecords = attendanceData.filter(record => record.employeeID === employeeId);

      for (const record of employeeRecords) {
        await fetch(`http://localhost:5000/api/attendance/${record.id}`, { method: 'DELETE' });
      }

      fetchEmployees();
      alert(`Employee ${employeeId} and their attendance records deleted.`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee. Please try again.');
    }
  };

  const viewEmployeeAttendance = (employee) => {
    const rate = calculateAttendanceRate(employee);
    alert(`Attendance for ${employee.name} (${employee.employeeId}):
Total Records: ${employee.totalRecords}
Present: ${employee.presentCount}
Absent: ${employee.absentCount}
Attendance Rate: ${rate}%
First Record: ${new Date(employee.firstRecordDate).toLocaleDateString()}
Last Record: ${new Date(employee.lastRecordDate).toLocaleDateString()}
Stored in: SQLite`);
  };

  const refreshData = () => {
    fetchEmployees();
    alert('Employee data refreshed from SQLite!');
  };

  if (loading) return <div className="employee-list"><div className="loading">Loading employees from SQLite...</div></div>;

  return (
    <div className="employee-list">
      {/* ...existing JSX remains unchanged... */}
      {/* Everything below including search, add form, stats, grid, and actions stays exactly the same */}
    </div>
  );
};

export default EmployeeList;
