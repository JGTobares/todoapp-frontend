// Modal de refresh de token mejorado
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Clock, X } from "lucide-react";
import { ErrorMessage } from "../common/ErrorMessage";

export function TokenRefreshModal() {
  const { showTokenRefreshModal, setShowTokenRefreshModal, refreshToken, tokenExpirationTime } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("calculando...");

  // Actualizar tiempo restante cada segundo
  useEffect(() => {
    if (!showTokenRefreshModal || !tokenExpirationTime) return;

    const updateTime = () => {
      const now = Date.now();
      const remaining = tokenExpirationTime - now;

      if (remaining <= 0) {
        setTimeRemaining("expirado");
        return;
      }

      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [showTokenRefreshModal, tokenExpirationTime]);

  if (!showTokenRefreshModal) return null;

  const handleRefresh = async () => {
    setError("");
    setLoading(true);

    try {
      await refreshToken();
      setShowTokenRefreshModal(false);
    } catch (err) {
      setError(err.message || "Error al refrescar el token");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setShowTokenRefreshModal(false);
    }
  };

  return (
    <div className="token-refresh-modal-overlay">
      <div className="token-refresh-modal">
        <button
          className="token-refresh-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="token-refresh-modal-header">
          <Clock size={32} className="token-refresh-icon" />
          <h2>Tu sesión está por expirar</h2>
        </div>

        <div className="token-refresh-modal-content">
          <p>
            Tu sesión expirará en <strong>{timeRemaining}</strong>.
          </p>
          <p>
            Para continuar trabajando sin interrupciones, haz clic en el botón para renovar tu sesión.
          </p>

          {error && (
            <ErrorMessage error={error} onClose={() => setError("")} />
          )}
        </div>

        <div className="token-refresh-modal-actions">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-primary token-refresh-btn"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Renovar Sesión
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="btn btn-secondary token-refresh-cancel-btn"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
