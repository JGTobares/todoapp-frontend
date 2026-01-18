// Componente Breadcrumbs
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  '/': 'Inicio',
  '/mis-tareas': 'Mis Tareas',
  '/dashboard': 'Dashboard',
  '/tutorial': 'Tutorial',
};

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (location.pathname === '/') return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <Home size={16} />
            <span>Inicio</span>
          </Link>
        </li>
        {paths.map((path, index) => {
          const routePath = '/' + paths.slice(0, index + 1).join('/');
          const isLast = index === paths.length - 1;
          const label = routeLabels[routePath] || path.charAt(0).toUpperCase() + path.slice(1);

          return (
            <li key={routePath} className="breadcrumb-item">
              <ChevronRight size={16} className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current">{label}</span>
              ) : (
                <Link to={routePath} className="breadcrumb-link">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
