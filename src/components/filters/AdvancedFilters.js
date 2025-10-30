import React from 'react';
import './AdvancedFilters.css';

const AdvancedFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const statusOptions = ['All', 'Present', 'Absent'];
  const departmentOptions = ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Operations'];

  return (
    <div className="advanced-filters">
      <h4>Advanced Filters</h4>
      <div className="filter-grid">
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-range">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Department</label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
          >
            {departmentOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Records per page</label>
          <select
            value={filters.limit}
            onChange={(e) => onFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button className="apply-filters" onClick={() => onFilterChange('apply', true)}>
          Apply Filters
        </button>
        <button className="clear-filters" onClick={onClearFilters}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;