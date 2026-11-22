import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="px-toast__icon px-toast__icon--success" />;
      case 'error':
        return <AlertCircle size={16} className="px-toast__icon px-toast__icon--error" />;
      case 'warning':
        return <AlertTriangle size={16} className="px-toast__icon px-toast__icon--warning" />;
      default:
        return <Info size={16} className="px-toast__icon px-toast__icon--info" />;
    }
  };

  return (
    <div className="px-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`px-toast px-toast--${toast.type || 'info'}`} data-testid={`toast-${toast.type || 'info'}`}>
          <div className="px-toast__content">
            {getIcon(toast.type)}
            <div className="px-toast__text-wrap">
              {toast.title && <div className="px-toast__title">{toast.title}</div>}
              <span className="px-toast__message">{toast.message}</span>
            </div>
          </div>
          <button
            type="button"
            className="px-toast__close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
