import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, FileCode, BarChart3, Settings, RefreshCw, Save, AlertCircle, X, Plus, Trash2 } from 'lucide-react'
import { useEndpoint, useEndpointHeaders, useUpdateEndpointHeaders, useEndpointSecret, useRotateEndpointSecret, useEndpointStats, useUpdateEndpoint } from '../hooks/useEndpoints'
import { useEventTypes } from '../hooks/useEventTypes'
import toast from 'react-hot-toast'
import { HEADER_VALIDATION, validateField } from '../utils/validation'
import { useConfirm } from '../contexts/ConfirmContext'

export default function EndpointConfigPage() {
  const { appId, endpointId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const [activeTab, setActiveTab] = useState('settings')

  const { data: endpoint, isLoading: endpointLoading } = useEndpoint(appId, endpointId)
  const { data: headers, isLoading: headersLoading } = useEndpointHeaders(appId, endpointId)
  const { data: secret, isLoading: secretLoading } = useEndpointSecret(appId, endpointId)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEndpointStats(appId, endpointId)
  const { data: eventTypesData } = useEventTypes({ limit: 100 })

  const updateHeadersMutation = useUpdateEndpointHeaders()
  const rotateSecretMutation = useRotateEndpointSecret()
  const updateEndpointMutation = useUpdateEndpoint()

  const eventTypes = eventTypesData?.data || []

  const [headerEntries, setHeaderEntries] = useState([]) // Array of { id, key, value }
  const [hasHeadersChanged, setHasHeadersChanged] = useState(false)
  const [headerErrors, setHeaderErrors] = useState({}) // Errors for each header by id

  // Endpoint edit form state
  const [endpointForm, setEndpointForm] = useState({
    url: '',
    description: '',
    version: 1,
    disabled: false,
    rateLimit: null,
    filterTypes: [],
    channels: [],
    uid: '',
  })
  const [hasEndpointChanged, setHasEndpointChanged] = useState(false)
  const [channelInput, setChannelInput] = useState('')

  // Initialize headers when data loads
  useEffect(() => {
    if (headers && !hasHeadersChanged) {
      // Handle both { headers: {...} } and {...} response formats
      const headerData = headers.headers || headers

      // Convert to array format with stable IDs
      const entries = Object.entries(headerData || {}).map(([key, value], index) => ({
        id: `header_${index}_${key}`,
        key,
        value
      }))
      setHeaderEntries(entries)
    }
  }, [headers, hasHeadersChanged])

  // Initialize endpoint form when data loads
  useEffect(() => {
    if (endpoint && !hasEndpointChanged) {
      setEndpointForm({
        url: endpoint.url || '',
        description: endpoint.description || '',
        version: endpoint.version || 1,
        disabled: endpoint.disabled || false,
        rateLimit: endpoint.rateLimit || null,
        filterTypes: endpoint.filterTypes || [],
        channels: endpoint.channels || [],
        uid: endpoint.uid || '',
      })
    }
  }, [endpoint, hasEndpointChanged])

  // Debug: Log headers data
  useEffect(() => {
    if (headers) {
      console.log('Headers API response:', headers)
    }
  }, [headers])

  const handleAddHeader = () => {
    const newEntry = {
      id: `header_new_${Date.now()}`,
      key: '',
      value: ''
    }
    setHeaderEntries([...headerEntries, newEntry])
    setHasHeadersChanged(true)
  }

  const handleHeaderKeyChange = (id, newKey) => {
    setHeaderEntries(headerEntries.map(entry =>
      entry.id === id ? { ...entry, key: newKey } : entry
    ))
    setHasHeadersChanged(true)

    // Clear error for this header
    if (headerErrors[id]) {
      setHeaderErrors({ ...headerErrors, [id]: null })
    }
  }

  const handleHeaderValueChange = (id, newValue) => {
    setHeaderEntries(headerEntries.map(entry =>
      entry.id === id ? { ...entry, value: newValue } : entry
    ))
    setHasHeadersChanged(true)

    // Clear error for this header
    if (headerErrors[id]) {
      setHeaderErrors({ ...headerErrors, [id]: null })
    }
  }

  const handleRemoveHeader = (id) => {
    setHeaderEntries(headerEntries.filter(entry => entry.id !== id))
    setHasHeadersChanged(true)
  }

  const handleSaveHeaders = async () => {
    try {
      // Validate all headers
      const newErrors = {}
      const headersObject = {}

      headerEntries.forEach(entry => {
        if (!entry.key.trim() && !entry.value.trim()) {
          // Skip empty entries
          return
        }

        // Validate header key
        const keyError = validateField('key', entry.key, HEADER_VALIDATION)
        if (keyError) {
          newErrors[entry.id] = { key: keyError }
          return
        }

        // Validate header value
        const valueError = validateField('value', entry.value, HEADER_VALIDATION)
        if (valueError) {
          newErrors[entry.id] = { ...newErrors[entry.id], value: valueError }
          return
        }

        // Add to headers object if valid
        if (entry.key.trim()) {
          headersObject[entry.key.trim()] = entry.value
        }
      })

      // If there are errors, don't submit
      if (Object.keys(newErrors).length > 0) {
        setHeaderErrors(newErrors)
        toast.error('Please fix header validation errors')
        return
      }

      await updateHeadersMutation.mutateAsync({
        appId,
        endpointId,
        headers: headersObject,
      })
      setHasHeadersChanged(false)
      setHeaderErrors({})
    } catch (error) {
      console.error('Failed to save headers:', error)
    }
  }

  const handleRotateSecret = async () => {
    const confirmed = await confirm({
      title: 'Rotate Endpoint Secret',
      message: 'Are you sure you want to rotate the endpoint secret? This action cannot be undone and will invalidate the current secret.',
      confirmText: 'Rotate Secret',
      cancelText: 'Cancel',
      variant: 'warning'
    })

    if (confirmed) {
      try {
        await rotateSecretMutation.mutateAsync({ appId, endpointId })
      } catch (error) {
        console.error('Failed to rotate secret:', error)
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleSaveEndpoint = async () => {
    try {
      await updateEndpointMutation.mutateAsync({
        appId,
        endpointId,
        data: {
          url: endpointForm.url,
          ...(endpointForm.description && { description: endpointForm.description }),
          ...(endpointForm.version && { version: parseInt(endpointForm.version) }),
          disabled: endpointForm.disabled,
          ...(endpointForm.rateLimit && { rateLimit: parseInt(endpointForm.rateLimit) }),
          ...(endpointForm.filterTypes.length > 0 && { filterTypes: endpointForm.filterTypes }),
          ...(endpointForm.channels.length > 0 && { channels: endpointForm.channels }),
          ...(endpointForm.uid && { uid: endpointForm.uid }),
        },
      })
      setHasEndpointChanged(false)
      toast.success('Endpoint updated successfully')
    } catch (error) {
      console.error('Failed to update endpoint:', error)
      toast.error('Failed to update endpoint')
    }
  }

  const toggleEventType = (typeName) => {
    setEndpointForm((prev) => ({
      ...prev,
      filterTypes: prev.filterTypes.includes(typeName)
        ? prev.filterTypes.filter((t) => t !== typeName)
        : [...prev.filterTypes, typeName],
    }))
    setHasEndpointChanged(true)
  }

  const addChannel = () => {
    if (channelInput.trim() && !endpointForm.channels.includes(channelInput.trim())) {
      setEndpointForm((prev) => ({
        ...prev,
        channels: [...prev.channels, channelInput.trim()],
      }))
      setChannelInput('')
      setHasEndpointChanged(true)
    }
  }

  const removeChannel = (channel) => {
    setEndpointForm((prev) => ({
      ...prev,
      channels: prev.channels.filter((c) => c !== channel),
    }))
    setHasEndpointChanged(true)
  }

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'headers', label: 'Headers', icon: FileCode },
    { id: 'secret', label: 'Secret', icon: Key },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ]

  if (endpointLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300">Endpoint not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/endpoints')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Endpoints
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Endpoint Configuration
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {endpoint.url}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                endpoint.disabled
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              }`}>
                {endpoint.disabled ? 'Disabled' : 'Active'}
              </span>
              {endpoint.version && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  v{endpoint.version}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Headers Tab */}
        {activeTab === 'headers' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Custom Headers
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure custom HTTP headers for this endpoint
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddHeader}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
                {hasHeadersChanged && (
                  <button
                    onClick={handleSaveHeaders}
                    disabled={updateHeadersMutation.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {headersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {headerEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No custom headers configured. Click "Add Header" to add one.
                  </div>
                ) : (
                  headerEntries.map((entry) => (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={entry.key}
                              onChange={(e) => handleHeaderKeyChange(entry.id, e.target.value)}
                              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                                headerErrors[entry.id]?.key
                                  ? 'border-red-500 dark:border-red-500'
                                  : 'border-gray-300 dark:border-gray-700'
                              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm`}
                              placeholder="Header-Name"
                            />
                            {headerErrors[entry.id]?.key && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>{headerErrors[entry.id].key}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={entry.value}
                              onChange={(e) => handleHeaderValueChange(entry.id, e.target.value)}
                              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                                headerErrors[entry.id]?.value
                                  ? 'border-red-500 dark:border-red-500'
                                  : 'border-gray-300 dark:border-gray-700'
                              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm`}
                              placeholder="Header Value"
                            />
                            {headerErrors[entry.id]?.value && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>{headerErrors[entry.id].value}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveHeader(entry.id)}
                          className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove header"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {hasHeadersChanged && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  You have unsaved changes. Click "Save Changes" to apply them.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Secret Tab */}
        {activeTab === 'secret' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Webhook Secret
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Used to verify webhook signatures
                </p>
              </div>
              <button
                onClick={handleRotateSecret}
                disabled={rotateSecretMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Rotate Secret
              </button>
            </div>

            {secretLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : secret ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Secret
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secret.key || ''}
                      readOnly
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(secret.key)}
                      className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    How to verify webhooks
                  </h3>
                  <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Get the signature from the <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">svix-signature</code> header</li>
                    <li>Use this secret to verify the signature matches the payload</li>
                    <li>Reject requests with invalid signatures</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                        Warning
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Rotating the secret will invalidate the current one. Make sure to update your webhook receiver before rotating.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No secret available
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Endpoint Statistics
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Performance metrics and delivery statistics
                </p>
              </div>
              <button
                onClick={() => refetchStats()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {stats.success || 0}%
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Attempts
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats.attempt || 0}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Avg Response Time
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {stats.responseTime || 0}ms
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Failed Attempts
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                    {stats.fail || 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No statistics available
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Endpoint Settings
              </h2>
              {hasEndpointChanged && (
                <button
                  onClick={handleSaveEndpoint}
                  disabled={updateEndpointMutation.isPending}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateEndpointMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* URL Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={endpointForm.url}
                  onChange={(e) => {
                    setEndpointForm({ ...endpointForm, url: e.target.value })
                    setHasEndpointChanged(true)
                  }}
                  placeholder="https://example.com/webhook"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                  required
                />
              </div>

              {/* Endpoint ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint ID
                </label>
                <input
                  type="text"
                  value={endpoint.id || ''}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={endpointForm.description}
                  onChange={(e) => {
                    setEndpointForm({ ...endpointForm, description: e.target.value })
                    setHasEndpointChanged(true)
                  }}
                  rows={3}
                  placeholder="Optional description"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="number"
                    value={endpointForm.version}
                    onChange={(e) => {
                      setEndpointForm({ ...endpointForm, version: parseInt(e.target.value) || 1 })
                      setHasEndpointChanged(true)
                    }}
                    min="1"
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Rate Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate Limit (requests/sec)
                  </label>
                  <input
                    type="number"
                    value={endpointForm.rateLimit || ''}
                    onChange={(e) => {
                      setEndpointForm({ ...endpointForm, rateLimit: e.target.value ? parseInt(e.target.value) : null })
                      setHasEndpointChanged(true)
                    }}
                    min="0"
                    placeholder="No limit"
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Disabled Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint Status
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {endpointForm.disabled ? 'Endpoint is currently disabled' : 'Endpoint is currently active'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!endpointForm.disabled}
                    onChange={(e) => {
                      setEndpointForm({ ...endpointForm, disabled: !e.target.checked })
                      setHasEndpointChanged(true)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Event Types Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter Event Types
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Select which event types this endpoint should receive. Leave empty to receive all types.
                </p>
                {eventTypes.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-2">
                      {eventTypes.map((eventType) => (
                        <label
                          key={eventType.name}
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={endpointForm.filterTypes.includes(eventType.name)}
                            onChange={() => {
                              toggleEventType(eventType.name)
                              setHasEndpointChanged(true)
                            }}
                            className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{eventType.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No event types available</p>
                )}
                {endpointForm.filterTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {endpointForm.filterTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channels
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Add channels to organize your endpoints (optional)
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChannel()
                      }
                    }}
                    placeholder="Enter channel name"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                  />
                  <button
                    onClick={addChannel}
                    type="button"
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                {endpointForm.channels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {endpointForm.channels.map((channel, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm font-medium"
                      >
                        {channel}
                        <button
                          onClick={() => {
                            removeChannel(index)
                            setHasEndpointChanged(true)
                          }}
                          type="button"
                          className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* UID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UID (Optional)
                </label>
                <input
                  type="text"
                  value={endpointForm.uid}
                  onChange={(e) => {
                    setEndpointForm({ ...endpointForm, uid: e.target.value })
                    setHasEndpointChanged(true)
                  }}
                  placeholder="Custom identifier"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
