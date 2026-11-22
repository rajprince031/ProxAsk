import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './common.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '540px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="px-modal-backdrop" onClick={onClose}>
      <div
        className="px-modal-container animate-fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-modal-header">
          <div>
            {title && <h3 className="px-modal-title">{title}</h3>}
            {subtitle && <p className="px-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="px-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-modal-body">{children}</div>

        {footer && <div className="px-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
