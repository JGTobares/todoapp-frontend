// Ruta pública mejorada
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  // Si está autenticado, redirigir a las tareas
  if (user) {
    return <Navigate to="/mis-tareas" replace />;
  }

  // Si NO está autenticado, mostrar la página pública (login/registro)
  return children;
};
