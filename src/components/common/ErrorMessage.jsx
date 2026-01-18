// Componente centralizado para mostrar errores
import { X } from 'lucide-react';

export function ErrorMessage({ error, onClose, className = '' }) {
  if (!error) return null;

  return (
    <div
      className={`error-message ${className}`}
      style={{
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        color: '#c33',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        textAlign: 'center',
      }}
      role="alert"
    >
      <span style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{error}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#c33',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Cerrar mensaje de error"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
