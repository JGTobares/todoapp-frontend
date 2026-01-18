// AuthContext mejorado con refresh automático y mejor manejo de estado
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, setRefreshTokenFn, setGetContextTokenFn } from '../services/api.js';
import { TOKEN_CONFIG } from '../utils/constants.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTokenRefreshModal, setShowTokenRefreshModal] = useState(false);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshIntervalRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Función para obtener el tiempo de expiración del token
  const getTokenExpiration = useCallback((tokenString) => {
    try {
      if (!tokenString) return null;
      
      // Manejar formato JWT (header.payload.signature)
      const parts = tokenString.split('.');
      if (parts.length >= 2) {
        // Decodificar el payload (segunda parte)
        const payload = parts[1];
        // Agregar padding si es necesario para base64
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
        const tokenData = JSON.parse(decodedPayload);
        
        if (tokenData.exp) {
          return tokenData.exp * 1000; // Convertir a milisegundos
        }
      }
      
      return null;
    } catch (error) {
      // Si falla, asumir que expira en 1 hora (fallback)
      return Date.now() + (60 * 60 * 1000);
    }
  }, []);

  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Limpiar estado
    setToken(null);
    setUser(null);
    setTokenExpirationTime(null);
    setShowTokenRefreshModal(false);
    setIsRefreshing(false);

    // Limpiar intervalos
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Función para refrescar token (usada por el servicio API)
  const refreshToken = useCallback(async () => {
    if (isRefreshing) {
      // Si ya está refrescando, esperar
      return new Promise((resolve, reject) => {
        const checkRefresh = setInterval(() => {
          if (!isRefreshing) {
            clearInterval(checkRefresh);
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
              resolve(currentToken);
            } else {
              reject(new Error('Token no disponible'));
            }
          }
        }, 100);
      });
    }

    setIsRefreshing(true);
    try {
      const response = await authService.refreshToken();

      if (response.success) {
        const { token: newToken, user: updatedUser } = response;
        
        // Guardar en localStorage
        localStorage.setItem('token', newToken);
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Actualizar estado
        setToken(newToken);
        if (updatedUser) {
          setUser(updatedUser);
        }
        
        const expirationTime = getTokenExpiration(newToken);
        setTokenExpirationTime(expirationTime);
        setShowTokenRefreshModal(false);

        return newToken;
      } else {
        throw new Error(response.error || 'Error al refrescar el token');
      }
        } catch (error) {
          // Si el error es 401, el token es inválido, hacer logout
      if (error.status === 401) {
        logout();
      }
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getTokenExpiration, logout]);

  // Configurar función de refresh y obtener token del contexto en el servicio API
  useEffect(() => {
    setRefreshTokenFn(refreshToken);
    
    // Configurar función para obtener token del contexto (más actualizado)
    // Esto permite que el servicio API acceda al token más reciente del contexto
    setGetContextTokenFn(() => token);
  }, [refreshToken, token]);

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Verificar si el token no ha expirado
          const expirationTime = getTokenExpiration(storedToken);

          if (expirationTime && Date.now() < expirationTime) {
            // Verificar token con el servidor
            try {
              await authService.verifyToken();
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
              setTokenExpirationTime(expirationTime);
                } catch (error) {
                  // Si la verificación falla, limpiar
                  logout();
                }
          } else {
            // Token expirado, intentar refresh
            try {
              await refreshToken();
            } catch (error) {
              // Si el refresh falla, limpiar
              logout();
            }
          }
        }
          } catch (error) {
            logout();
          } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [getTokenExpiration, logout, refreshToken]);

  // Monitorear el tiempo de expiración del token y refrescar automáticamente
  useEffect(() => {
    if (!token || !tokenExpirationTime) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    const checkTokenExpiration = () => {
      const now = Date.now();
      const timeUntilExpiration = tokenExpirationTime - now;

      // Si quedan menos de 5 minutos, mostrar el modal
      if (timeUntilExpiration > 0 && timeUntilExpiration <= TOKEN_CONFIG.REFRESH_THRESHOLD) {
        setShowTokenRefreshModal(true);
        
        // Si quedan menos de 2 minutos, refrescar automáticamente
            if (timeUntilExpiration <= 2 * 60 * 1000 && !isRefreshing) {
              refreshToken().catch(() => {
                // Ignorar errores de refresh automático
              });
            }
      } else if (timeUntilExpiration <= 0) {
        // Token expirado
        logout();
      } else {
        setShowTokenRefreshModal(false);
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar periódicamente
    checkIntervalRef.current = setInterval(
      checkTokenExpiration,
      TOKEN_CONFIG.CHECK_INTERVAL
    );

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [token, tokenExpirationTime, isRefreshing, logout, refreshToken]);

  const login = useCallback((loginData) => {
    try {
      const { token: newToken, user: newUser } = loginData;

      // Guardar en localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Actualizar estado
      setToken(newToken);
      setUser(newUser);
      const expirationTime = getTokenExpiration(newToken);
      setTokenExpirationTime(expirationTime);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [getTokenExpiration]);

  const updateSession = useCallback((updateData) => {
    try {
      const { token: newToken, user: updatedUser } = updateData;

      // Si hay un nuevo token, actualizarlo
      if (newToken) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        const expirationTime = getTokenExpiration(newToken);
        setTokenExpirationTime(expirationTime);
        setShowTokenRefreshModal(false);
      }

      // Si hay usuario actualizado, actualizarlo
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [getTokenExpiration]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateSession,
    refreshToken,
    showTokenRefreshModal,
    setShowTokenRefreshModal,
    tokenExpirationTime,
    isRefreshing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
