import { Layers, Edit, Trash2, Calendar, ExternalLink, Clock, Copy } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import CopyButton from './CopyButton'

export default function ApplicationCard({ application, onEdit, onDelete, onClone, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(application)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
            <Layers className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words">
              {application.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
                {application.id}
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton text={application.id} label="ID" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClone(application)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Clone"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(application)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(application)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {application.metadata && Object.keys(application.metadata).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Metadata:
          </p>
          <div className="space-y-1">
            {Object.entries(application.metadata).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {key}:
                </span>
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Created: {formatDateTime(application.createdAt)}</span>
        </div>
        {application.updatedAt && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated: {formatDateTime(application.updatedAt)}</span>
          </div>
        )}
        {application.uid && (
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3 h-3" />
            <span className="font-mono">UID: {application.uid}</span>
            <div onClick={(e) => e.stopPropagation()}>
              <CopyButton text={application.uid} label="UID" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
