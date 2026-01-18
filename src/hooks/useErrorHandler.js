// Hook personalizado para manejo de errores
import { useState, useCallback } from 'react';
import { getErrorMessage, getErrorDetails } from '../utils/errorHandler.js';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleError = useCallback((err) => {
    const message = getErrorMessage(err);
    const details = getErrorDetails(err);
    setError(message);
    setErrorDetails(details);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
  }, []);

  return {
    error,
    errorDetails,
    handleError,
    clearError,
  };
};
