import { useState, useEffect } from 'react'
import { X, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useEventTypes } from '../hooks/useEventTypes'
import { sanitizeInput, PATTERNS } from '../utils/validation'

export default function MessageModal({ isOpen, onClose, onSubmit, isLoading }) {
  const { data: eventTypesData } = useEventTypes({ limit: 100 })
  const eventTypes = eventTypesData?.data || []

  const [formData, setFormData] = useState({
    eventType: '',
    eventId: '',
    payload: '{}',
    channels: [],
  })

  const [channelInput, setChannelInput] = useState('')
  const [payloadError, setPayloadError] = useState('')
  const [channelError, setChannelError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData({
        eventType: '',
        eventId: '',
        payload: '{}',
        channels: [],
      })
      setChannelInput('')
      setPayloadError('')
      setChannelError('')
    }
  }, [isOpen])

  const handlePayloadChange = (value) => {
    setFormData({ ...formData, payload: value })
    try {
      JSON.parse(value)
      setPayloadError('')
    } catch (e) {
      setPayloadError('Invalid JSON format')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    try {
      const payload = JSON.parse(formData.payload)

      const submitData = {
        eventType: formData.eventType,
        payload,
        ...(formData.eventId && { eventId: formData.eventId }),
        ...(formData.channels.length > 0 && { channels: formData.channels }),
      }

      onSubmit(submitData)
    } catch (e) {
      setPayloadError('Invalid JSON format')
    }
  }

  const addChannel = () => {
    const trimmedChannel = channelInput.trim()

    if (!trimmedChannel) return

    // Validate channel pattern
    if (!PATTERNS.ALPHANUMERIC_DASH_DOT_UNDERSCORE.test(trimmedChannel)) {
      setChannelError('Channel can only contain letters, numbers, hyphens, underscores, and dots')
      return
    }

    // Check max length
    if (trimmedChannel.length > 128) {
      setChannelError('Channel name must not exceed 128 characters')
      return
    }

    // Check if already exists
    if (formData.channels.includes(trimmedChannel)) {
      setChannelError('Channel already added')
      return
    }

    // Check max items
    if (formData.channels.length >= 10) {
      setChannelError('Maximum 10 channels allowed')
      return
    }

    setFormData((prev) => ({
      ...prev,
      channels: [...prev.channels, trimmedChannel],
    }))
    setChannelInput('')
    setChannelError('')
  }

  const removeChannel = (channel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.filter((c) => c !== channel),
    }))
  }

  const loadSamplePayload = () => {
    const sample = {
      user: {
        id: '12345',
        email: 'user@example.com',
        name: 'John Doe',
      },
      action: 'created',
      timestamp: new Date().toISOString(),
    }
    setFormData({ ...formData, payload: JSON.stringify(sample, null, 2) })
    setPayloadError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Send Message
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
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="">Select event type...</option>
              {eventTypes.map((et) => (
                <option key={et.name} value={et.name}>
                  {et.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must match one of your configured event types (e.g., user.created)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event ID (Optional)
            </label>
            <input
              type="text"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="unique-event-id"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Custom identifier for idempotency
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payload (JSON) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={loadSamplePayload}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={formData.payload}
              onChange={(e) => handlePayloadChange(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                payloadError
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm`}
              rows={12}
              required
            />
            {payloadError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{payloadError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JSON payload to be sent with the webhook
            </p>
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
                  channelError
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
            {channelError && (
              <div className="mb-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{channelError}</span>
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
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded"
                  >
                    {channel}
                    <button
                      type="button"
                      onClick={() => removeChannel(channel)}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              disabled={isLoading || !!payloadError}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
