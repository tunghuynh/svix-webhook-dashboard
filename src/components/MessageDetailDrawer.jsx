import { X, CheckCircle, XCircle, Clock, Copy, Code, Tag, Hash } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import { useAttemptsByMsg } from '../hooks/useMessages'
import AttemptCard from './AttemptCard'
import toast from 'react-hot-toast'
import SyntaxHighlight from './SyntaxHighlight'

export default function MessageDetailDrawer({ message, isOpen, onClose, appId }) {
  const { data: attemptsData, isLoading: attemptsLoading } = useAttemptsByMsg(
    appId,
    message?.id,
    { limit: 100 }
  )

  const attempts = attemptsData?.data || []

  // Calculate statistics
  const successCount = attempts.filter((a) => a.status === 0 || a.status === 3).length
  const failedCount = attempts.filter((a) => a.status === 2).length
  const pendingCount = attempts.filter((a) => a.status === 1).length

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (!isOpen || !message) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Message Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message Information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Message Information
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Event Type:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.eventType}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Message ID:</span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {message.id}
                    </p>
                    <button
                      onClick={() => copyToClipboard(message.id)}
                      className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {message.eventId && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Event ID:</span>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {message.eventId}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Timestamp:</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(message.timestamp)}
                  </p>
                </div>
              </div>

              {message.expiration && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Expiration:</span>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {formatDateTime(message.expiration)}
                    </p>
                  </div>
                </div>
              )}

              {message.channels && message.channels.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Channels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.channels.map((channel) => (
                        <span
                          key={channel}
                          className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payload */}
          {message.payload && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Payload
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(message.payload, null, 2))}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div className="overflow-x-auto bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                <SyntaxHighlight
                  code={JSON.stringify(message.payload, null, 2)}
                  language="json"
                />
              </div>
            </div>
          )}

          {/* Attempt Statistics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Delivery Attempts
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Success
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {successCount}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    Failed
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {failedCount}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Pending
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {pendingCount}
                </p>
              </div>
            </div>

            {/* Attempts List */}
            {attemptsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : attempts.length > 0 ? (
              <div className="space-y-3">
                {attempts.map((attempt) => (
                  <AttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No delivery attempts yet
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
