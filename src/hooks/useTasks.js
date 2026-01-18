// Hook personalizado para manejo de tareas
import { useState, useEffect, useCallback } from 'react';
import { tasksService } from '../services/api.js';
import { useErrorHandler } from './useErrorHandler.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError } = useErrorHandler();
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    // No intentar cargar tareas si no hay usuario autenticado
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    clearError();
    setLoading(true);
    try {
      const response = await tasksService.getAllTasks();

      // El backend puede devolver diferentes formatos:
      // 1. { success: true, data: [...] }
      // 2. { tasks: [...] }
      // 3. Array directo [...]
      let tasksData = [];
      
      if (Array.isArray(response)) {
        // Si es un array directo
        tasksData = response;
      } else if (response.success && response.data) {
        // Formato con success y data
        tasksData = Array.isArray(response.data) ? response.data : [];
      } else if (response.tasks && Array.isArray(response.tasks)) {
        // Formato con propiedad tasks
        tasksData = response.tasks;
      } else if (response.data && Array.isArray(response.data)) {
        // Formato con solo data
        tasksData = response.data;
      } else if (response.error) {
        // Si hay un error en la respuesta
        handleError(new Error(response.error || 'Error al cargar las tareas'));
        setTasks([]);
        return;
      }

      setTasks(tasksData);
    } catch (err) {
      handleError(err);
      
      // Si es error 401, redirigir al login
      if (err.status === 401) {
        logout();
        navigate('/');
      }
      
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user, handleError, clearError, logout, navigate]);

  useEffect(() => {
    // Solo cargar tareas cuando el usuario esté autenticado y la autenticación haya terminado de cargar
    if (!authLoading && user) {
      fetchTasks();
    } else if (!authLoading && !user) {
      // Si no hay usuario y la autenticación terminó de cargar, limpiar tareas
      setTasks([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchTasks]);

  const createTask = useCallback(async (taskData) => {
    clearError();
    try {
      const response = await tasksService.createTask(taskData);

      if (response.success) {
        setTasks((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        handleError(new Error(response.error || 'Error al crear la tarea'));
        return { success: false, error: response.error };
      }
    } catch (err) {
      handleError(err);
      
      if (err.status === 401) {
        logout();
        navigate('/');
      }
      
      return { success: false, error: err.message };
    }
  }, [handleError, clearError, logout, navigate]);

  const updateTask = useCallback(async (id, taskData) => {
    clearError();
    try {
      const response = await tasksService.updateTask(id, taskData);

      if (response.success) {
        setTasks((prev) =>
          prev.map((task) => (task._id === id ? response.data : task))
        );
        return { success: true, data: response.data };
      } else {
        handleError(new Error(response.error || 'Error al actualizar la tarea'));
        return { success: false, error: response.error };
      }
    } catch (err) {
      handleError(err);
      
      if (err.status === 401) {
        logout();
        navigate('/');
      } else if (err.status === 404) {
        // Tarea no encontrada, refrescar lista
        fetchTasks();
      }
      
      return { success: false, error: err.message };
    }
  }, [handleError, clearError, logout, navigate, fetchTasks]);

  const deleteTask = useCallback(async (id) => {
    clearError();
    try {
      const response = await tasksService.deleteTask(id);

      if (response.success) {
        setTasks((prev) => prev.filter((task) => task._id !== id));
        return { success: true };
      } else {
        handleError(new Error(response.error || 'Error al eliminar la tarea'));
        return { success: false, error: response.error };
      }
    } catch (err) {
      handleError(err);
      
      if (err.status === 401) {
        logout();
        navigate('/');
      } else if (err.status === 404) {
        // Tarea no encontrada, refrescar lista
        fetchTasks();
      }
      
      return { success: false, error: err.message };
    }
  }, [handleError, clearError, logout, navigate, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
