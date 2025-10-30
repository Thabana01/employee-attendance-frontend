import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'warning', 
      message: '3 employees absent today', 
      time: '2 hours ago', 
      read: false,
      data: { absentCount: 3 }
    },
    { 
      id: 2, 
      type: 'info', 
      message: 'Monthly attendance report generated', 
      time: '1 day ago', 
      read: true,
      data: { reportType: 'monthly' }
    },
    { 
      id: 3, 
      type: 'success', 
      message: 'System backup completed successfully', 
      time: '3 days ago', 
      read: true,
      data: { backupTime: '02:00 AM' }
    },
    { 
      id: 4, 
      type: 'warning', 
      message: 'Low attendance in IT department this week', 
      time: '5 days ago', 
      read: false,
      data: { department: 'IT', attendanceRate: 75 }
    }
  ]);

  // Fetch real notifications from backend (optional)
  const fetchNotifications = async () => {
    try {
      // In a real app, you would fetch from an API
      // const response = await fetch('http://localhost:5000/api/notifications');
      // const data = await response.json();
      // setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Simulate new notifications (for demo purposes)
    const interval = setInterval(() => {
      // Only add new notification if there are less than 10
      if (notifications.length < 10) {
        const newNotification = {
          id: Date.now(),
          type: 'info',
          message: `System check completed at ${new Date().toLocaleTimeString()}`,
          time: 'Just now',
          read: false,
          data: { checkType: 'system' }
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [notifications.length]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTimeAgo = (timeString) => {
    // In a real app, you'd calculate this from actual timestamps
    return timeString;
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'warning':
        if (notification.data?.absentCount) {
          alert(`There are ${notification.data.absentCount} employees absent today. Check the dashboard for details.`);
        }
        break;
      case 'info':
        if (notification.data?.reportType) {
          alert(`The ${notification.data.reportType} report has been generated. You can view it in the Reports section.`);
        }
        break;
      default:
        // Default action for other notifications
        console.log('Notification clicked:', notification);
    }
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <div className="unread-badge">
              <span className="unread-count">{unreadCount}</span>
              <span className="unread-text">unread</span>
            </div>
          )}
          <div className="action-buttons">
            {unreadCount > 0 && (
              <button 
                className="action-btn mark-read-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            <button 
              className="action-btn clear-btn"
              onClick={clearAll}
              title="Clear all notifications"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">📭</div>
            <p>No notifications</p>
            <span className="no-notifications-sub">You're all caught up!</span>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.type} ${!notification.read ? 'unread' : 'read'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {getTimeAgo(notification.time)}
                </span>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>

      <div className="notifications-footer">
        <button 
          className="refresh-btn"
          onClick={fetchNotifications}
        >
          🔄 Refresh
        </button>
        <span className="notification-count">
          {notifications.length} total
        </span>
      </div>
    </div>
  );
};

export default Notifications;