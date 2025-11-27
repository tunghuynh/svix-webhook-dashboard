import { useState, useEffect } from 'react'
import { X, Plus, Trash2, AlertCircle } from 'lucide-react'
import { APPLICATION_VALIDATION, validateField, sanitizeInput, PATTERNS } from '../utils/validation'

export default function ApplicationModal({ isOpen, onClose, onSubmit, application, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    uid: '',
    metadata: {},
    rateLimit: null,
  })

  const [metadataEntries, setMetadataEntries] = useState([{ key: '', value: '' }])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name || '',
        uid: application.uid || '',
        metadata: application.metadata || {},
        rateLimit: application.rateLimit || null,
      })

      const entries = Object.entries(application.metadata || {}).map(([key, value]) => ({
        key,
        value,
      }))
      setMetadataEntries(entries.length > 0 ? entries : [{ key: '', value: '' }])
    } else {
      setFormData({
        name: '',
        uid: '',
        metadata: {},
        rateLimit: null,
      })
      setMetadataEntries([{ key: '', value: '' }])
    }
    // Reset errors when modal opens/closes
    setErrors({})
  }, [application, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}

    // Validate name
    const nameError = validateField('name', formData.name, APPLICATION_VALIDATION)
    if (nameError) newErrors.name = nameError

    // Validate uid
    const uidError = validateField('uid', formData.uid, APPLICATION_VALIDATION)
    if (uidError) newErrors.uid = uidError

    // Validate rateLimit
    const rateLimitError = validateField('rateLimit', formData.rateLimit, APPLICATION_VALIDATION)
    if (rateLimitError) newErrors.rateLimit = rateLimitError

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const metadata = {}
    metadataEntries.forEach((entry) => {
      if (entry.key.trim()) {
        metadata[entry.key.trim()] = entry.value
      }
    })

    const submitData = {
      name: formData.name,
      ...(formData.uid && { uid: formData.uid }),
      ...(Object.keys(metadata).length > 0 && { metadata }),
      ...(formData.rateLimit && { rateLimit: parseInt(formData.rateLimit) }),
    }

    onSubmit(submitData)
  }

  const addMetadataEntry = () => {
    setMetadataEntries([...metadataEntries, { key: '', value: '' }])
  }

  const removeMetadataEntry = (index) => {
    setMetadataEntries(metadataEntries.filter((_, i) => i !== index))
  }

  const updateMetadataEntry = (index, field, value) => {
    const newEntries = [...metadataEntries]
    newEntries[index][field] = value
    setMetadataEntries(newEntries)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {application?.id ? 'Edit Application' : 'Create Application'}
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
              Application Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                // Clear error when user starts typing
                if (errors.name) {
                  setErrors({ ...errors, name: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('name', e.target.value, APPLICATION_VALIDATION)
                if (error) {
                  setErrors({ ...errors, name: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="My Application"
              required
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UID (Optional)
            </label>
            <input
              type="text"
              value={formData.uid}
              onChange={(e) => {
                // Sanitize input to only allow valid characters
                const sanitized = sanitizeInput(e.target.value, PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE)
                setFormData({ ...formData, uid: sanitized })
                // Clear error when user starts typing
                if (errors.uid) {
                  setErrors({ ...errors, uid: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('uid', e.target.value, APPLICATION_VALIDATION)
                if (error) {
                  setErrors({ ...errors, uid: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.uid
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="custom-uid-123"
              disabled={application?.id}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, hyphens, underscores, and dots (max 256 characters)
            </p>
            {errors.uid && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.uid}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rate Limit (Optional)
            </label>
            <input
              type="number"
              value={formData.rateLimit || ''}
              onChange={(e) => {
                setFormData({ ...formData, rateLimit: e.target.value })
                // Clear error when user starts typing
                if (errors.rateLimit) {
                  setErrors({ ...errors, rateLimit: null })
                }
              }}
              onBlur={(e) => {
                // Validate on blur
                const error = validateField('rateLimit', e.target.value, APPLICATION_VALIDATION)
                if (error) {
                  setErrors({ ...errors, rateLimit: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.rateLimit
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="1000"
              min="1"
              max="65535"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum requests per period (1-65535)
            </p>
            {errors.rateLimit && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.rateLimit}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Metadata (Optional)
              </label>
              <button
                type="button"
                onClick={addMetadataEntry}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {metadataEntries.map((entry, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => updateMetadataEntry(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(e) => updateMetadataEntry(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Value"
                  />
                  {metadataEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetadataEntry(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
              {isLoading ? 'Saving...' : application?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
