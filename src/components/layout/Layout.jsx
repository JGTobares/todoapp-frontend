// Layout mejorado con menú hamburger, indicador de ruta activa y dropdown
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TokenRefreshModal } from "../auth/TokenRefreshModal";
import { UserDropdown } from "../common/UserDropdown";
import { NotificationsDropdown } from "../common/NotificationsDropdown";
import { MobileMenu } from "../common/MobileMenu";
import { Mic, Menu } from "lucide-react";
import { useState } from "react";

export function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo">
            <Mic size={24} />
            <span>TodoApp</span>
          </Link>
          
          <nav className="nav-desktop">
            <Link 
              to="/tutorial" 
              className={`nav-link ${isActive('/tutorial') ? 'active' : ''}`}
            >
              ¿Cómo se usa?
            </Link>
            {user && (
              <Link 
                to="/mis-tareas" 
                className={`nav-link ${isActive('/mis-tareas') ? 'active' : ''}`}
              >
                Mis tareas
              </Link>
            )}
          </nav>
        </div>

        <div className="header-right">
          {user && (
            <>
              <NotificationsDropdown />
              <UserDropdown user={user} />
            </>
          )}
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 TodoApp</p>
          <div className="footer-links">
            <Link to="/tutorial">Ayuda</Link>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Términos</a>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacidad</a>
          </div>
        </div>
      </footer>

      <TokenRefreshModal />
    </div>
  );
}
