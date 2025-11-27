import { Tag, Edit, Trash2, FileText, Archive, Calendar, Clock, Copy } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'

export default function EventTypeCard({ eventType, onEdit, onDelete, onClone }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
            <Tag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white break-words">
              {eventType.name}
            </h3>
            {eventType.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words">
                {eventType.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClone(eventType)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Clone"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(eventType)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(eventType)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {eventType.schemas && Object.keys(eventType.schemas).length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.keys(eventType.schemas).map((version) => (
            <span
              key={version}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded"
            >
              <FileText className="w-3 h-3" />
              Schema: {version}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {eventType.archived !== undefined && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium ${
                  eventType.archived
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                }`}
              >
                {eventType.archived ? (
                  <>
                    <Archive className="w-3 h-3" />
                    Archived
                  </>
                ) : (
                  'Active'
                )}
              </span>
            )}
          </div>

          {eventType.featureFlag && (
            <span className="text-gray-500 dark:text-gray-400 font-mono">
              Flag: {eventType.featureFlag}
            </span>
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {eventType.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created: {formatDateTime(eventType.createdAt)}</span>
            </div>
          )}
          {eventType.updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated: {formatDateTime(eventType.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
