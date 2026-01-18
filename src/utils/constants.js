// Constantes de la aplicación
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// URL base del API
// Se lee de la variable de entorno VITE_BASE_API (archivo .env)
// Si no está definida, usa la URL de producción por defecto
// Para desarrollo local, crear .env con: VITE_BASE_API=http://localhost:2411
export const API_BASE_URL = import.meta.env.VITE_BASE_API || 'https://todoapp-backend-vtpp.onrender.com';

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT_ERROR: 'La petición tardó demasiado. Intenta nuevamente.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
};

export const TOKEN_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
  CHECK_INTERVAL: 60 * 1000, // Verificar cada minuto
};
