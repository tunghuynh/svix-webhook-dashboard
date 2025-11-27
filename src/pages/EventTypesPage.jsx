import { useState } from 'react'
import { Plus, Search, RefreshCw, AlertCircle, Archive, CheckCircle } from 'lucide-react'
import {
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '../hooks/useEventTypes'
import EventTypeCard from '../components/EventTypeCard'
import EventTypeModal from '../components/EventTypeModal'
import { useConfirm } from '../contexts/ConfirmContext'

export default function EventTypesPage() {
  const confirm = useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const { data, isLoading, error, refetch } = useEventTypes({ limit: 100 })
  const createMutation = useCreateEventType()
  const updateMutation = useUpdateEventType()
  const deleteMutation = useDeleteEventType()

  const eventTypes = data?.data || []

  const filteredEventTypes = eventTypes
    .filter((et) => showArchived || !et.archived)
    .filter(
      (et) =>
        et.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        et.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleCreate = () => {
    setSelectedEventType(null)
    setIsModalOpen(true)
  }

  const handleEdit = (eventType) => {
    setSelectedEventType(eventType)
    setIsModalOpen(true)
  }

  const handleClone = (eventType) => {
    // Create a copy with "Copy" prefix in description only
    setSelectedEventType({
      ...eventType,
      name: undefined, // Clear name so it can be edited
      description: eventType.description ? 'Copy ' + eventType.description : 'Copy',
      createdAt: undefined,
      updatedAt: undefined,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (eventType) => {
    const confirmed = await confirm({
      title: 'Delete Event Type',
      message: `Are you sure you want to delete "${eventType.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (confirmed) {
      await deleteMutation.mutateAsync(eventType.name)
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (selectedEventType) {
        await updateMutation.mutateAsync({ eventTypeName: selectedEventType.name, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setIsModalOpen(false)
      setSelectedEventType(null)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  const activeCount = eventTypes.filter((et) => !et.archived).length
  const archivedCount = eventTypes.filter((et) => et.archived).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Types</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define and manage webhook event types
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Event Type
        </button>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event types..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2.5 border rounded-lg transition-colors font-medium flex items-center gap-2 ${
            showArchived
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Archive className="w-5 h-5" />
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>

        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {activeCount} Active
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {archivedCount} Archived
          </span>
        </div>
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
              Failed to load event types
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredEventTypes.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No event types found' : 'No event types yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by creating your first event type'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Event Type
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && filteredEventTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.name}
              eventType={eventType}
              onClone={handleClone}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EventTypeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEventType(null)
        }}
        onSubmit={handleSubmit}
        eventType={selectedEventType}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
