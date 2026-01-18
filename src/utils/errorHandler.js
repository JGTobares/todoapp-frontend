// Utilidad para manejo de errores
import { ERROR_MESSAGES } from './constants.js';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error.status) {
    switch (error.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  if (error.message?.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const getErrorDetails = (error) => {
  if (error instanceof ApiError && error.details) {
    return error.details;
  }
  return null;
};
