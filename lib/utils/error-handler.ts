/**
 * Comprehensive Error Handling Utilities
 * Centralized error handling for the attendance management system
 */

export interface ErrorLog {
  timestamp: string;
  context: string;
  error: string;
  stack?: string;
  userId?: string;
  userAgent?: string;
}

/**
 * Log errors with context for debugging
 */
export const logError = (error: Error | string, context: string, userId?: string): void => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    userId,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  };

  console.error(`[ERROR] ${context}:`, errorLog);
  
  // In production, you could send this to an error monitoring service
  // Example: Sentry, LogRocket, or custom logging endpoint
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorService(errorLog);
  }
};

/**
 * Handle GPS/Location specific errors
 */
export const handleLocationError = (error: GeolocationPositionError): string => {
  let message = '';
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = "Location access denied. Please enable location permissions in your browser settings and refresh the page.";
      break;
    case error.POSITION_UNAVAILABLE:
      message = "Location unavailable. Please ensure GPS is enabled and move to an area with better signal (near a window or outside).";
      break;
    case error.TIMEOUT:
      message = "Location request timed out. Please check your GPS signal and try again.";
      break;
    default:
      message = "Unable to get your location. Please check your device settings and try again.";
  }
  
  logError(new Error(message), 'LOCATION_ERROR');
  return message;
};

/**
 * Handle database/API errors
 */
export const handleApiError = (error: any, context: string): string => {
  let message = 'An unexpected error occurred. Please try again.';
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        message = 'Database connection issue. Please check your internet connection and try again.';
        break;
      case 'PGRST301':
        message = 'Access denied. Please check your permissions.';
        break;
      case 'PGRST204':
        message = 'No data found. Please verify your request.';
        break;
      case '23505':
        message = 'This record already exists. Please check your data.';
        break;
      default:
        message = `Database error (${error.code}). Please try again or contact support.`;
    }
  } else if (error?.message) {
    message = error.message;
  }
  
  logError(error, context);
  return message;
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (error: any): string => {
  let message = 'Authentication error. Please sign in again.';
  
  if (error?.message?.includes('Invalid login credentials')) {
    message = 'Invalid email or password. Please check your credentials and try again.';
  } else if (error?.message?.includes('Email not confirmed')) {
    message = 'Please confirm your email address before signing in.';
  } else if (error?.message?.includes('Too many requests')) {
    message = 'Too many login attempts. Please wait a few minutes and try again.';
  }
  
  logError(error, 'AUTH_ERROR');
  return message;
};

/**
 * Handle network/fetch errors
 */
export const handleNetworkError = (error: any, context: string): string => {
  let message = 'Network error. Please check your internet connection and try again.';
  
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    message = 'Unable to connect to server. Please check your internet connection.';
  } else if (error?.name === 'AbortError') {
    message = 'Request was cancelled. Please try again.';
  } else if (error?.status) {
    switch (error.status) {
      case 400:
        message = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        message = 'Authentication required. Please sign in again.';
        break;
      case 403:
        message = 'Access denied. You do not have permission for this action.';
        break;
      case 404:
        message = 'Resource not found. Please refresh the page and try again.';
        break;
      case 429:
        message = 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
        message = 'Server error. Please try again later or contact support.';
        break;
      default:
        message = `Network error (${error.status}). Please try again.`;
    }
  }
  
  logError(error, context);
  return message;
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context: string = 'RETRY_OPERATION'
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        logError(lastError, `${context}_FINAL_FAILURE`, undefined);
        throw lastError;
      }
      
      logError(lastError, `${context}_ATTEMPT_${attempt}`, undefined);
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

/**
 * Validate system health
 */
export const checkSystemHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  errors: string[];
}> => {
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];
  
  // Check geolocation availability
  try {
    checks.geolocation = 'geolocation' in navigator;
    if (!checks.geolocation) {
      errors.push('Geolocation not supported');
    }
  } catch (error) {
    checks.geolocation = false;
    errors.push('Geolocation check failed');
  }
  
  // Check local storage
  try {
    localStorage.setItem('health_check', 'test');
    localStorage.removeItem('health_check');
    checks.localStorage = true;
  } catch (error) {
    checks.localStorage = false;
    errors.push('Local storage not available');
  }
  
  // Check network connectivity
  try {
    checks.network = navigator.onLine;
    if (!checks.network) {
      errors.push('No network connection');
    }
  } catch (error) {
    checks.network = false;
    errors.push('Network check failed');
  }
  
  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyChecks === totalChecks) {
    status = 'healthy';
  } else if (healthyChecks >= totalChecks / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }
  
  return { status, checks, errors };
};
