import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy bỏ', type = 'primary', icon }) => {
  if (!isOpen) return null;

  const typeStyles = {
    primary: {
      iconBg: '#eef2ff',
      iconColor: '#4f46e5',
      buttonBg: '#4f46e5',
      buttonBgHover: '#4338ca',
      buttonShadow: 'rgba(79, 70, 229, 0.3)'
    },
    danger: {
      iconBg: '#fef2f2',
      iconColor: '#dc2626',
      buttonBg: '#dc2626',
      buttonBgHover: '#b91c1c',
      buttonShadow: 'rgba(220, 38, 38, 0.3)'
    },
    warning: {
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      buttonBg: '#d97706',
      buttonBgHover: '#b45309',
      buttonShadow: 'rgba(217, 119, 6, 0.3)'
    }
  };

  const style = typeStyles[type] || typeStyles.primary;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)'
      }} onClick={onCancel} />
      <div style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        minWidth: '360px',
        maxWidth: '480px',
        padding: '32px',
        border: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}>
          {icon && (
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: style.iconBg,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ fontSize: '30px', color: style.iconColor }} className="material-symbols-outlined">{icon}</span>
            </div>
          )}
          {title && <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0, lineHeight: 1.3 }}>{title}</h3>}
          {message && (
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.6,
              margin: 0,
              wordBreak: 'normal',
              whiteSpace: 'normal'
            }}>{message}</p>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          marginTop: '32px',
          justifyContent: 'stretch'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px 0',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(226, 232, 240, 0.6)',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.target.style.backgroundColor = '#f8fafc'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px 0',
              backgroundColor: style.buttonBg,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 8px 16px ${style.buttonShadow}`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = style.buttonBgHover;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = style.buttonBg;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;