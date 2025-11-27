import { HTTP_STATUS_RANGES } from './constants'
import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format date with time to "MMM dd, yyyy HH:mm:ss"
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss')
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format date without time to "MMM dd, yyyy"
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length = 50) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

/**
 * Check if HTTP status code is success
 */
export const isSuccessStatus = (statusCode) => {
  return statusCode >= HTTP_STATUS_RANGES.SUCCESS.min &&
         statusCode <= HTTP_STATUS_RANGES.SUCCESS.max
}

/**
 * Get status color based on HTTP status code
 */
export const getStatusColor = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'green'
  } else if (statusCode >= 300 && statusCode < 400) {
    return 'blue'
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'yellow'
  } else if (statusCode >= 500) {
    return 'red'
  }
  return 'gray'
}

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (successCount, totalCount) => {
  if (totalCount === 0) return 0
  return Math.round((successCount / totalCount) * 100)
}

/**
 * Format duration in milliseconds to readable format
 */
export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Validate JSON string
 */
export const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Format error message
 */
export const formatErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if URL is valid
 */
export const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Get relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return then.toLocaleDateString()
}
