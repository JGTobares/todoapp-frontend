// Dropdown de usuario con avatar
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function UserDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button
        className="user-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {getInitials()}
        </div>
        <span className="user-name">{user?.username || user?.email}</span>
        <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <div className="user-avatar large">
              {getInitials()}
            </div>
            <div className="user-info">
              <div className="user-info-name">
                {user?.username || user?.email || 'Usuario'}
              </div>
            </div>
          </div>
          
          <div className="user-dropdown-divider"></div>
          
          <button
            className="user-dropdown-item"
            onClick={() => {
              navigate('/dashboard');
              setIsOpen(false);
            }}
          >
            <Settings size={18} />
            <span>Configuración</span>
          </button>
          
          <div className="user-dropdown-divider"></div>
          
          <button
            className="user-dropdown-item danger"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
