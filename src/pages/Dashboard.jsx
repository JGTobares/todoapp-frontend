// Dashboard mejorado con manejo de errores mejorado
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api.js";
import { User, Lock, Save, Eye, EyeOff, Edit2, X } from "lucide-react";
import { useErrorHandler } from "../hooks/useErrorHandler.js";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { SuccessMessage } from "../components/common/SuccessMessage";
import { PasswordStrength } from "../components/common/PasswordStrength";
import { useToastContext } from "../context/ToastContext";

export function Dashboard() {
  const { user, updateSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const { error, handleError, clearError } = useErrorHandler();
  const toast = useToastContext();

  // Función de sanitización de username
  const sanitizeUsername = (value) => {
    // Solo permitir letras, números y guiones bajos (sin espacios)
    return value.replace(/[^a-zA-Z0-9_]/g, '');
  };

  // Validación de username según reglas del backend
  const validateUsername = (username) => {
    if (!username) return null;
    if (username.length < 3) {
      return "El nombre debe tener al menos 3 caracteres";
    }
    if (username.length > 30) {
      return "El nombre no puede tener más de 30 caracteres";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Solo se permiten letras, números y guiones bajos (sin espacios)";
    }
    return null;
  };

  const handleChange = (e) => {
    const fieldName = e.target.name;
    let value = e.target.value;

    // Sanitizar username en tiempo real
    if (fieldName === 'username') {
      value = sanitizeUsername(value);
    }

    setFormData({
      ...formData,
      [fieldName]: value
    });

    // Validar username en tiempo real
    if (fieldName === 'username') {
      const error = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        username: error
      }));
    }

    clearError();
    setApiError(null);
    if (successMessage) setSuccessMessage("");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      username: "",
      currentPassword: "",
      newPassword: ""
    });
    setValidationErrors({});
    setApiError(null);
    clearError();
    setSuccessMessage("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: "",
      currentPassword: "",
      newPassword: ""
    });
    setValidationErrors({});
    setApiError(null);
    clearError();
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");
    setApiError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      const updateData = {};
      
      // Validar username antes de enviar
      if (formData.username && formData.username !== user?.username) {
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
          setValidationErrors({ username: usernameError });
          setLoading(false);
          return;
        }
        updateData.username = formData.username.trim();
      }

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          handleError(new Error("La contraseña actual es requerida para cambiar la contraseña"));
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        handleError(new Error("No hay cambios para actualizar"));
        setLoading(false);
        return;
      }

      const response = await authService.updateProfile(updateData);

      if (response.success) {
        setSuccessMessage("Perfil actualizado correctamente");
        toast.success("✅ Perfil actualizado correctamente");

        if (response.token || response.user) {
          updateSession({
            token: response.token,
            user: response.user
          });
        }

        setFormData({
          username: "",
          currentPassword: "",
          newPassword: ""
        });
        setValidationErrors({});
        setIsEditing(false); // Salir del modo edición después de guardar exitosamente

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        // Manejar errores de validación del servidor
        if (response.status === 400 && response.details && Array.isArray(response.details)) {
          const serverErrors = {};
          response.details.forEach(detail => {
            if (detail.field) {
              serverErrors[detail.field] = detail.message;
            }
          });
          setValidationErrors(serverErrors);
          setApiError({
            type: 'validation',
            message: response.error || "Errores de validación",
            details: response.details
          });
        } else {
          handleError(new Error(response.error || "Error al actualizar el perfil"));
        }
      }
    } catch (err) {
      // Manejar errores de excepción
      if (err.status === 400 && err.details && Array.isArray(err.details)) {
        const serverErrors = {};
        err.details.forEach(detail => {
          if (detail.field) {
            serverErrors[detail.field] = detail.message;
          }
        });
        setValidationErrors(serverErrors);
        setApiError({
          type: 'validation',
          message: err.message || "Errores de validación",
          details: err.details
        });
      } else {
        handleError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Mi Perfil</h1>
        <p className="dashboard-subtitle">
          Actualiza tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-form-header">
            <User size={32} className="profile-icon" />
            <h2>Información de la Cuenta</h2>
          </div>

          <ErrorMessage error={error} onClose={clearError} />
          <SuccessMessage message={successMessage} onClose={() => setSuccessMessage("")} />

          {/* Error de validación del servidor - Más visible */}
          {apiError && apiError.type === 'validation' && (
            <div className="error-message error-validation" role="alert" style={{ 
              animation: 'shake 0.5s ease-in-out',
              marginBottom: '10px',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  Errores de Validación del Servidor
                </strong>
              </div>
              <p style={{ margin: '0.5rem 0', fontWeight: 500, textAlign: 'center' }}>{apiError.message}</p>
              {apiError.details && apiError.details.length > 0 && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  background: 'rgba(220, 53, 69, 0.1)', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #dc3545'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    Detalles del error:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                    {apiError.details.map((detail, index) => (
                      <li key={index} style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>
                        <strong style={{ textTransform: 'capitalize' }}>
                          {detail.field === 'username' ? 'Nombre de usuario' : detail.field}:
                        </strong>{' '}
                        <span style={{ color: '#721c24' }}>{detail.message}</span>
                        {detail.value && (
                          <span style={{ 
                            display: 'block', 
                            color: '#856404', 
                            fontSize: '0.85em', 
                            marginTop: '0.25rem',
                            fontStyle: 'italic'
                          }}>
                            Valor ingresado: "{detail.value}"
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!isEditing ? (
            // Vista de solo lectura
            <div className="profile-info-view">
              <div className="profile-info-item">
                <label>Email</label>
                <div className="profile-info-value">
                  <span>{user?.email || "No disponible"}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <label>Nombre de Usuario</label>
                <div className="profile-info-value">
                  <span>{user?.username || "No disponible"}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <label>Contraseña</label>
                <div className="profile-info-value">
                  <span>••••••••</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary profile-edit-btn"
                onClick={handleEditClick}
              >
                <Edit2 size={20} />
                Editar Perfil
              </button>
            </div>
          ) : (
            // Vista de edición
            <form className="profile-form" onSubmit={handleSubmit} autoComplete="off">
              {/* Campo oculto para engañar a los gestores de contraseñas */}
              <input type="text" name="fake-username" autoComplete="username" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', tabIndex: -1 }} readOnly />
              <input type="password" name="fake-password" autoComplete="current-password" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', tabIndex: -1 }} readOnly />
              
              <div className="form-group">
                <label htmlFor="profile-username">Nombre de Usuario</label>
                <input
                  id="profile-username"
                  name="profile-username"
                  type="text"
                  placeholder="Ingresa tu nombre de usuario"
                  value={formData.username}
                  onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'username', value: e.target.value } })}
                  disabled={loading}
                  className={`form-input ${validationErrors.username ? 'invalid' : formData.username && formData.username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username) ? 'valid' : ''}`}
                  style={validationErrors.username ? {
                    borderColor: '#dc3545',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.15)',
                    animation: 'shake 0.3s ease-in-out'
                  } : {}}
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  title="Solo letras, números y guiones bajos (sin espacios)"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                />
                {validationErrors.username && (
                  <div className="form-help-text invalid" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(220, 53, 69, 0.1)',
                    borderRadius: '6px',
                    borderLeft: '3px solid #dc3545',
                    marginTop: '0.5rem',
                    animation: 'pulse 0.5s ease-in-out'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <strong style={{ color: '#dc3545' }}>{validationErrors.username}</strong>
                  </div>
                )}
                {!validationErrors.username && formData.username && (
                  <small className={`form-help-text ${formData.username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username) ? 'valid' : 'invalid'}`}>
                    {formData.username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username)
                      ? '✓ Nombre de usuario válido' 
                      : formData.username.length < 3
                      ? 'El nombre debe tener al menos 3 caracteres'
                      : 'Solo se permiten letras, números y guiones bajos'}
                  </small>
                )}
                {!formData.username && !validationErrors.username && (
                  <small className="form-help-text">
                    Deja este campo vacío si no deseas cambiar tu nombre de usuario
                  </small>
                )}
              </div>

              <div className="password-section">
                <div className="password-section-header">
                  <Lock size={20} />
                  <h3>Cambiar Contraseña</h3>
                </div>
                <p className="password-section-description">
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>

                <div className="form-group">
                  <label htmlFor="profile-current-password">Contraseña Actual</label>
                  <div className="password-input-wrapper">
                    <input
                      id="profile-current-password"
                      name="profile-current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña actual"
                      value={formData.currentPassword}
                      onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'currentPassword', value: e.target.value } })}
                      disabled={loading}
                      className="form-input"
                      autoComplete="new-password"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={loading}
                      aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-new-password">Nueva Contraseña</label>
                  <div className="password-input-wrapper">
                    <input
                      id="profile-new-password"
                      name="profile-new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                      value={formData.newPassword}
                      onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'newPassword', value: e.target.value } })}
                      disabled={loading}
                      className="form-input"
                      minLength={8}
                      autoComplete="new-password"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.newPassword && (
                    <PasswordStrength password={formData.newPassword} />
                  )}
                  {!formData.newPassword && (
                    <small className="form-help-text">
                      Mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
                    </small>
                  )}
                </div>
              </div>

              <div className="profile-form-buttons">
                <button
                  type="submit"
                  className="btn btn-primary profile-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save size={20} />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary profile-cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <X size={20} />
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
