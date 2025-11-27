import { useState, useEffect } from 'react'
import { X, Plus, Trash2, AlertCircle } from 'lucide-react'
import { EVENT_TYPE_VALIDATION, validateField, sanitizeInput, PATTERNS } from '../utils/validation'

export default function EventTypeModal({ isOpen, onClose, onSubmit, eventType, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    archived: false,
    schemas: {},
    featureFlag: '',
  })

  const [schemaEntries, setSchemaEntries] = useState([{ version: '', schema: '' }])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (eventType) {
      setFormData({
        name: eventType.name || '',
        description: eventType.description || '',
        archived: eventType.archived || false,
        schemas: eventType.schemas || {},
        featureFlag: eventType.featureFlag || '',
      })

      const entries = Object.entries(eventType.schemas || {}).map(([version, schema]) => ({
        version,
        schema: typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2),
      }))
      setSchemaEntries(entries.length > 0 ? entries : [{ version: '', schema: '' }])
    } else {
      setFormData({
        name: '',
        description: '',
        archived: false,
        schemas: {},
        featureFlag: '',
      })
      setSchemaEntries([{ version: '', schema: '' }])
    }
    // Reset errors when modal opens/closes
    setErrors({})
  }, [eventType, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}

    // Validate name (required, pattern)
    const nameError = validateField('name', formData.name, EVENT_TYPE_VALIDATION)
    if (nameError) newErrors.name = nameError

    // Validate description (required)
    const descError = validateField('description', formData.description, EVENT_TYPE_VALIDATION)
    if (descError) newErrors.description = descError

    // Validate featureFlag (optional, pattern)
    const flagError = validateField('featureFlag', formData.featureFlag, EVENT_TYPE_VALIDATION)
    if (flagError) newErrors.featureFlag = flagError

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const schemas = {}
    schemaEntries.forEach((entry) => {
      if (entry.version.trim() && entry.schema.trim()) {
        try {
          schemas[entry.version.trim()] = JSON.parse(entry.schema)
        } catch {
          schemas[entry.version.trim()] = entry.schema
        }
      }
    })

    const submitData = {
      name: formData.name,
      description: formData.description,
      ...(formData.archived !== undefined && { archived: formData.archived }),
      ...(Object.keys(schemas).length > 0 && { schemas }),
      ...(formData.featureFlag && { featureFlag: formData.featureFlag }),
    }

    onSubmit(submitData)
  }

  const addSchemaEntry = () => {
    setSchemaEntries([...schemaEntries, { version: '', schema: '' }])
  }

  const removeSchemaEntry = (index) => {
    setSchemaEntries(schemaEntries.filter((_, i) => i !== index))
  }

  const updateSchemaEntry = (index, field, value) => {
    const newEntries = [...schemaEntries]
    newEntries[index][field] = value
    setSchemaEntries(newEntries)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {eventType?.name ? 'Edit Event Type' : 'Create Event Type'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                // Sanitize input to only allow valid characters
                const sanitized = sanitizeInput(e.target.value, PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE)
                setFormData({ ...formData, name: sanitized })
                // Clear error when user starts typing
                if (errors.name) {
                  setErrors({ ...errors, name: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('name', e.target.value, EVENT_TYPE_VALIDATION)
                if (error) {
                  setErrors({ ...errors, name: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="user.created"
              required
              disabled={eventType?.name}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, hyphens, underscores, and dots (e.g., user.created, max 256 chars)
            </p>
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                // Clear error when user starts typing
                if (errors.description) {
                  setErrors({ ...errors, description: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('description', e.target.value, EVENT_TYPE_VALIDATION)
                if (error) {
                  setErrors({ ...errors, description: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.description
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none`}
              placeholder="Describe what this event represents"
              rows={3}
              required
            />
            {errors.description && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.description}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feature Flag (Optional)
            </label>
            <input
              type="text"
              value={formData.featureFlag}
              onChange={(e) => {
                // Sanitize input to only allow valid characters
                const sanitized = sanitizeInput(e.target.value, PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE)
                setFormData({ ...formData, featureFlag: sanitized })
                // Clear error when user starts typing
                if (errors.featureFlag) {
                  setErrors({ ...errors, featureFlag: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('featureFlag', e.target.value, EVENT_TYPE_VALIDATION)
                if (error) {
                  setErrors({ ...errors, featureFlag: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.featureFlag
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="feature_flag_name"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, hyphens, underscores, and dots (max 256 characters)
            </p>
            {errors.featureFlag && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.featureFlag}</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="archived"
              checked={formData.archived}
              onChange={(e) => setFormData({ ...formData, archived: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="archived"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Archive this event type
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                JSON Schemas (Optional)
              </label>
              <button
                type="button"
                onClick={addSchemaEntry}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="w-4 h-4" />
                Add Schema
              </button>
            </div>

            <div className="space-y-3">
              {schemaEntries.map((entry, index) => (
                <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={entry.version}
                      onChange={(e) => updateSchemaEntry(index, 'version', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="Version (e.g., 1, 2, latest)"
                    />
                    {schemaEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchemaEntry(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={entry.schema}
                    onChange={(e) => updateSchemaEntry(index, 'schema', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-mono resize-none"
                    placeholder='{"type": "object", "properties": {...}}'
                    rows={4}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? 'Saving...' : eventType?.name ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
