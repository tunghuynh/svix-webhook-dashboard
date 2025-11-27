import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, RefreshCw, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import {
  useEndpoints,
  useCreateEndpoint,
  useUpdateEndpoint,
  useDeleteEndpoint,
} from '../hooks/useEndpoints'
import EndpointCard from '../components/EndpointCard'
import EndpointModal from '../components/EndpointModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useConfirm } from '../contexts/ConfirmContext'

export default function EndpointsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const endpointIdFromUrl = searchParams.get('endpointId')
  const appIdFromUrl = searchParams.get('appId')
  const confirm = useConfirm()

  const { selectedApp } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: endpointsData,
    isLoading,
    error,
    refetch,
  } = useEndpoints(selectedApp?.id, { limit: 100 })
  const createMutation = useCreateEndpoint()
  const updateMutation = useUpdateEndpoint()
  const deleteMutation = useDeleteEndpoint()

  const endpoints = endpointsData?.data || []

  const filteredEndpoints = useMemo(() => {
    let filtered = endpoints

    // Filter by endpoint ID from URL
    if (endpointIdFromUrl) {
      filtered = filtered.filter(ep => ep.id === endpointIdFromUrl)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ep) =>
          ep.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ep.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ep.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [endpoints, endpointIdFromUrl, searchQuery])

  const handleCreate = () => {
    if (!selectedApp) return
    setSelectedEndpoint(null)
    setIsModalOpen(true)
  }

  const handleEdit = (endpoint) => {
    setSelectedEndpoint(endpoint)
    setIsModalOpen(true)
  }

  const handleClone = (endpoint) => {
    // Create a copy with "Copy" suffix
    setSelectedEndpoint({
      ...endpoint,
      description: endpoint.description ? endpoint.description + ' Copy' : 'Copy',
      id: undefined, // Remove ID so it creates a new one
      uid: undefined, // Remove UID
      createdAt: undefined,
      updatedAt: undefined,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (endpoint) => {
    if (!selectedApp) return

    const confirmed = await confirm({
      title: 'Delete Endpoint',
      message: `Are you sure you want to delete this endpoint? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (confirmed) {
      await deleteMutation.mutateAsync({ appId: selectedApp.id, endpointId: endpoint.id })
    }
  }

  const handleConfigure = (endpoint) => {
    navigate(`/endpoints/${selectedApp.id}/${endpoint.id}/config`)
  }

  const handleSubmit = async (data) => {
    if (!selectedApp) return

    try {
      if (selectedEndpoint) {
        await updateMutation.mutateAsync({
          appId: selectedApp.id,
          endpointId: selectedEndpoint.id,
          data,
        })
      } else {
        await createMutation.mutateAsync({ appId: selectedApp.id, data })
      }
      setIsModalOpen(false)
      setSelectedEndpoint(null)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Endpoints</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage webhook endpoints for your applications
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!selectedApp}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Endpoint
        </button>
      </div>

      {selectedApp && (
        <>
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
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
                  Failed to load endpoints
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredEndpoints.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No endpoints found' : 'No endpoints yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by creating your first endpoint'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Endpoint
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredEndpoints.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEndpoints.map((endpoint) => (
                <EndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onConfigure={handleConfigure}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedApp && (
        <EndpointModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEndpoint(null)
          }}
          onSubmit={handleSubmit}
          endpoint={selectedEndpoint}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}
