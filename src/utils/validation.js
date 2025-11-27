/**
 * Validation utilities based on Svix OpenAPI specification
 * Extracted from svix-sample/res/SvixOpenAPI.json
 */

// Common regex patterns from OpenAPI spec
export const PATTERNS = {
  // Pattern: ^[a-zA-Z0-9\-_.]+$
  ALPHANUMERIC_DASH_DOT_UNDERSCORE: /^[a-zA-Z0-9\-_.]+$/,

  // Pattern for webhook secret: ^(whsec_)?[a-zA-Z0-9+/=]{32,100}$
  WEBHOOK_SECRET: /^(whsec_)?[a-zA-Z0-9+/=]{32,100}$/,

  // URL pattern (basic validation, browser will handle full validation)
  URL: /^https?:\/\/.+/,
}

// Validation rules for Application
export const APPLICATION_VALIDATION = {
  name: {
    required: true,
    minLength: 1,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Application name is required'
      }
      return null
    }
  },
  uid: {
    required: false,
    minLength: 1,
    maxLength: 256,
    pattern: PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE,
    validate: (value) => {
      if (!value) return null // Optional field

      if (value.length < 1) {
        return 'UID must be at least 1 character'
      }
      if (value.length > 256) {
        return 'UID must not exceed 256 characters'
      }
      if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(value)) {
        return 'UID can only contain letters, numbers, hyphens, underscores, and dots'
      }
      return null
    }
  },
  rateLimit: {
    required: false,
    minimum: 1,
    validate: (value) => {
      if (!value) return null // Optional field

      const num = parseInt(value, 10)
      if (isNaN(num)) {
        return 'Rate limit must be a number'
      }
      if (num < 1) {
        return 'Rate limit must be at least 1'
      }
      if (num > 65535) {
        return 'Rate limit must not exceed 65535 (uint16)'
      }
      return null
    }
  }
}

// Validation rules for Event Type
export const EVENT_TYPE_VALIDATION = {
  name: {
    required: true,
    maxLength: 256,
    pattern: PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Event type name is required'
      }
      if (value.length > 256) {
        return 'Event type name must not exceed 256 characters'
      }
      if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(value)) {
        return 'Event type name can only contain letters, numbers, hyphens, underscores, and dots (e.g., user.signup)'
      }
      return null
    }
  },
  description: {
    required: true,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Description is required'
      }
      return null
    }
  },
  featureFlag: {
    required: false,
    maxLength: 256,
    pattern: PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE,
    validate: (value) => {
      if (!value) return null // Optional field

      if (value.length > 256) {
        return 'Feature flag must not exceed 256 characters'
      }
      if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(value)) {
        return 'Feature flag can only contain letters, numbers, hyphens, underscores, and dots'
      }
      return null
    }
  }
}

// Validation rules for Endpoint
export const ENDPOINT_VALIDATION = {
  url: {
    required: true,
    minLength: 1,
    maxLength: 65536,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Endpoint URL is required'
      }
      if (value.length > 65536) {
        return 'URL must not exceed 65536 characters'
      }

      // Basic URL validation
      try {
        const url = new URL(value)
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must use HTTP or HTTPS protocol'
        }
      } catch (e) {
        return 'Please enter a valid URL (e.g., https://example.com/webhook)'
      }

      return null
    }
  },
  uid: {
    required: false,
    minLength: 1,
    maxLength: 256,
    pattern: PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE,
    validate: (value) => {
      if (!value) return null // Optional field

      if (value.length < 1) {
        return 'UID must be at least 1 character'
      }
      if (value.length > 256) {
        return 'UID must not exceed 256 characters'
      }
      if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(value)) {
        return 'UID can only contain letters, numbers, hyphens, underscores, and dots'
      }
      return null
    }
  },
  rateLimit: {
    required: false,
    minimum: 1,
    validate: (value) => {
      if (!value) return null // Optional field

      const num = parseInt(value, 10)
      if (isNaN(num)) {
        return 'Rate limit must be a number'
      }
      if (num < 1) {
        return 'Rate limit must be at least 1'
      }
      if (num > 65535) {
        return 'Rate limit must not exceed 65535 (uint16)'
      }
      return null
    }
  },
  version: {
    required: false,
    minimum: 1,
    validate: (value) => {
      if (!value) return null // Optional field

      const num = parseInt(value, 10)
      if (isNaN(num)) {
        return 'Version must be a number'
      }
      if (num < 1) {
        return 'Version must be at least 1'
      }
      if (num > 65535) {
        return 'Version must not exceed 65535 (uint16)'
      }
      return null
    }
  },
  channels: {
    required: false,
    minItems: 1,
    maxItems: 10,
    itemMaxLength: 128,
    itemPattern: PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE,
    validate: (channels) => {
      if (!channels || channels.length === 0) return null // Optional field

      if (channels.length > 10) {
        return 'Maximum 10 channels allowed'
      }

      for (const channel of channels) {
        if (channel.length > 128) {
          return `Channel "${channel}" exceeds 128 characters`
        }
        if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(channel)) {
          return `Channel "${channel}" can only contain letters, numbers, hyphens, underscores, and dots`
        }
      }

      // Check for duplicates
      const uniqueChannels = new Set(channels)
      if (uniqueChannels.size !== channels.length) {
        return 'Channel names must be unique'
      }

      return null
    }
  }
}

// Validation rules for Endpoint Headers
export const HEADER_VALIDATION = {
  key: {
    required: true,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Header name is required'
      }

      // HTTP header name validation (RFC 7230)
      // Field names are case-insensitive and consist of alphanumeric characters and hyphens
      if (!/^[a-zA-Z0-9\-]+$/.test(value)) {
        return 'Header name can only contain letters, numbers, and hyphens'
      }

      return null
    }
  },
  value: {
    required: false, // Header values can be empty
    validate: (value) => {
      // Header values have minimal restrictions
      // Just check for control characters that are not allowed
      if (/[\x00-\x1F\x7F]/.test(value)) {
        return 'Header value contains invalid control characters'
      }
      return null
    }
  }
}

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {object} validationRules - Validation rules object
 * @returns {string|null} Error message or null if valid
 */
export function validateField(field, value, validationRules) {
  try {
    if (!validationRules || typeof validationRules !== 'object') {
      console.error('Invalid validation rules provided')
      return null
    }

    const rules = validationRules[field]
    if (!rules) return null

    if (typeof rules.validate !== 'function') {
      console.error(`Validation function not found for field: ${field}`)
      return null
    }

    return rules.validate(value)
  } catch (error) {
    console.error(`Error validating field "${field}":`, error)
    return null
  }
}

/**
 * Validate all fields in a form
 * @param {object} formData - Form data object
 * @param {object} validationRules - Validation rules object
 * @returns {object} Object with field names as keys and error messages as values
 */
export function validateForm(formData, validationRules) {
  const errors = {}

  try {
    if (!formData || typeof formData !== 'object') {
      console.error('Invalid form data provided to validateForm')
      return errors
    }

    if (!validationRules || typeof validationRules !== 'object') {
      console.error('Invalid validation rules provided to validateForm')
      return errors
    }

    for (const field in validationRules) {
      const error = validateField(field, formData[field], validationRules)
      if (error) {
        errors[field] = error
      }
    }
  } catch (error) {
    console.error('Error validating form:', error)
  }

  return errors
}

/**
 * Check if form has any errors
 * @param {object} errors - Errors object from validateForm
 * @returns {boolean} True if there are errors
 */
export function hasErrors(errors) {
  try {
    if (!errors || typeof errors !== 'object') {
      return false
    }
    return Object.keys(errors).length > 0
  } catch (error) {
    console.error('Error checking for errors:', error)
    return false
  }
}

/**
 * Sanitize input to match pattern (for real-time input correction)
 * @param {string} value - Input value
 * @param {RegExp} pattern - Pattern to match
 * @returns {string} Sanitized value
 */
export function sanitizeInput(value, pattern) {
  try {
    if (!value) return value

    // Ensure value is a string
    const stringValue = String(value)

    // For ALPHANUMERIC_DASH_DOT_UNDERSCORE pattern
    if (pattern === PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE) {
      return stringValue.replace(/[^a-zA-Z0-9\-_.]/g, '')
    }

    return stringValue
  } catch (error) {
    console.error('Error sanitizing input:', error)
    return value || ''
  }
}
