// Página de autenticación
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api.js";
import { useErrorHandler } from "../hooks/useErrorHandler.js";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { SuccessMessage } from "../components/common/SuccessMessage";
import { Eye, EyeOff } from "lucide-react";

export function AuthPage() {

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const navigate = useNavigate();
  const { login } = useAuth();

  // Validación de UI (formato de campos) - Protección del backend
  const validateForm = () => {
    const errors = {};

    // Validación de username (solo en registro)
    if (!isLogin) {
      const username = formData.username.trim();
      
      if (!username) {
        errors.username = "El nombre de usuario es requerido";
      } else if (username.length < 3) {
        errors.username = "El nombre debe tener al menos 3 caracteres";
      } else if (username.length > 30) {
        errors.username = "El nombre no puede tener más de 30 caracteres";
      } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]+$/.test(username)) {
        errors.username = "Solo se permiten letras, números, espacios, guiones y guiones bajos";
      } else if (/^\s|\s$/.test(username)) {
        errors.username = "El nombre no puede empezar o terminar con espacios";
      } else if (/\s{2,}/.test(username)) {
        errors.username = "No se permiten espacios múltiples";
      }
    }

    // Validación de email
    const email = formData.email.trim();
    
    if (!email) {
      errors.email = "El email es requerido";
    } else if (email.length > 100) {
      errors.email = "El email no puede tener más de 100 caracteres";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "El formato del email no es válido";
    } else if (!/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = "El email contiene caracteres no permitidos";
    } else if (email.includes('..') || email.includes('@@')) {
      errors.email = "El formato del email no es válido";
    } else if (email.startsWith('.') || email.startsWith('@') || email.startsWith('+')) {
      errors.email = "El email no puede empezar con . @ o +";
    }

    // Validación de password
    const password = formData.password;
    
    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (password.length > 128) {
      errors.password = "La contraseña no puede tener más de 128 caracteres";
    } else if (/\s/.test(password)) {
      errors.password = "La contraseña no puede contener espacios";
    } else if (!/^[\x20-\x7E]+$/.test(password)) {
      errors.password = "La contraseña contiene caracteres no permitidos";
    }

    return errors;
  };

  // Sanitizar input para prevenir inyección
  const sanitizeInput = (value, fieldType) => {
    let sanitized = value;
    
    // Remover caracteres peligrosos según el tipo de campo
    if (fieldType === 'username') {
      // Solo permitir letras, números, espacios, guiones y guiones bajos
      sanitized = sanitized.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '');
      // Limitar longitud
      if (sanitized.length > 30) {
        sanitized = sanitized.substring(0, 30);
      }
    } else if (fieldType === 'email') {
      // Para email, solo remover caracteres realmente peligrosos pero mantener formato
      sanitized = sanitized.replace(/[<>\"'`]/g, '');
      // Limitar longitud
      if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
      }
    } else if (fieldType === 'password') {
      // Para password, remover espacios y caracteres de control
      sanitized = sanitized.replace(/\s/g, '');
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      // Limitar longitud
      if (sanitized.length > 128) {
        sanitized = sanitized.substring(0, 128);
      }
    }
    
    return sanitized;
  };

  const handleChange = (e) => {
    const fieldId = e.target.id;
    const fieldType = fieldId === 'username' ? 'username' : 
                     fieldId === 'email' ? 'email' : 
                     fieldId === 'password' ? 'password' : 'text';
    
    // Sanitizar el valor antes de guardarlo
    const sanitizedValue = sanitizeInput(e.target.value, fieldType);
    
    setFormData({
      ...formData,
      [fieldId]: sanitizedValue
    });
    
    // Limpiar errores al escribir
    if (validationErrors[fieldId]) {
      setValidationErrors({
        ...validationErrors,
        [fieldId]: null
      });
    }
    
    clearError();
    setApiError(null);
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    clearError();
    setSuccessMessage("");
    setApiError(null);
    setValidationErrors({});
    setLoading(true);

    // Validación de UI antes de enviar
    const uiErrors = validateForm();
    if (Object.keys(uiErrors).length > 0) {
      setValidationErrors(uiErrors);
      setLoading(false);
      return;
    }

    try {
      // Sanitizar datos antes de enviar
      const sanitizedData = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      if (!isLogin) {
        sanitizedData.username = formData.username.trim();
      }

      if (isLogin) {
        // Login
        const response = await authService.login({
          email: sanitizedData.email,
          password: sanitizedData.password
        });

        // El backend puede devolver { token, user } o { success, token, user }
        if (response.token && response.user) {
          // Formato del backend: { token, user, ... }
          login({ token: response.token, user: response.user });
          navigate("/mis-tareas");
        } else if (response.success && response.token && response.user) {
          // Formato alternativo: { success: true, token, user }
          login({ token: response.token, user: response.user });
          navigate("/mis-tareas");
        } else {
          // Error en login
          setApiError({
            type: response.status === 400 ? 'validation' : 'http',
            message: response.error || response.message || "Error al iniciar sesión",
            details: response.details || null
          });
        }
      } else {
        // Registro
        const response = await authService.register({
          username: sanitizedData.username,
          email: sanitizedData.email,
          password: sanitizedData.password
        });

        // El backend devuelve { token, user, message, ... } cuando es exitoso
        if (response.token && response.user) {
          // Registro exitoso - hacer login automático y navegar al dashboard
          login({ token: response.token, user: response.user });
          setSuccessMessage("¡Registro exitoso! Redirigiendo...");
          
          // Navegar al dashboard después de un breve delay
          setTimeout(() => {
            navigate("/mis-tareas");
          }, 500);
        } else if (response.success && response.token && response.user) {
          // Formato alternativo con success flag
          login({ token: response.token, user: response.user });
          setSuccessMessage("¡Registro exitoso! Redirigiendo...");
          
          setTimeout(() => {
            navigate("/mis-tareas");
          }, 500);
        } else {
          // Error en registro
          let errorType = 'http';
          
          // Manejar diferentes tipos de errores
          if (response.status === 400) {
            errorType = 'validation';
          } else if (response.status === 429) {
            errorType = 'http';
            // Error 429: Too Many Requests
            const retryAfter = response.retryAfter || response.details?.retryAfter;
            const errorMsg = response.message || response.error || "Demasiados intentos de registro";
            setApiError({
              type: errorType,
              message: `${errorMsg}${retryAfter ? `. Intenta de nuevo en ${retryAfter}` : '. Intenta más tarde'}`,
              details: response.details || null
            });
            return; // Salir temprano para evitar el setApiError duplicado
          } else if (response.status === 0 || response.status >= 500) {
            errorType = 'connection';
          }
          
          // Mensaje más descriptivo
          let errorMessage = "Error al registrarse";
          
          // Extraer el mensaje correctamente (puede ser string u objeto)
          if (response.error) {
            if (typeof response.error === 'string') {
              errorMessage = response.error;
            } else if (typeof response.error === 'object' && response.error.message) {
              errorMessage = response.error.message;
            }
          } else if (response.message) {
            errorMessage = response.message;
          }
          
          if (response.status === 0) {
            errorMessage = "No se pudo conectar con el servidor. Verifica que el backend esté disponible.";
          } else if (response.status === 404) {
            errorMessage = `Ruta no encontrada (404). Verifica que el endpoint ${response.details?.path || '/api/auth/register'} exista en el backend.`;
          } else if (response.status >= 500) {
            errorMessage = `Error del servidor (${response.status}). ${errorMessage || "Intenta más tarde"}`;
          }
          
          setApiError({
            type: errorType,
            message: errorMessage,
            details: response.details || null
          });
        }
      }
    } catch (err) {
      // Determinar tipo de error desde la excepción
      let errorType = 'connection';
      let errorMessage = err.message || "Error desconocido";
      
      if (err.status === 400) {
        errorType = 'validation';
        errorMessage = err.message || "Errores de validación";
      } else if (err.status >= 500 || err.status === 0) {
        errorType = 'connection';
        errorMessage = err.message || "Error de conexión con el servidor";
      } else if (err.status >= 400) {
        errorType = 'http';
        errorMessage = err.message || "Error en la petición";
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        errorType = 'connection';
        errorMessage = "Error de conexión. Verifica tu internet o que el servidor esté corriendo.";
      } else if (err.message?.includes('timeout')) {
        errorType = 'connection';
        errorMessage = "La petición tardó demasiado. Verifica tu conexión.";
      }

      setApiError({
        type: errorType,
        message: errorMessage,
        details: err.details || null
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setSuccessMessage("");
    setValidationErrors({});
    setApiError(null);
    setFormData({
      username: "",
      email: "",
      password: ""
    });
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isLogin ? "Login" : "Registro"}</h2>


      {/* Error de conexión/HTTP */}
      {apiError && apiError.type === 'connection' && (
        <div className="error-message error-connection">
          <strong>🔌 Error de Conexión</strong>
          <p>{apiError.message}</p>
          <small>Verifica que el servidor esté corriendo y tu conexión a internet.</small>
        </div>
      )}

      {/* Error HTTP (no conexión, no validación) */}
      {apiError && apiError.type === 'http' && (
        <div className="error-message error-http">
          <strong>⚠️ Error en la Petición</strong>
          <p>{apiError.message}</p>
        </div>
      )}

      {/* Error de validación del servidor */}
      {apiError && apiError.type === 'validation' && (
        <div className="error-message error-validation">
          <strong>❌ Errores de Validación del Servidor</strong>
          <p>{apiError.message}</p>
          {apiError.details && (
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {Object.entries(apiError.details).map(([field, message]) => (
                <li key={field}>{field}: {message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ErrorMessage error={error} onClose={clearError} />
      <SuccessMessage message={successMessage} onClose={() => setSuccessMessage("")} />

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu nombre"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className={validationErrors.username ? 'invalid' : ''}
              maxLength={30}
              pattern="[a-zA-Z0-9\u00E0-\u00FC\u00C0-\u00DC\u00F1\u00D1\s_-]+"
              title="Solo letras, números, espacios, guiones y guiones bajos"
            />
            {validationErrors.username && (
              <span className="field-error">⚠️ {validationErrors.username}</span>
            )}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Ingresa tu email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className={validationErrors.email ? 'invalid' : ''}
            maxLength={100}
            autoComplete="email"
          />
          {validationErrors.email && (
            <span className="field-error">⚠️ {validationErrors.email}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              maxLength={128}
              className={validationErrors.password ? 'invalid' : ''}
              autoComplete={isLogin ? "current-password" : "new-password"}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea'
              }}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.password && (
            <span className="field-error">⚠️ {validationErrors.password}</span>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary submit"
          disabled={loading}
        >
          {loading ? "Cargando..." : (isLogin ? "Ingresar" : "Registrarse")}
        </button>
      </form>
      <button
        className="btn btn-secondary toggle-btn"
        onClick={toggleMode}
        disabled={loading}
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
