// Componente de loading spinner
export function LoadingSpinner({ size = 40, className = '' }) {
  return (
    <div
      className={`loading-spinner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      role="status"
      aria-label="Cargando"
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2979FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
