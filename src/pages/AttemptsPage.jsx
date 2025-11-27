import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, RefreshCw, AlertCircle, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useEndpoints } from '../hooks/useEndpoints'
import { useAttemptsByEndpoint, useAttemptsByMsg, useResendMessage, useAllAttempts } from '../hooks/useMessages'
import AttemptTable from '../components/AttemptTable'
import AttemptDetailModal from '../components/AttemptDetailModal'
import { useConfirm } from '../contexts/ConfirmContext'

export default function AttemptsPage() {
  const [searchParams] = useSearchParams()
  const msgIdFromUrl = searchParams.get('msgId')
  const endpointIdFromUrl = searchParams.get('endpointId')
  const confirm = useConfirm()

  const { selectedApp } = useAppStore()
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data: endpointsData } = useEndpoints(selectedApp?.id, { limit: 100 })
  const endpoints = endpointsData?.data || []

  // Auto-select endpoint from URL parameter
  useEffect(() => {
    if (endpointIdFromUrl && endpoints.length > 0 && !selectedEndpoint) {
      const endpoint = endpoints.find(ep => ep.id === endpointIdFromUrl)
      if (endpoint) {
        setSelectedEndpoint(endpoint)
      }
    }
  }, [endpointIdFromUrl, endpoints, selectedEndpoint])

  // Fetch attempts based on filters
  const {
    data: endpointAttemptsData,
    isLoading: isEndpointLoading,
    error: endpointError,
    refetch: refetchEndpoint,
  } = useAttemptsByEndpoint(
    selectedApp?.id && selectedEndpoint?.id && !msgIdFromUrl ? selectedApp?.id : null,
    selectedEndpoint?.id,
    { limit: 200 }
  )

  const {
    data: msgAttemptsData,
    isLoading: isMsgLoading,
    error: msgError,
    refetch: refetchMsg,
  } = useAttemptsByMsg(
    msgIdFromUrl && selectedApp?.id ? selectedApp?.id : null,
    msgIdFromUrl,
    { limit: 200 }
  )

  const {
    data: allAttemptsData,
    isLoading: isAllLoading,
    error: allError,
    refetch: refetchAll,
  } = useAllAttempts(
    !selectedEndpoint && !msgIdFromUrl && selectedApp?.id ? selectedApp?.id : null,
    { limit: 200 }
  )

  const resendMutation = useResendMessage()

  // Determine which data source to use
  const attempts = msgIdFromUrl
    ? (msgAttemptsData?.data || [])
    : selectedEndpoint
    ? (endpointAttemptsData?.data || [])
    : (allAttemptsData?.data || [])

  const isLoading = msgIdFromUrl ? isMsgLoading : selectedEndpoint ? isEndpointLoading : isAllLoading
  const error = msgIdFromUrl ? msgError : selectedEndpoint ? endpointError : allError
  const refetch = msgIdFromUrl ? refetchMsg : selectedEndpoint ? refetchEndpoint : refetchAll

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'success' && (attempt.status === 0 || attempt.status === 3)) ||
      (statusFilter === 'failed' && attempt.status === 2) ||
      (statusFilter === 'pending' && attempt.status === 1)

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (attempt) => {
    setSelectedAttempt(attempt)
    setIsDetailModalOpen(true)
  }

  const handleRetry = async (attempt) => {
    if (!selectedApp || !attempt.msgId || !attempt.endpointId) return

    const confirmed = await confirm({
      title: 'Retry Message',
      message: 'Are you sure you want to retry sending this message to the endpoint?',
      confirmText: 'Retry',
      cancelText: 'Cancel',
      variant: 'info'
    })

    if (confirmed) {
      await resendMutation.mutateAsync({
        appId: selectedApp.id,
        msgId: attempt.msgId,
        endpointId: attempt.endpointId,
      })
    }
  }

  const successCount = attempts.filter((a) => a.status === 0 || a.status === 3).length
  const failedCount = attempts.filter((a) => a.status === 2).length
  const pendingCount = attempts.filter((a) => a.status === 1).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Message Attempts</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor webhook delivery attempts and logs
        </p>
      </div>

      {selectedApp && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Endpoint (Optional)
          </label>
          <select
            value={selectedEndpoint?.id || ''}
            onChange={(e) => {
              const endpoint = endpoints.find((ep) => ep.id === e.target.value)
              setSelectedEndpoint(endpoint || null)
            }}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All endpoints</option>
            {endpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.description || ep.url}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show filter info when msgId is present */}
      {msgIdFromUrl && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Showing attempts for message: <span className="font-mono font-semibold">{msgIdFromUrl}</span>
          </p>
        </div>
      )}

      {selectedApp && (
        <>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Success</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {successCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Failed</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">{failedCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attempts..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Failed to load attempts
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredAttempts.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No attempts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No delivery attempts have been made yet'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredAttempts.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
              <AttemptTable
                attempts={filteredAttempts}
                onViewDetails={handleViewDetails}
                onRetry={handleRetry}
                appId={selectedApp?.id}
              />
            </div>
          )}
        </>
      )}

      <AttemptDetailModal
        attempt={selectedAttempt}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedAttempt(null)
        }}
        appId={selectedApp?.id}
      />
    </div>
  )
}
