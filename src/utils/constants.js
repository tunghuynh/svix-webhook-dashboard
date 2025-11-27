// Status constants
export const ATTEMPT_STATUS = {
  SUCCESS: 0,
  PENDING: 1,
  FAILED: 2,
  SENDING: 3,
}

export const ATTEMPT_STATUS_LABELS = {
  [ATTEMPT_STATUS.SUCCESS]: 'Success',
  [ATTEMPT_STATUS.PENDING]: 'Pending',
  [ATTEMPT_STATUS.FAILED]: 'Failed',
  [ATTEMPT_STATUS.SENDING]: 'Sending',
}

// HTTP status code ranges
export const HTTP_STATUS_RANGES = {
  SUCCESS: { min: 200, max: 299 },
  REDIRECT: { min: 300, max: 399 },
  CLIENT_ERROR: { min: 400, max: 499 },
  SERVER_ERROR: { min: 500, max: 599 },
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
}

// API endpoints
export const API_ENDPOINTS = {
  APPLICATIONS: '/api/v1/app',
  EVENT_TYPES: '/api/v1/event-type',
  ENDPOINTS: '/api/v1/app/:appId/endpoint',
  MESSAGES: '/api/v1/app/:appId/msg',
  ATTEMPTS: '/api/v1/app/:appId/attempt',
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'svix-auth',
  THEME: 'theme',
}

// System config
export const SYSTEM_CONFIG = {
  APP_UID: 'app-system-config',
  APP_NAME: 'System Configuration',
}

// Date formats
export const DATE_FORMATS = {
  FULL: 'MMM d, yyyy HH:mm:ss',
  DATE_ONLY: 'MMM d, yyyy',
  TIME_ONLY: 'HH:mm:ss',
}
