import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="professional-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>AttendancePro</h4>
          <p>Professional Employee Attendance Tracking System</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-item">
            <span className="contact-icon"></span>
            <span>support@attendancepro.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon"></span>
            <span>+266 1234 5678</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon"></span>
            <span>Limkokwing University</span>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Academic Project</h4>
          <p>BIWA2110 Web Application Development</p>
          <p>Faculty of Information & Communication Technology</p>
          <p>BSc. in Information Technology</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} AttendancePro. All rights reserved. | Developed for Educational Purposes</p>
      </div>
    </footer>
  );
};

export default Footer;