// Sistema de Toast notifications
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: '#4caf50' },
  error: { icon: XCircle, color: '#f44336' },
  info: { icon: Info, color: '#2196f3' },
  warning: { icon: AlertTriangle, color: '#ff9800' },
};

export function Toast({ id, message, type = 'info', duration = 5000, onClose }) {
  const Icon = TOAST_TYPES[type]?.icon || TOAST_TYPES.info.icon;
  const color = TOAST_TYPES[type]?.color || TOAST_TYPES.info.color;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div 
      className="toast"
      style={{
        borderLeft: `4px solid ${color}`,
      }}
      role="alert"
    >
      <div className="toast-content">
        <Icon size={20} style={{ color }} />
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
