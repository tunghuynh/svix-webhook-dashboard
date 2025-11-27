import { Eye, Tag, Hash, MessageSquare, Webhook, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useAttemptsByMsg } from '../hooks/useMessages'
import { useEndpoints } from '../hooks/useEndpoints'
import CopyButton from './CopyButton'

// Component to display attempt statistics for a message
function MessageAttemptStats({ appId, msgId, onClick }) {
  const { data: attemptsData, isLoading } = useAttemptsByMsg(appId, msgId, { limit: 100 })
  const attempts = attemptsData?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  const successCount = attempts.filter(a => a.status === 0 || a.status === 3).length
  const failedCount = attempts.filter(a => a.status === 2).length
  const pendingCount = attempts.filter(a => a.status === 1).length

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
      title="Click to view attempts"
    >
      {successCount > 0 && (
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">{successCount}</span>
        </div>
      )}
      {failedCount > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-700 dark:text-red-300">{failedCount}</span>
        </div>
      )}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{pendingCount}</span>
        </div>
      )}
      {attempts.length === 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">No attempts</span>
      )}
    </button>
  )
}

// Component to get and display endpoints for a message
function MessageEndpoints({ appId, msgId, onEndpointClick }) {
  const { data: attemptsData, isLoading } = useAttemptsByMsg(appId, msgId, { limit: 100 })
  const { data: endpointsData } = useEndpoints(appId, { limit: 100 })

  const attempts = attemptsData?.data || []
  const endpoints = endpointsData?.data || []

  if (isLoading) {
    return <span className="text-xs text-gray-500">Loading...</span>
  }

  // Get unique endpoint IDs from attempts
  const uniqueEndpointIds = [...new Set(attempts.map(a => a.endpointId).filter(Boolean))]

  if (uniqueEndpointIds.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-gray-400">No endpoints</span>
  }

  const getEndpointName = (endpointId) => {
    const endpoint = endpoints.find(ep => ep.id === endpointId)
    if (endpoint?.description) {
      return endpoint.description.length > 30
        ? endpoint.description.substring(0, 30) + "..."
        : endpoint.description
    }
    return endpointId.length > 10
      ? endpointId.substring(0, 10) + "..."
      : endpointId
  }

  return (
    <div className="flex flex-wrap gap-1">
      {uniqueEndpointIds.map(endpointId => (
        <button
          key={endpointId}
          onClick={(e) => onEndpointClick(endpointId, e)}
          className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-1"
          title={`Click to view endpoint: ${getEndpointName(endpointId)}`}
        >
          <Webhook className="w-3 h-3" />
          {getEndpointName(endpointId)}
        </button>
      ))}
    </div>
  )
}

export default function MessageTable({ messages, onViewDetails, appId }) {
  const navigate = useNavigate()

  const handleMessageIdClick = (message, e) => {
    e.stopPropagation()
    navigate(`/attempts?msgId=${message.id}`)
  }

  const handleEndpointClick = (endpointId, e) => {
    e.stopPropagation()
    navigate(`/endpoints?endpointId=${endpointId}`)
  }

  const handleAttemptStatsClick = (message, e) => {
    e.stopPropagation()
    navigate(`/attempts?msgId=${message.id}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Event Type & Endpoints
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Message Info
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attempt Stats
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {messages.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No messages found
              </td>
            </tr>
          ) : (
            messages.map((message) => (
              <tr
                key={message.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Event Type & Endpoints Column */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded" title={message.eventType}>
                        {message.eventType.length > 30
                          ? message.eventType.substring(0, 30) + "..."
                          : message.eventType}
                      </span>
                    </div>
                    <MessageEndpoints
                      appId={appId}
                      msgId={message.id}
                      onEndpointClick={handleEndpointClick}
                    />
                  </div>
                </td>

                {/* Message Info Column */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {/* Event ID */}
                    {message.eventId && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Event ID:</span>
                        <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {message.eventId}
                        </span>
                        <CopyButton text={message.eventId} label="Event ID" />
                      </div>
                    )}

                    {/* Message ID - Clickable */}
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Message ID:</span>
                      <button
                        onClick={(e) => handleMessageIdClick(message, e)}
                        className="text-xs font-mono text-primary-600 dark:text-primary-400 hover:underline"
                        title="View attempts for this message"
                      >
                        {message.id}
                      </button>
                      <CopyButton text={message.id} label="Message ID" />
                    </div>

                    {/* Channels */}
                    {message.channels && message.channels.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Channels:</span>
                        {message.channels.map((channel) => (
                          <span
                            key={channel}
                            className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expiration if available */}
                    {message.expiration && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Expires: {formatDateTime(message.expiration)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Attempt Stats Column */}
                <td className="px-4 py-4">
                  <MessageAttemptStats
                    appId={appId}
                    msgId={message.id}
                    onClick={(e) => handleAttemptStatsClick(message, e)}
                  />
                </td>

                {/* Created At Column */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(message.timestamp)}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onViewDetails(message)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
