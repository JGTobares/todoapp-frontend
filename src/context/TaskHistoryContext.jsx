// Contexto para historial de eventos de tareas
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from './AuthContext';

const TaskHistoryContext = createContext();

export const useTaskHistory = () => {
  const context = useContext(TaskHistoryContext);
  if (!context) {
    throw new Error('useTaskHistory debe usarse dentro de TaskHistoryProvider');
  }
  return context;
};

export function TaskHistoryProvider({ children }) {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const MAX_EVENTS = 20;
  const previousUserIdRef = useRef(null);

  // Obtener el userId del usuario actual
  const getCurrentUserId = useCallback(() => {
    if (!user) return null;
    // El backend puede usar _id o id, intentamos ambos
    const userId = user._id || user.id || null;
    return userId ? String(userId) : null; // Asegurar que sea string para comparaciones
  }, [user]);

  // Obtener la clave de localStorage para el usuario actual
  const getStorageKey = useCallback((userId) => {
    return userId ? `taskHistory-${userId}` : 'taskHistory';
  }, []);

  // Cargar eventos del localStorage al iniciar o cuando cambia el usuario
  useEffect(() => {
    const userId = getCurrentUserId();
    
    // Si el userId cambió, limpiar eventos INMEDIATAMENTE y limpiar localStorage de otros usuarios
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId) {
      // Limpiar eventos del estado inmediatamente
      setEvents([]);
      
      // Limpiar cualquier evento sin userId que pueda estar en localStorage
      try {
        const oldEvents = localStorage.getItem('taskHistory');
        if (oldEvents) {
          localStorage.removeItem('taskHistory');
        }
      } catch (error) {
        // Ignorar errores
      }
    }
    
    // Actualizar la referencia del userId anterior
    previousUserIdRef.current = userId;
    
    if (!userId) {
      // Si no hay usuario, asegurar que los eventos estén vacíos
      setEvents([]);
      // Limpiar cualquier evento sin userId
      try {
        localStorage.removeItem('taskHistory');
      } catch (error) {
        // Ignorar errores
      }
      return;
    }

    const storageKey = getStorageKey(userId);
    let savedEvents = localStorage.getItem(storageKey);
    
    // NO migrar eventos antiguos - solo usar eventos específicos del usuario
    // Esto previene que eventos de otros usuarios se muestren
    
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        // Filtrar eventos antiguos (más de 7 días) y asegurar que pertenecen al usuario actual
        // IMPORTANTE: Eliminar cualquier evento que NO tenga userId o que tenga un userId diferente
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filtered = parsed.filter(event => {
          // Si el evento no tiene userId, eliminarlo
          if (!event.userId) {
            return false;
          }
          const eventUserId = String(event.userId);
          const currentUserIdStr = String(userId);
          // Solo incluir eventos que pertenezcan al usuario actual y sean recientes
          return event.timestamp > sevenDaysAgo && eventUserId === currentUserIdStr;
        });
        
        setEvents(filtered);
        
        // Si se filtraron eventos, actualizar localStorage
        if (filtered.length !== parsed.length) {
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      } catch (error) {
        setEvents([]);
      }
    } else {
      setEvents([]);
    }
  }, [user, getCurrentUserId, getStorageKey]);

  // Guardar eventos en localStorage cuando cambian (solo si hay usuario)
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      // Si no hay usuario, no guardar nada
      return;
    }

    // Verificar que todos los eventos pertenezcan al usuario actual antes de guardar
    // Eliminar cualquier evento sin userId o con userId diferente
    const userEvents = events.filter(e => {
      // Eliminar eventos sin userId
      if (!e.userId) {
        return false;
      }
      const eventUserId = String(e.userId);
      const currentUserIdStr = String(userId);
      return eventUserId === currentUserIdStr;
    });

    // Si hay eventos que no pertenecen al usuario, actualizar el estado
    if (userEvents.length !== events.length) {
      // Actualizar el estado con solo los eventos válidos
      setEvents(userEvents);
      return;
    }

    // Solo guardar si hay eventos válidos
    if (userEvents.length > 0) {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(userEvents));
    } else {
      // Si no hay eventos, limpiar el localStorage para este usuario
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
    }
  }, [events, getCurrentUserId, getStorageKey]);

  const addEvent = useCallback((type, taskId, taskText, additionalData = {}) => {
    const userId = getCurrentUserId();
    if (!userId) {
      return;
    }

    const event = {
      id: `event-${Date.now()}-${Math.random()}`,
      type, // 'created', 'completed', 'uncompleted', 'deleted'
      taskId,
      taskText,
      timestamp: Date.now(),
      userId: String(userId), // Asociar evento al usuario actual (asegurar que sea string)
      ...additionalData
    };

    setEvents(prev => {
      // Filtrar eventos del mismo usuario (por seguridad)
      const userEvents = prev.filter(e => {
        const eventUserId = e.userId ? String(e.userId) : null;
        return eventUserId === userId;
      });
      const newEvents = [event, ...userEvents];
      // Mantener solo los últimos MAX_EVENTS
      return newEvents.slice(0, MAX_EVENTS);
    });
  }, [getCurrentUserId]);

  const clearHistory = useCallback(() => {
    const userId = getCurrentUserId();
    if (userId) {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
    }
    setEvents([]);
  }, [getCurrentUserId, getStorageKey]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'created':
        return Plus;
      case 'completed':
        return CheckCircle;
      case 'uncompleted':
        return XCircle;
      case 'deleted':
        return Trash2;
      default:
        return CheckCircle;
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'created':
        return 'Creada';
      case 'completed':
        return 'Completada';
      case 'uncompleted':
        return 'Marcada como pendiente';
      case 'deleted':
        return 'Eliminada';
      default:
        return 'Evento';
    }
  };

  // Efecto adicional: Limpiar eventos inmediatamente cuando el usuario cambia o se desautentica
  useEffect(() => {
    const userId = getCurrentUserId();
    
    // Si no hay usuario, limpiar eventos inmediatamente
    if (!userId) {
      setEvents(prev => {
        if (prev.length > 0) {
          return [];
        }
        return prev;
      });
      return;
    }
    
    // Filtrar eventos en tiempo real para asegurar que solo se muestren los del usuario actual
    setEvents(prev => {
      const validEvents = prev.filter(e => {
        if (!e.userId) {
          return false; // Eliminar eventos sin userId
        }
        const eventUserId = String(e.userId);
        const currentUserIdStr = String(userId);
        return eventUserId === currentUserIdStr;
      });
      
      // Si hay eventos inválidos, limpiarlos
      if (validEvents.length !== prev.length) {
        return validEvents;
      }
      return prev;
    });
  }, [user, getCurrentUserId]);

  const value = {
    events,
    addEvent,
    clearHistory,
    getEventIcon,
    getEventLabel,
    MAX_EVENTS
  };

  return (
    <TaskHistoryContext.Provider value={value}>
      {children}
    </TaskHistoryContext.Provider>
  );
}
