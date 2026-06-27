import React from 'react';
import AuthForm from './AuthForm';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#333'
        }}>&times;</button>
        <AuthForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default LoginModal;
