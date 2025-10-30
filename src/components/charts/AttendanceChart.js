import React from 'react';
import './AttendanceChart.css';

const AttendanceChart = ({ data }) => {
  // Sample data processing for charts
  const weeklyData = [
    { day: 'Mon', present: 45, absent: 5 },
    { day: 'Tue', present: 48, absent: 2 },
    { day: 'Wed', present: 42, absent: 8 },
    { day: 'Thu', present: 47, absent: 3 },
    { day: 'Fri', present: 46, absent: 4 }
  ];

  const maxAttendance = Math.max(...weeklyData.map(d => d.present + d.absent));

  return (
    <div className="chart-container">
      <h3>Weekly Attendance Overview</h3>
      <div className="chart">
        {weeklyData.map((day, index) => {
          const total = day.present + day.absent;
          const presentPercentage = (day.present / total) * 100;
          const absentPercentage = (day.absent / total) * 100;
          
          return (
            <div key={index} className="chart-bar">
              <div className="bar-label">{day.day}</div>
              <div className="bar-container">
                <div 
                  className="bar-present" 
                  style={{ height: `${(day.present / maxAttendance) * 100}%` }}
                  title={`Present: ${day.present}`}
                ></div>
                <div 
                  className="bar-absent" 
                  style={{ height: `${(day.absent / maxAttendance) * 100}%` }}
                  title={`Absent: ${day.absent}`}
                ></div>
              </div>
              <div className="bar-stats">
                <span className="present-stat">{day.present}</span>
                <span className="absent-stat">{day.absent}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color present"></div>
          <span>Present</span>
        </div>
        <div className="legend-item">
          <div className="legend-color absent"></div>
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;