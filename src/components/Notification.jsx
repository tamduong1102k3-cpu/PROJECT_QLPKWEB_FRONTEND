import React, { useEffect } from 'react';

const Notification = ({ message, show, onClose, type = 'success', duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const classes = {
    success: 'toast-notification success',
    error: 'toast-notification error',
    info: 'toast-notification info',
    warning: 'toast-notification warning'
  };

  return (
    <div className={classes[type] || classes.success}>
      <div className="toast-icon">{icons[type] || icons.success}</div>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Notification;