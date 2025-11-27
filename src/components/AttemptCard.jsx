import { Activity, CheckCircle, XCircle, Clock, ExternalLink, RotateCw } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'

const getStatusColor = (status) => {
  switch (status) {
    case 0: // Success
    case 3: // Sending (treated as success)
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

export default function AttemptCard({ attempt, onRetry }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                attempt.status
              )}`}
            >
              {getStatusIcon(attempt.status)}
              {getStatusText(attempt.status)}
            </span>
            {attempt.responseStatusCode && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium ${
                  attempt.responseStatusCode >= 200 && attempt.responseStatusCode < 300
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}
              >
                {attempt.responseStatusCode}
              </span>
            )}
          </div>

          <a
            href={attempt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 truncate"
          >
            <span className="truncate">{attempt.url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>

          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 truncate">
            ID: {attempt.id}
          </p>
        </div>

        {attempt.status === 2 && onRetry && (
          <button
            onClick={() => onRetry(attempt)}
            className="ml-4 p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Retry"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        {attempt.responseDurationMs !== undefined && (
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">Response Time</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {attempt.responseDurationMs}ms
            </p>
          </div>
        )}

        {attempt.msgId && (
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-xs">Message ID</span>
            <p className="font-mono text-xs text-gray-900 dark:text-white truncate">
              {attempt.msgId}
            </p>
          </div>
        )}

        {attempt.endpointId && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Endpoint ID</span>
            <p className="font-mono text-xs text-gray-900 dark:text-white truncate">
              {attempt.endpointId}
            </p>
          </div>
        )}
      </div>

      {attempt.response && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Response
          </span>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-hidden line-clamp-2 font-mono">
            {attempt.response}
          </pre>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-800">
        <span>{formatDateTime(attempt.timestamp)}</span>
        {attempt.triggerType !== undefined && (
          <span>Trigger: {attempt.triggerType === 0 ? 'Automatic' : 'Manual'}</span>
        )}
      </div>
    </div>
  )
}
