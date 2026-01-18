// Servicio API mejorado con interceptor de refresh automático
import { ApiError, getErrorMessage } from '../utils/errorHandler.js';
import { API_CONFIG, API_BASE_URL } from '../utils/constants.js';

// URL del backend API (configurada en .env como VITE_BASE_API)
// Se obtiene de constants.js que lee VITE_BASE_API o usa valor por defecto
const API_URL = API_BASE_URL;


// Queue de peticiones durante refresh
let refreshPromise = null;
let requestQueue = [];

// Función para procesar la cola de peticiones
const processQueue = (error, token = null) => {
  requestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  requestQueue = [];
};

// Función para agregar petición a la cola
const enqueueRequest = () => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject });
  });
};

// Función para crear timeout
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ApiError('Request timeout', 408)), ms);
  });
};

// Función para retry con exponential backoff
const retryRequest = async (fn, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // No reintentar en errores 4xx (excepto 401 que se maneja con refresh)
      if (error.status >= 400 && error.status < 500 && error.status !== 401) {
        throw error;
      }
      // Esperar antes del siguiente intento (exponential backoff)
      if (i < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, i))
        );
      }
    }
  }
  throw lastError;
};

// Función para obtener token del localStorage
// También intenta obtener el token más reciente del contexto si está disponible
const getToken = () => {
  // Primero intentar obtener del localStorage (fuente de verdad)
  const storedToken = localStorage.getItem('token');
  
  // Si hay un refresh en curso, esperar a que termine para obtener el token más reciente
  if (refreshPromise) {
    // El token se actualizará cuando el refresh complete
    // Por ahora retornar el token almacenado
    return storedToken;
  }
  
  return storedToken;
};

// Función para refrescar token (debe ser inyectada desde AuthContext)
let refreshTokenFn = null;
let getContextTokenFn = null; // Función para obtener token del contexto

export const setRefreshTokenFn = (fn) => {
  refreshTokenFn = fn;
};

// Función para obtener el token directamente del contexto (más actualizado)
export const setGetContextTokenFn = (fn) => {
  getContextTokenFn = fn;
};

// Función para refrescar token
const refreshToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      if (!refreshTokenFn) {
        throw new Error('Refresh token function not set');
      }
      const newToken = await refreshTokenFn();
      processQueue(null, newToken);
      return newToken;
    } catch (error) {
      processQueue(error, null);
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Función principal para llamadas API
export const apiCall = async (endpoint, options = {}) => {
  // Si hay un refresh en curso, esperar
  if (refreshPromise) {
    await enqueueRequest();
  }

  const makeRequest = async () => {
    // Obtener token - priorizar contexto si está disponible, sino localStorage
    let token = null;
    if (getContextTokenFn) {
      token = getContextTokenFn();
    }
    if (!token) {
      token = getToken();
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const config = {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      // Si hay body, asegurarse de que sea string
      if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
      }

      const fullUrl = `${API_URL}${endpoint}`;
      const method = config.method || 'GET';

      const startTime = Date.now();
      const response = await Promise.race([
        fetch(fullUrl, config),
        createTimeout(API_CONFIG.TIMEOUT),
      ]);
      const duration = Date.now() - startTime;

      clearTimeout(timeoutId);

      // Intentar parsear JSON primero para verificar si es un error de validación
      let data;
      let isValidationError = false;
      try {
        const text = await response.text();
        if (!text) {
          throw new ApiError('Respuesta vacía del servidor', response.status);
        }
        data = JSON.parse(text);
        
        // Verificar si es un error de validación (no de token expirado)
        // Si el mensaje indica un error de validación del backend, no intentar refresh
        if (response.status === 401 && data.error) {
          const errorMsg = typeof data.error === 'string' ? data.error : data.error.message || '';
          // Errores de validación comunes que NO requieren refresh de token
          const validationErrors = [
            'contraseña',
            'password',
            'incorrecta',
            'incorrect',
            'invalid',
            'inválida',
            'validation',
            'validación'
          ];
          isValidationError = validationErrors.some(keyword => 
            errorMsg.toLowerCase().includes(keyword.toLowerCase())
          );
        }
      } catch (parseError) {
        // Si no se puede parsear JSON, probablemente el servidor devolvió HTML o texto
        if (!response.ok) {
          throw new ApiError(
            `El servidor devolvió una respuesta inválida (${response.status}). Verifica que el backend esté disponible.`,
            response.status || 0
          );
        }
        throw new ApiError('Error al procesar la respuesta del servidor', response.status || 0);
      }

      // Si es 401 y NO es un error de validación, intentar refresh y reintentar
      if (response.status === 401 && refreshTokenFn && !isValidationError) {
        try {
          // Refrescar el token - esto actualiza tanto localStorage como el contexto
          const newToken = await refreshToken();
          
          // El token ya está guardado en localStorage y actualizado en el contexto
          // Intentar obtener el token más reciente del contexto si está disponible
          let verifiedToken = newToken;
          
          // Si hay una función para obtener el token del contexto, usarla
          if (getContextTokenFn) {
            const contextToken = getContextTokenFn();
            if (contextToken) {
              verifiedToken = contextToken;
            }
          }
          
          // Si aún no tenemos token, intentar desde localStorage
          if (!verifiedToken) {
            verifiedToken = getToken();
          }
          
          if (!verifiedToken) {
            throw new ApiError('No se pudo obtener el nuevo token', 401);
          }

          // Reconstruir el config para el retry con el nuevo token
          const retryConfig = {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${verifiedToken}`,
              ...options.headers,
            },
          };

          // Reconstruir el body si existe
          if (options.body) {
            if (typeof options.body === 'string') {
              retryConfig.body = options.body;
            } else {
              retryConfig.body = JSON.stringify(options.body);
            }
          }

          const retryResponse = await fetch(`${API_URL}${endpoint}`, retryConfig);
          
          // Parsear la respuesta del retry
          const retryText = await retryResponse.text();
          let retryData;
          try {
            retryData = retryText ? JSON.parse(retryText) : {};
          } catch (parseError) {
            throw new ApiError('Error al procesar la respuesta del servidor', retryResponse.status);
          }

          if (!retryResponse.ok) {
            throw new ApiError(
              retryData.error || retryData.message || 'Error en la petición',
              retryResponse.status,
              retryData.details
            );
          }

          return retryData;
        } catch (refreshError) {
          // Si el refresh falla, lanzar error 401
          if (refreshError instanceof ApiError) {
            throw refreshError;
          }
          throw new ApiError('Sesión expirada', 401);
        }
      }

      if (!response.ok) {
        // Extraer el mensaje de error correctamente
        let errorMessage = 'Error en la petición';
        if (data.error) {
          // Si error es un objeto, extraer el mensaje
          if (typeof data.error === 'object' && data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        throw new ApiError(
          errorMessage,
          response.status,
          data.details || (typeof data.error === 'object' ? data.error : null)
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError' || error.status === 408) {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Error de red u otro error
      const errorMessage = getErrorMessage(error);
      throw new ApiError(
        errorMessage,
        error.status || 0,
        error.details
      );
    }
  };

  // Retry automático para errores de red
  return retryRequest(makeRequest);
};

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      return result;
    } catch (error) {
      // Extraer el mensaje de error correctamente
      let errorMessage = error.message || 'Error al iniciar sesión';
      // Si el mensaje es '[object Object]', intentar extraer de details
      if (errorMessage === '[object Object]' && error.details) {
        if (typeof error.details === 'object' && error.details.message) {
          errorMessage = error.details.message;
        }
      }
      
      // Preservar el status y detalles del error
      return {
        success: false,
        error: errorMessage,
        status: error.status || 0,
        details: error.details || null
      };
    }
  },

  register: async (userData) => {
    try {
      const result = await apiCall('/auth/register', {
        method: 'POST',
        body: userData,
      });
      return result;
    } catch (error) {
      // Extraer el mensaje de error correctamente
      let errorMessage = error.message || 'Error al registrarse';
      // Si el mensaje es '[object Object]', intentar extraer de details
      if (errorMessage === '[object Object]' && error.details) {
        if (typeof error.details === 'object' && error.details.message) {
          errorMessage = error.details.message;
        }
      }
      
      // Preservar el status y detalles del error
      return {
        success: false,
        error: errorMessage,
        status: error.status || 0,
        details: error.details || null
      };
    }
  },

  verifyToken: async () => {
    return await apiCall('/auth/profile');
  },

      updateProfile: async (profileData) => {
        try {
          const result = await apiCall('/auth/profile', {
            method: 'PATCH',
            body: profileData,
          });
          return result;
        } catch (error) {
      // Preservar el status y detalles del error
      return {
        success: false,
        error: error.message || 'Error al actualizar el perfil',
        status: error.status || 0,
        details: error.details || null
      };
    }
  },

  refreshToken: async () => {
    return await apiCall('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Servicio de tareas
export const tasksService = {
  getAllTasks: async (params = {}) => {
    // Parámetros opcionales: page, limit, done
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.done !== undefined) queryParams.append('done', params.done);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return await apiCall(endpoint);
  },

  getTaskById: async (id) => {
    return await apiCall(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return await apiCall('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  updateTask: async (id, taskData) => {
    return await apiCall(`/tasks/${id}`, {
      method: 'PATCH',
      body: taskData,
    });
  },

  deleteTask: async (id) => {
    return await apiCall(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  getTaskStats: async () => {
    return await apiCall('/tasks/stats');
  },
};
