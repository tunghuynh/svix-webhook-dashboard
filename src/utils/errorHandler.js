/**
 * Error handling utilities for API errors
 */

import toast from 'react-hot-toast'

/**
 * Extract error message from various error formats
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  try {
    // Check if error exists
    if (!error) {
      return 'An unexpected error occurred'
    }

    // Axios error response
    if (error.response) {
      const { data, status } = error.response

      // Handle different API error formats
      if (data) {
        // Svix API validation error format: { detail: [{ loc: [...], msg: "...", type: "..." }] }
        if (data.detail && Array.isArray(data.detail) && data.detail.length > 0) {
          // Check if it's the validation error format with loc and msg
          const hasValidationFormat = data.detail.every(
            err => err && typeof err === 'object' && ('msg' in err || 'message' in err)
          )

          if (hasValidationFormat) {
            // Extract all error messages from the detail array
            const errorMessages = data.detail
              .map(err => {
                // Get the message
                const message = err.msg || err.message

                // Get the field path if available
                if (err.loc && Array.isArray(err.loc) && err.loc.length > 0) {
                  // Filter out 'body' from loc path
                  const fieldPath = err.loc.filter(l => l !== 'body').join('.')
                  return fieldPath ? `${fieldPath}: ${message}` : message
                }

                return message
              })
              .filter(msg => msg) // Remove empty messages

            return errorMessages.length > 0
              ? errorMessages.join('\n')
              : 'Validation error occurred'
          }
        }

        // Svix API format: { detail: "error message" }
        if (data.detail) {
          return typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)
        }

        // Alternative format: { message: "error message" }
        if (data.message) {
          return data.message
        }

        // Alternative format: { error: "error message" }
        if (data.error) {
          return typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error)
        }

        // Validation errors array format (alternative)
        if (Array.isArray(data) && data.length > 0) {
          return data.map(err => err.msg || err.message || JSON.stringify(err)).join('\n')
        }

        // If data is a string
        if (typeof data === 'string') {
          return data
        }

        // Fallback: try to stringify the entire response
        try {
          return JSON.stringify(data)
        } catch (e) {
          // If can't stringify, return a generic message
          return 'An error occurred'
        }
      }

      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          return 'Bad request. Please check your input and try again.'
        case 401:
          return 'Unauthorized. Please log in again.'
        case 403:
          return 'Forbidden. You do not have permission to perform this action.'
        case 404:
          return 'Resource not found.'
        case 409:
          return 'Conflict. This resource already exists or has been modified.'
        case 422:
          return 'Validation error. Please check your input.'
        case 429:
          return 'Too many requests. Please try again later.'
        case 500:
          return 'Server error. Please try again later.'
        case 503:
          return 'Service unavailable. Please try again later.'
        default:
          return `Request failed with status ${status}`
      }
    }

    // Network error (no response)
    if (error.request) {
      return 'Network error. Please check your connection and try again.'
    }

    // Other errors (e.g., programming errors)
    if (error.message) {
      return error.message
    }

    // Fallback
    return 'An unexpected error occurred'
  } catch (e) {
    console.error('Error in getErrorMessage:', e)
    return 'An unexpected error occurred'
  }
}

/**
 * Log error details for debugging
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
export function logError(context, error) {
  try {
    console.error(`[${context}] Error:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    })
  } catch (e) {
    console.error('Error in logError:', e)
  }
}

/**
 * Check if error is due to network issues
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  try {
    return !error.response && error.request
  } catch (e) {
    return false
  }
}

/**
 * Check if error is due to authentication
 * @param {Error} error - Error object
 * @returns {boolean} True if auth error
 */
export function isAuthError(error) {
  try {
    return error.response?.status === 401
  } catch (e) {
    return false
  }
}

/**
 * Check if error is due to validation
 * @param {Error} error - Error object
 * @returns {boolean} True if validation error
 */
export function isValidationError(error) {
  try {
    return error.response?.status === 422 || error.response?.status === 400
  } catch (e) {
    return false
  }
}

/**
 * Display error toast with proper formatting for multi-line messages
 * @param {Error} error - Error object
 * @param {string} fallbackMessage - Fallback message if error parsing fails
 */
export function showErrorToast(error, fallbackMessage = 'An error occurred') {
  try {
    logError('showErrorToast', error)
    const message = getErrorMessage(error)

    // Check if message contains newlines (multi-line validation errors)
    if (message.includes('\n')) {
      // Split by newlines and display as list
      const lines = message.split('\n').filter(line => line.trim())

      // Create a formatted message
      const formattedMessage = lines.length > 1
        ? `Validation errors:\n${lines.map((line, i) => `${i + 1}. ${line}`).join('\n')}`
        : message

      toast.error(formattedMessage, {
        duration: 6000, // Longer duration for multi-line errors
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-wrap', // Preserve line breaks
        },
      })
    } else {
      // Single line error - use default toast
      toast.error(message || fallbackMessage, {
        duration: 5000,
      })
    }
  } catch (e) {
    console.error('Error in showErrorToast:', e)
    toast.error(fallbackMessage, {
      duration: 4000,
    })
  }
}
