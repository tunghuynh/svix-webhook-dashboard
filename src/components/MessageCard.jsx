import { MessageSquare, Calendar, Tag, Code, Eye } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'

export default function MessageCard({ message, onView }) {
  return (
    <div
      onClick={() => onView(message)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {message.eventType}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 truncate">
              {message.id}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onView(message)
          }}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {message.eventId && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded font-mono">
            <Tag className="w-3 h-3" />
            {message.eventId}
          </span>
        </div>
      )}

      {message.payload && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Payload Preview
            </span>
          </div>
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-hidden line-clamp-2 font-mono">
            {JSON.stringify(message.payload, null, 2)}
          </pre>
        </div>
      )}

      {message.channels && message.channels.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {message.channels.map((channel) => (
              <span
                key={channel}
                className="inline-flex items-center px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDateTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}
