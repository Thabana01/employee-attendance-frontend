import React, { useState } from 'react';

const AttendanceForm = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeID: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    employeeName: '',
    employeeID: ''
  });

  // Validation functions
  const validateEmployeeName = (name) => {
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(name) && name !== '') {
      return 'Employee name should only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateEmployeeID = (id) => {
    const idRegex = /^[A-Za-z]*\d+[A-Za-z\d]*$/;
    if (!idRegex.test(id) && id !== '') {
      return 'Employee ID should contain numbers. Letters are optional but must be followed by numbers.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'employeeName') {
      setErrors(prev => ({
        ...prev,
        employeeName: validateEmployeeName(value)
      }));
    } else if (name === 'employeeID') {
      setErrors(prev => ({
        ...prev,
        employeeID: validateEmployeeID(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateEmployeeName(formData.employeeName);
    const idError = validateEmployeeID(formData.employeeID);

    setErrors({
      employeeName: nameError,
      employeeID: idError
    });

    if (nameError || idError) {
      setMessage({ 
        type: 'error', 
        text: 'Please fix the validation errors before submitting.' 
      });
      return;
    }

    if (!formData.employeeName.trim() || !formData.employeeID.trim()) {
      setMessage({ 
        type: 'error', 
        text: 'Please fill in all required fields.' 
      });
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    // Inside handleSubmit()
try {
  const response = await fetch('https://employee-attendance-backend-1.onrender.com/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (response.ok) {
    setMessage({ type: 'success', text: data.message });
    setFormData({
      employeeName: '',
      employeeID: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    });
    setErrors({ employeeName: '', employeeID: '' });
  } else {
    setMessage({ type: 'error', text: data.error });
  }
} catch (error) {
  setMessage({ 
    type: 'error', 
    text: 'Error connecting to server. Make sure the backend is live.' 
  });
}
 finally {
      setIsSubmitting(false);
    }
  };

  const getExampleID = () => {
    const examples = ['EMP001', '12345', 'STF2024', '1001'];
    return examples[Math.floor(Math.random() * examples.length)];
  };

  return (
    <div className="attendance-form">
      <h2>Mark Employee Attendance</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="employeeName">
            Employee Name: *
            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
              (Letters only)
            </span>
          </label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            required
            placeholder="e.g., John Smith, Mary-Jane, O'Brian"
            className={errors.employeeName ? 'input-error' : ''}
          />
          {errors.employeeName && <div className="error-message">{errors.employeeName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="employeeID">
            Employee ID: *
            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
              (Numbers required)
            </span>
          </label>
          <input
            type="text"
            id="employeeID"
            name="employeeID"
            value={formData.employeeID}
            onChange={handleChange}
            required
            placeholder={`e.g., ${getExampleID()}`}
            className={errors.employeeID ? 'input-error' : ''}
          />
          {errors.employeeID && <div className="error-message">{errors.employeeID}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date: *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Attendance Status: *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || errors.employeeName || errors.employeeID}
        >
          {isSubmitting ? 'Recording...' : 'Record Attendance'}
        </button>

        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          <p><strong>Validation Rules:</strong></p>
          <p>• Name: Letters, spaces, hyphens (-), apostrophes (') only</p>
          <p>• ID: Must contain numbers (e.g., 123, EMP123, STF2024)</p>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
