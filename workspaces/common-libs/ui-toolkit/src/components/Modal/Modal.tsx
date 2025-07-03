
import React, { useEffect, useState } from 'react';
// Styled components using CSS-in-JS
const ModalOverlay = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '28rem',
    width: '100%',
    margin: '0 1rem',
    position: 'relative',
    animation: 'slideIn 0.3s ease-out'
  };



  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  };

  const contentStyle = {
    padding: '1rem'
  };

  const [showModal, setShowModal] = useState(isOpen);

  useEffect(()=>{
    console.log("awf")
    setShowModal(isOpen)
  },[isOpen]);

  return (
    <ModalOverlay isOpen={showModal} onClose={onClose}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#6b7280')}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = '#9ca3af')}
        >
         <span>X</span>
        </button>
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </ModalOverlay>
  );
};