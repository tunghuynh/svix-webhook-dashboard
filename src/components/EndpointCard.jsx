import {  Webhook, Trash2, ExternalLink, CheckCircle, XCircle, Pause, Settings, Calendar, Clock, Hash, Copy } from 'lucide-react'
import { formatDateTime } from '../utils/helpers'
import CopyButton from './CopyButton'

export default function EndpointCard({ endpoint, onDelete, onConfigure, onClone }) {
  const getStatusColor = () => {
    if (endpoint.disabled) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
  }

  const getStatusIcon = () => {
    if (endpoint.disabled) return <Pause className="w-3 h-3" />
    return <CheckCircle className="w-3 h-3" />
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors flex-shrink-0">
            <Webhook className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {endpoint.description || 'Unnamed Endpoint'}
            </h3>
            <a
              href={endpoint.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mt-1 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{endpoint.url}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {endpoint.id}
              </p>
              <CopyButton text={endpoint.id} label="ID" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClone(endpoint)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Clone"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onConfigure(endpoint)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(endpoint)
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {endpoint.filterTypes && endpoint.filterTypes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Types:
            </p>
            <div className="flex flex-wrap gap-1">
              {endpoint.filterTypes.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                >
                  {type}
                </span>
              ))}
              {endpoint.filterTypes.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                  +{endpoint.filterTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {endpoint.channels && endpoint.channels.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Channels:</p>
            <div className="flex flex-wrap gap-1">
              {endpoint.channels.map((channel) => (
                <span
                  key={channel}
                  className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded"
                >
                  {channel}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-medium text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            {endpoint.disabled ? 'Disabled' : 'Active'}
          </div>

          {endpoint.version && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded font-medium">
              v{endpoint.version}
            </span>
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {endpoint.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created: {formatDateTime(endpoint.createdAt)}</span>
            </div>
          )}
          {endpoint.updatedAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated: {formatDateTime(endpoint.updatedAt)}</span>
            </div>
          )}
          {endpoint.uid && (
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span className="font-mono">UID: {endpoint.uid}</span>
            </div>
          )}
          {endpoint.rateLimit && (
            <div className="flex items-center gap-1">
              <span>Rate Limit: {endpoint.rateLimit}/period</span>
            </div>
          )}
          {endpoint.metadata && Object.keys(endpoint.metadata).length > 0 && (
            <div className="flex items-center gap-1">
              <span>Metadata: {Object.keys(endpoint.metadata).length} keys</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
