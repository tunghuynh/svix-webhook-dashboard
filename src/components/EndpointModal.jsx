import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useEventTypes } from '../hooks/useEventTypes'
import { ENDPOINT_VALIDATION, validateField, sanitizeInput, PATTERNS } from '../utils/validation'

export default function EndpointModal({ isOpen, onClose, onSubmit, endpoint, isLoading }) {
  const { data: eventTypesData } = useEventTypes({ limit: 100 })
  const eventTypes = eventTypesData?.data || []

  const [formData, setFormData] = useState({
    url: '',
    description: '',
    version: 1,
    disabled: false,
    rateLimit: null,
    filterTypes: [],
    channels: [],
    uid: '',
  })

  const [channelInput, setChannelInput] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (endpoint) {
      setFormData({
        url: endpoint.url || '',
        description: endpoint.description || '',
        version: endpoint.version || 1,
        disabled: endpoint.disabled || false,
        rateLimit: endpoint.rateLimit || null,
        filterTypes: endpoint.filterTypes || [],
        channels: endpoint.channels || [],
        uid: endpoint.uid || '',
      })
    } else {
      setFormData({
        url: '',
        description: '',
        version: 1,
        disabled: false,
        rateLimit: null,
        filterTypes: [],
        channels: [],
        uid: '',
      })
    }
    setChannelInput('')
    setErrors({})
  }, [endpoint, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {}

    // Validate URL
    const urlError = validateField('url', formData.url, ENDPOINT_VALIDATION)
    if (urlError) newErrors.url = urlError

    // Validate UID
    const uidError = validateField('uid', formData.uid, ENDPOINT_VALIDATION)
    if (uidError) newErrors.uid = uidError

    // Validate rate limit
    const rateLimitError = validateField('rateLimit', formData.rateLimit, ENDPOINT_VALIDATION)
    if (rateLimitError) newErrors.rateLimit = rateLimitError

    // Validate version
    const versionError = validateField('version', formData.version, ENDPOINT_VALIDATION)
    if (versionError) newErrors.version = versionError

    // Validate channels
    const channelsError = validateField('channels', formData.channels, ENDPOINT_VALIDATION)
    if (channelsError) newErrors.channels = channelsError

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = {
      url: formData.url,
      ...(formData.description && { description: formData.description }),
      ...(formData.version && { version: parseInt(formData.version) }),
      disabled: formData.disabled,
      ...(formData.rateLimit && { rateLimit: parseInt(formData.rateLimit) }),
      ...(formData.filterTypes.length > 0 && { filterTypes: formData.filterTypes }),
      ...(formData.channels.length > 0 && { channels: formData.channels }),
      ...(formData.uid && { uid: formData.uid }),
    }

    onSubmit(submitData)
  }

  const toggleEventType = (typeName) => {
    setFormData((prev) => ({
      ...prev,
      filterTypes: prev.filterTypes.includes(typeName)
        ? prev.filterTypes.filter((t) => t !== typeName)
        : [...prev.filterTypes, typeName],
    }))
  }

  const addChannel = () => {
    const trimmedChannel = channelInput.trim()

    if (!trimmedChannel) return

    // Validate channel pattern
    if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(trimmedChannel)) {
      setErrors({ ...errors, channels: 'Channel can only contain letters, numbers, hyphens, underscores, and dots' })
      return
    }

    // Check max length
    if (trimmedChannel.length > 128) {
      setErrors({ ...errors, channels: 'Channel name must not exceed 128 characters' })
      return
    }

    // Check if already exists
    if (formData.channels.includes(trimmedChannel)) {
      setErrors({ ...errors, channels: 'Channel already added' })
      return
    }

    // Check max items
    if (formData.channels.length >= 10) {
      setErrors({ ...errors, channels: 'Maximum 10 channels allowed' })
      return
    }

    setFormData((prev) => ({
      ...prev,
      channels: [...prev.channels, trimmedChannel],
    }))
    setChannelInput('')

    // Clear channel errors
    if (errors.channels) {
      setErrors({ ...errors, channels: null })
    }
  }

  const removeChannel = (channel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.filter((c) => c !== channel),
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {endpoint?.id ? 'Edit Endpoint' : 'Create Endpoint'}
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
              Endpoint URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => {
                setFormData({ ...formData, url: e.target.value })
                if (errors.url) {
                  setErrors({ ...errors, url: null })
                }
              }}
              onBlur={(e) => {
                const error = validateField('url', e.target.value, ENDPOINT_VALIDATION)
                if (error) {
                  setErrors({ ...errors, url: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.url
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="https://example.com/webhook"
              required
            />
            {errors.url && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.url}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be a valid HTTP or HTTPS URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Production webhook endpoint"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Version
              </label>
              <input
                type="number"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rate Limit (Optional)
              </label>
              <input
                type="number"
                value={formData.rateLimit || ''}
                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="1000"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UID (Optional)
            </label>
            <input
              type="text"
              value={formData.uid}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value, PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE)
                setFormData({ ...formData, uid: sanitized })
                if (errors.uid) {
                  setErrors({ ...errors, uid: null })
                }
              }}
              onBlur={(e) => {
                const error = validateField('uid', e.target.value, ENDPOINT_VALIDATION)
                if (error) {
                  setErrors({ ...errors, uid: error })
                }
              }}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                errors.uid
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
              placeholder="custom-uid"
              disabled={endpoint?.id}
            />
            {errors.uid && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.uid}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, hyphens, underscores, and dots (1-256 characters)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Event Types (Optional)
            </label>
            <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 space-y-2">
              {eventTypes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No event types available
                </p>
              ) : (
                eventTypes.map((et) => (
                  <label
                    key={et.name}
                    className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-900 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.filterTypes.includes(et.name)}
                      onChange={() => toggleEventType(et.name)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{et.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channels (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={channelInput}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value, PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE)
                  setChannelInput(sanitized)
                }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChannel())}
                className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                  errors.channels
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all`}
                placeholder="channel-name"
              />
              <button
                type="button"
                onClick={addChannel}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              >
                Add
              </button>
            </div>
            {errors.channels && (
              <div className="mb-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.channels}</span>
              </div>
            )}
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Only letters, numbers, hyphens, underscores, and dots (max 128 chars, max 10 channels)
            </p>
            {formData.channels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.channels.map((channel) => (
                  <span
                    key={channel}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm rounded"
                  >
                    {channel}
                    <button
                      type="button"
                      onClick={() => removeChannel(channel)}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disabled"
              checked={formData.disabled}
              onChange={(e) => setFormData({ ...formData, disabled: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="disabled" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Disable this endpoint
            </label>
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
              {isLoading ? 'Saving...' : endpoint?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
