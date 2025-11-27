import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, AlertCircle } from 'lucide-react'
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
} from '../hooks/useApplications'
import { useAppStore } from '../store/appStore'
import ApplicationCard from '../components/ApplicationCard'
import ApplicationModal from '../components/ApplicationModal'
import Pagination from '../components/Pagination'
import { filterSystemApps } from '../utils/appFilter'
import { useConfirm } from '../contexts/ConfirmContext'

const ITEMS_PER_PAGE = 12

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const { setSelectedApp: setGlobalApp } = useAppStore()
  const confirm = useConfirm()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error, refetch } = useApplications({ limit: 100 })
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()
  const deleteMutation = useDeleteApplication()

  const applications = data?.data || []

  // Filter out system config application and apply search
  const filteredApps = useMemo(() => {
    const userApps = filterSystemApps(applications)
    return userApps.filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [applications, searchQuery])

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE)
  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredApps.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredApps, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCreate = () => {
    setSelectedApp(null)
    setIsModalOpen(true)
  }

  const handleEdit = (app) => {
    setSelectedApp(app)
    setIsModalOpen(true)
  }

  const handleClone = (app) => {
    // Create a copy with "Copy" suffix
    setSelectedApp({
      ...app,
      name: app.name + ' Copy',
      id: undefined, // Remove ID so it creates a new one
      uid: undefined, // Remove UID
      createdAt: undefined,
      updatedAt: undefined,
    })
    setIsModalOpen(true)
  }

  const handleSelectApp = (app) => {
    setGlobalApp(app)
    navigate('/endpoints')
  }

  const handleDelete = async (app) => {
    const confirmed = await confirm({
      title: 'Delete Application',
      message: `Are you sure you want to delete "${app.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (confirmed) {
      await deleteMutation.mutateAsync(app.id)
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (selectedApp) {
        await updateMutation.mutateAsync({ appId: selectedApp.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setIsModalOpen(false)
      setSelectedApp(null)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your webhook applications
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Application
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
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
              Failed to load applications
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredApps.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by creating your first application'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Application
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && filteredApps.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClone={handleClone}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={handleSelectApp}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredApps.length}
            />
          )}
        </>
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedApp(null)
        }}
        onSubmit={handleSubmit}
        application={selectedApp}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
