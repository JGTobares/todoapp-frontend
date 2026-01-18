// Menú móvil hamburger
import { Link, useLocation } from 'react-router-dom';
import { X, Home, BookOpen, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose} />
      <div className="mobile-menu">
        <div className="mobile-menu-header">
          <h3>Menú</h3>
          <button
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <Link
            to="/tutorial"
            className={`mobile-menu-item ${isActive('/tutorial') ? 'active' : ''}`}
            onClick={onClose}
          >
            <BookOpen size={20} />
            <span>¿Cómo se usa?</span>
          </Link>

          {user && (
            <>
              <Link
                to="/mis-tareas"
                className={`mobile-menu-item ${isActive('/mis-tareas') ? 'active' : ''}`}
                onClick={onClose}
              >
                <Home size={20} />
                <span>Mis tareas</span>
              </Link>
              <div className="mobile-menu-divider"></div>
              <div className="mobile-menu-user-info">
                <div className="mobile-menu-user-avatar">
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="mobile-menu-user-name">{user?.username || 'Usuario'}</div>
                  <div className="mobile-menu-user-email">{user?.email}</div>
                </div>
              </div>
              <button
                className="mobile-menu-item danger"
                onClick={handleLogout}
              >
                <LogIn size={20} />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
