// Componente centralizado para mostrar mensajes de éxito
import { CheckCircle, X } from 'lucide-react';

export function SuccessMessage({ message, onClose, className = '' }) {
  if (!message) return null;

  return (
    <div
      className={`success-message ${className}`}
      style={{
        backgroundColor: '#efe',
        border: '1px solid #cfc',
        color: '#3c3',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <CheckCircle size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#3c3',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Cerrar mensaje de éxito"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
