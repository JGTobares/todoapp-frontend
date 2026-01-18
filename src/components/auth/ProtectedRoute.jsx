// Ruta protegida mejorada
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const { loading, user } = useAuth();

  // Mostrar un loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <LoadingSpinner size={50} />
        <p style={{ fontSize: '18px', color: '#666' }}>Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};
