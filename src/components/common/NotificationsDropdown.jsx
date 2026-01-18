// Dropdown de historial de eventos de tareas
import { useState, useRef, useEffect, useMemo } from 'react';
import { History, X } from 'lucide-react';
import { useTaskHistory } from '../../context/TaskHistoryContext';
import { useAuth } from '../../context/AuthContext';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { events, clearHistory, getEventIcon, getEventLabel, MAX_EVENTS } = useTaskHistory();
  const { user } = useAuth();

  // Obtener el userId del usuario actual
  const currentUserId = useMemo(() => {
    if (!user) return null;
    const userId = user._id || user.id || null;
    return userId ? String(userId) : null;
  }, [user]);

  // Filtrar eventos para mostrar solo los del usuario actual (capa extra de seguridad)
  const filteredEvents = useMemo(() => {
    if (!currentUserId) {
      // Si no hay usuario, no mostrar ningún evento
      return [];
    }
    
    // Filtrar eventos: solo los que tienen userId y coinciden con el usuario actual
    const filtered = events.filter(event => {
      // Si el evento no tiene userId, eliminarlo
      if (!event.userId) {
        return false;
      }
      const eventUserId = String(event.userId);
      const currentUserIdStr = String(currentUserId);
      return eventUserId === currentUserIdStr;
    });
    
    return filtered;
  }, [events, currentUserId]);

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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Hace un momento';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const displayedEvents = filteredEvents.slice(0, MAX_EVENTS);

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        className="notifications-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Historial de eventos"
        aria-expanded={isOpen}
      >
        <History size={20} />
        {filteredEvents.length > 0 && (
          <span className="notifications-badge">{filteredEvents.length > 99 ? '99+' : filteredEvents.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown-menu">
          <div className="notifications-header">
            <h3>Historial de Eventos</h3>
            {filteredEvents.length > 0 && (
              <button
                className="notifications-clear-btn"
                onClick={clearHistory}
                aria-label="Limpiar historial"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="notifications-list scrollable">
            {displayedEvents.length === 0 ? (
              <div className="notifications-empty">
                <History size={32} />
                <p>No hay eventos registrados</p>
                <small>Los eventos de tareas aparecerán aquí</small>
              </div>
            ) : (
              displayedEvents.map((event) => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className={`notification-item event-${event.type}`}
                    data-task-id={event.taskId}
                  >
                    <div className="notification-icon">
                      <IconComponent size={16} data-event-type={event.type} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">
                        <strong>{getEventLabel(event.type)}:</strong> {event.taskText}
                      </p>
                      <span className="notification-time">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {filteredEvents.length > MAX_EVENTS && (
            <div className="notifications-footer">
              <small>Mostrando los últimos {MAX_EVENTS} de {filteredEvents.length} eventos</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
