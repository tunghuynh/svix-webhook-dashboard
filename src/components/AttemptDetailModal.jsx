import { X, CheckCircle, XCircle, Clock, Copy, Code, Hash, ExternalLink, Activity } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import { useAttempt } from '../hooks/useMessages'
import { useMessage } from '../hooks/useMessages'
import toast from 'react-hot-toast'
import SyntaxHighlight from './SyntaxHighlight'

const getStatusColor = (status) => {
  switch (status) {
    case 0:
    case 3:
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 1:
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 2:
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 0:
    case 3:
      return <CheckCircle className="w-5 h-5" />
    case 1:
      return <Clock className="w-5 h-5" />
    case 2:
      return <XCircle className="w-5 h-5" />
    default:
      return <Activity className="w-5 h-5" />
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

export default function AttemptDetailModal({ attempt, isOpen, onClose, appId }) {
  // Fetch full attempt details
  const { data: fullAttempt, isLoading: attemptLoading } = useAttempt(
    appId,
    attempt?.msgId,
    attempt?.id
  )

  // Fetch message details for request body
  const { data: message, isLoading: messageLoading } = useMessage(
    appId,
    attempt?.msgId
  )

  const attemptData = fullAttempt || attempt
  const isLoading = attemptLoading || messageLoading

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (!isOpen || !attempt) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Attempt Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Overview Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                    Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</span>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border font-medium ${getStatusColor(
                          attemptData.status
                        )}`}
                      >
                        {getStatusIcon(attemptData.status)}
                        {getStatusText(attemptData.status)}
                      </span>
                    </div>

                    {/* Response Status Code */}
                    {attemptData.responseStatusCode && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          HTTP Status Code
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded font-mono font-medium ${
                            attemptData.responseStatusCode >= 200 && attemptData.responseStatusCode < 300
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {attemptData.responseStatusCode}
                        </span>
                      </div>
                    )}

                    {/* Response Time */}
                    {attemptData.responseDurationMs !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Response Time
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {attemptData.responseDurationMs}ms
                        </span>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Timestamp</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDateTime(attemptData.timestamp)}
                      </span>
                    </div>

                    {/* Attempt ID */}
                    <div className="md:col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Attempt ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {attemptData.id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(attemptData.id)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Message ID */}
                    <div className="md:col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Message ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {attemptData.msgId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(attemptData.msgId)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Endpoint ID */}
                    {attemptData.endpointId && (
                      <div className="md:col-span-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Endpoint ID
                        </span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {attemptData.endpointId}
                        </span>
                      </div>
                    )}

                    {/* Trigger Type */}
                    {attemptData.triggerType !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Trigger Type
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {attemptData.triggerType === 0 ? 'Automatic' : 'Manual'}
                        </span>
                      </div>
                    )}

                    {/* URL */}
                    <div className="md:col-span-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">URL</span>
                      <a
                        href={attemptData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 break-all"
                      >
                        {attemptData.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Request Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Request
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* HTTP Method & URL */}
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                        Method & URL
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium rounded">
                          POST
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 break-all">
                          {attemptData.url}
                        </span>
                      </div>
                    </div>

                    {/* Request Headers (from endpoint) */}
                    {/* <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Headers</span>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                          {attemptData.requestHeaders
                            ? JSON.stringify(attemptData.requestHeaders, null, 2)
                            : '// Standard webhook headers\n// Content-Type: application/json\n// Svix-Id: ...\n// Svix-Timestamp: ...\n// Svix-Signature: ...'}
                        </pre>
                      </div>
                    </div> */}

                    {/* Request Body (from message payload) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Body</span>
                        {message?.payload && (
                          <button
                            onClick={() =>
                              copyToClipboard(JSON.stringify(message.payload, null, 2))
                            }
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-64 overflow-auto">
                        {message?.payload ? (
                          <SyntaxHighlight
                            code={JSON.stringify(message.payload, null, 2)}
                            language="json"
                          />
                        ) : (
                          <pre className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            // Loading...
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Response
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status Code & Response Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Status Code
                        </span>
                        {attemptData.responseStatusCode ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded font-mono font-medium ${
                              attemptData.responseStatusCode >= 200 &&
                              attemptData.responseStatusCode < 300
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {attemptData.responseStatusCode}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </div>

                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          Response Time
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {attemptData.responseDurationMs !== undefined
                            ? `${attemptData.responseDurationMs}ms`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Response Headers */}
                    {attemptData.responseHeaders && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Headers</span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(attemptData.responseHeaders, null, 2)
                              )
                            }
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-48 overflow-auto">
                          <SyntaxHighlight
                            code={JSON.stringify(attemptData.responseHeaders, null, 2)}
                            language="json"
                          />
                        </div>
                      </div>
                    )}

                    {/* Response Body */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Body</span>
                        {attemptData.response && (
                          <button
                            onClick={() => copyToClipboard(attemptData.response)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-64 overflow-auto">
                        {attemptData.response ? (
                          <SyntaxHighlight code={attemptData.response} language="auto" />
                        ) : (
                          <pre className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            // No response body
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
