// Página de tareas mejorada con estadísticas, filtros, búsqueda y animaciones
import { useState, useEffect, useCallback, useMemo } from "react";
import { Mic, Square, CheckCircle, XCircle, Trash2, Search, Filter, BarChart3, Type } from "lucide-react";
import { useTasks } from "../hooks/useTasks.js";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useToastContext } from "../context/ToastContext";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { useTaskHistory } from "../context/TaskHistoryContext";

const FILTER_OPTIONS = {
  ALL: 'all',
  PENDING: 'pending',
  COMPLETED: 'completed',
};

const TAB_OPTIONS = {
  VOICE: 'voice',
  TEXT: 'text',
};

export function Home() {
  const [activeTab, setActiveTab] = useState(TAB_OPTIONS.VOICE);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [textTaskInput, setTextTaskInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, taskId: null, taskText: null });
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const toast = useToastContext();
  const { addEvent } = useTaskHistory();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  }, [tasks]);

  // Filtrar y buscar tareas
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Aplicar filtro
    if (filter === FILTER_OPTIONS.PENDING) {
      filtered = filtered.filter(t => !t.done);
    } else if (filter === FILTER_OPTIONS.COMPLETED) {
      filtered = filtered.filter(t => t.done);
    }

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.text.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tasks, filter, searchQuery]);

  // Configurar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "es-AR";
      recog.continuous = true;
      recog.interimResults = false;

      recog.onresult = (event) => {
        const rawTranscript = event.results[event.results.length - 1][0].transcript.trim();
        if (!rawTranscript || rawTranscript.length < 2) return;

        let transcript = rawTranscript.toLowerCase();
        transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
        if (!transcript.endsWith(".")) transcript += ".";

        addTask(transcript);
      };

      recog.onerror = (err) => {
        if (err.error === 'no-speech') {
          // No hacer nada, es normal
        } else {
          setListening(false);
        }
      };

      setRecognition(recog);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !listening) {
      try {
          setListening(true);
          recognition.start();
          toast.success("🎤 Grabación iniciada");
        } catch (error) {
          setListening(false);
          toast.error("Error al iniciar la grabación");
        }
    }
  }, [recognition, listening, toast]);

  const stopListening = useCallback(() => {
    if (recognition && listening) {
      try {
          recognition.stop();
          setListening(false);
          toast.info("Grabación detenida");
        } catch (error) {
          setListening(false);
        }
    }
  }, [recognition, listening, toast]);

  const addTask = useCallback(async (text) => {
    if (!text || !text.trim()) {
      toast.error("Por favor ingresa una tarea válida");
      return;
    }

    const result = await createTask({ text: text.trim() });
    if (result.success) {
      toast.success("✅ Tarea creada exitosamente");
      // Registrar evento de creación
      if (result.data?._id && result.data?.text) {
        addEvent('created', result.data._id, result.data.text);
      }
      setTextTaskInput(""); // Limpiar input después de agregar
    }
  }, [createTask, toast, addEvent]);

  const handleTextSubmit = useCallback(async (e) => {
    e.preventDefault();
    await addTask(textTaskInput);
  }, [textTaskInput, addTask]);

  const toggleTask = useCallback(async (id, currentDone) => {
    // Obtener el texto de la tarea antes de actualizar
    const task = tasks.find(t => t._id === id);
    const taskText = task?.text || 'Tarea';
    
    const result = await updateTask(id, { done: !currentDone });
    if (result.success) {
      toast.success(currentDone ? "Tarea marcada como pendiente" : "✅ Tarea completada");
      // Registrar evento de actualización
      addEvent(currentDone ? 'uncompleted' : 'completed', id, taskText);
    }
  }, [updateTask, toast, addEvent, tasks]);

  const handleDeleteClick = useCallback((id) => {
    const task = tasks.find(t => t._id === id);
    setShowDeleteModal({ show: true, taskId: id, taskText: task?.text || 'Tarea' });
  }, [tasks]);

  const handleDeleteConfirm = useCallback(async () => {
    if (showDeleteModal.taskId) {
      const taskText = showDeleteModal.taskText || 'Tarea';
      const result = await deleteTask(showDeleteModal.taskId);
      if (result.success) {
        toast.success("🗑️ Tarea eliminada");
        // Registrar evento de eliminación
        addEvent('deleted', showDeleteModal.taskId, taskText);
      }
      setShowDeleteModal({ show: false, taskId: null, taskText: null });
    }
  }, [showDeleteModal.taskId, showDeleteModal.taskText, deleteTask, toast, addEvent]);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Administrador de Tareas</h1>
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <BarChart3 size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-content">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Progreso</div>
          </div>
        </div>
      </div>

      {/* Tabs para seleccionar método de agregar tarea */}
      <div className="add-task-tabs">
        <button
          className={`tab-button ${activeTab === TAB_OPTIONS.VOICE ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_OPTIONS.VOICE)}
        >
          <Mic size={18} />
          <span>Por Voz</span>
        </button>
        <button
          className={`tab-button ${activeTab === TAB_OPTIONS.TEXT ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_OPTIONS.TEXT)}
        >
          <Type size={18} />
          <span>Por Texto</span>
        </button>
      </div>

      {/* Contenido según el tab activo */}
      {activeTab === TAB_OPTIONS.VOICE ? (
        <div className="tab-content">
          <div className="controls">
            <button 
              onClick={startListening} 
              disabled={listening || loading} 
              className={`btn btn-primary recording-btn ${listening ? 'recording' : ''}`}
              aria-label="Iniciar grabación"
            >
              {listening ? (
                <>
                  <div className="pulse-ring"></div>
                  <Mic size={18} />
                </>
              ) : (
                <Mic size={18} />
              )}
            </button>
            <button 
              onClick={stopListening} 
              disabled={!listening} 
              className="btn btn-secondary"
              aria-label="Detener grabación"
            >
              <Square size={18} />
            </button>
          </div>

          {/* Indicador de grabación */}
          <div className={`recording-indicator ${listening ? '' : 'hidden'}`}>
            <div className="pulse-dot"></div>
            <span>🎤 Escuchando... Di tu tarea</span>
          </div>
        </div>
      ) : (
        <div className="tab-content">
          <form className="text-task-form" onSubmit={handleTextSubmit}>
            <div className="text-input-wrapper">
              <input
                type="text"
                placeholder="Escribe tu tarea aquí..."
                value={textTaskInput}
                onChange={(e) => setTextTaskInput(e.target.value)}
                className="text-task-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !textTaskInput.trim()}
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="filters-container">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === FILTER_OPTIONS.ALL ? 'active' : ''}`}
            onClick={() => setFilter(FILTER_OPTIONS.ALL)}
          >
            <Filter size={16} />
            Todas
          </button>
          <button
            className={`filter-btn ${filter === FILTER_OPTIONS.PENDING ? 'active' : ''}`}
            onClick={() => setFilter(FILTER_OPTIONS.PENDING)}
          >
            Pendientes
          </button>
          <button
            className={`filter-btn ${filter === FILTER_OPTIONS.COMPLETED ? 'active' : ''}`}
            onClick={() => setFilter(FILTER_OPTIONS.COMPLETED)}
          >
            Completadas
          </button>
        </div>
      </div>

      <ErrorMessage error={error} />

      {loading ? (
        <LoadingSpinner size={50} />
      ) : (
        <>
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              {searchQuery || filter !== FILTER_OPTIONS.ALL ? (
                <>
                  <p>No se encontraron tareas con los filtros aplicados</p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setFilter(FILTER_OPTIONS.ALL);
                    }}
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <p>No tienes tareas. ¡Agrega una nueva usando el micrófono o escribiendo!</p>
              )}
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li key={task._id} className="task-item" data-task-id={task._id}>
                  <div className="task-content">
                    <span className={task.done ? "task-text done" : "task-text"}>
                      {task.text}
                    </span>
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button 
                      onClick={() => toggleTask(task._id, task.done)} 
                      className="btn btn-accent"
                      aria-label={task.done ? "Marcar como pendiente" : "Marcar como completada"}
                    >
                      {task.done ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(task._id)} 
                      className="btn btn-danger"
                      aria-label="Eliminar tarea"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={showDeleteModal.show}
        onClose={() => setShowDeleteModal({ show: false, taskId: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar tarea"
        message="¿Estás seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
