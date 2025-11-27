import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Hash, ExternalLink, Activity, CheckCircle, XCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown, RotateCw, Webhook } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import { useEndpoints } from '../hooks/useEndpoints'
import CopyButton from './CopyButton'

const getStatusColor = (status) => {
  switch (status) {
    case 0: // Success
    case 3: // Sending
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 1: // Pending
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 2: // Failed
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 0:
    case 3:
      return <CheckCircle className="w-4 h-4" />
    case 1:
      return <Clock className="w-4 h-4" />
    case 2:
      return <XCircle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Success'
    case 1:
      return 'Pending'
    case 2:
      return 'Failed'
    case 3:
      return 'Sending'
    default:
      return 'Unknown'
  }
}

const getResponseTimeColor = (ms) => {
  if (ms < 500) return 'text-green-600 dark:text-green-400'
  if (ms < 2000) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export default function AttemptTable({ attempts, onViewDetails, onRetry, appId }) {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('timestamp') // 'timestamp' or 'responseTime'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' or 'desc'

  // Fetch endpoints to get endpoint names
  const { data: endpointsData } = useEndpoints(appId, { limit: 100 })
  const endpoints = endpointsData?.data || []
  
  const getEndpointName = (endpointId) => {
    const endpoint = endpoints.find(ep => ep.id === endpointId)
    return endpoint?.description || (endpointId.substring(0, 10) + "...")
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const sortedAttempts = [...attempts].sort((a, b) => {
    let aValue, bValue

    if (sortBy === 'responseTime') {
      aValue = a.responseDurationMs ?? Infinity
      bValue = b.responseDurationMs ?? Infinity
    } else {
      // timestamp
      aValue = new Date(a.timestamp).getTime()
      bValue = new Date(b.timestamp).getTime()
    }

    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3" />
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Message ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attempt Info
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('timestamp')}
            >
              <div className="flex items-center gap-1">
                Created At
                <SortIcon column="timestamp" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('responseTime')}
            >
              <div className="flex items-center gap-1">
                Response Time
                <SortIcon column="responseTime" />
              </div>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {sortedAttempts.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No attempts found
              </td>
            </tr>
          ) : (
            sortedAttempts.map((attempt) => (
              <tr
                key={attempt.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Message ID Column */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    {attempt.msgId ? (
                      <>
                        <button
                          onClick={() => navigate(`/messages?msgId=${attempt.msgId}`)}
                          className="text-xs font-mono text-primary-600 dark:text-primary-400 hover:underline"
                          title="View message details"
                        >
                          {attempt.msgId}
                        </button>
                        <CopyButton text={attempt.msgId} label="Message ID" />
                      </>
                    ) : (
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300">N/A</span>
                    )}
                  </div>
                </td>

                {/* Attempt Info Column */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                          attempt.status
                        )}`}
                      >
                        {getStatusIcon(attempt.status)}
                        {getStatusText(attempt.status)}
                      </span>
                      {attempt.responseStatusCode && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                            attempt.responseStatusCode >= 200 && attempt.responseStatusCode < 300
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {attempt.responseStatusCode}
                        </span>
                      )}
                    </div>

                    {/* URL */}
                    <a
                      href={attempt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 max-w-md truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate">{attempt.url.substring(0, 50) + "..."}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>

                    {/* Attempt ID */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      <span>ID: {attempt.id}</span>
                      <CopyButton text={attempt.id} label="Attempt ID" />
                    </div>

                    {/* Endpoint - Clickable */}
                    {attempt.endpointId && (
                      <div className="flex items-center gap-1 text-xs">
                        <Webhook className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Endpoint:</span>
                        <button
                          onClick={() => navigate(`/endpoints?endpointId=${attempt.endpointId}`)}
                          className="text-primary-600 dark:text-primary-400 hover:underline truncate max-w-xs"
                          title="View endpoint details"
                        >
                          {getEndpointName(attempt.endpointId)}
                        </button>
                        <CopyButton text={attempt.endpointId} label="Endpoint ID" />
                      </div>
                    )}

                    {/* Trigger Type */}
                    {attempt.triggerType !== undefined && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Trigger: {attempt.triggerType === 0 ? 'Automatic' : 'Manual'}
                      </div>
                    )}
                  </div>
                </td>

                {/* Created At Column */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(attempt.timestamp)}
                  </div>
                </td>

                {/* Response Time Column */}
                <td className="px-4 py-4">
                  {attempt.responseDurationMs !== undefined ? (
                    <div className={`text-sm font-medium ${getResponseTimeColor(attempt.responseDurationMs)}`}>
                      {attempt.responseDurationMs}ms
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">N/A</div>
                  )}
                </td>

                {/* Actions Column */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(attempt)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-xs font-medium"
                      title="View details"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    {attempt.status === 2 && onRetry && (
                      <button
                        onClick={() => onRetry(attempt)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors text-xs font-medium"
                        title="Retry"
                      >
                        <RotateCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
