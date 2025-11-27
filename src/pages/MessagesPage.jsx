import { useState, useMemo } from 'react'
import { Search, RefreshCw, AlertCircle, Send } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { useMessages, useCreateMessage } from '../hooks/useMessages'
import MessageTable from '../components/MessageTable'
import MessageModal from '../components/MessageModal'
import MessageDetailDrawer from '../components/MessageDetailDrawer'
import Pagination from '../components/Pagination'

const ITEMS_PER_PAGE = 20

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const msgIdFromUrl = searchParams.get('msgId')

  const { selectedApp } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useMessages(selectedApp?.id, { limit: 100 })
  const createMutation = useCreateMessage()

  const messages = messagesData?.data || []

  const filteredMessages = useMemo(() => {
    let filtered = messages

    // Filter by msgId from URL
    if (msgIdFromUrl) {
      filtered = filtered.filter(msg => msg.id === msgIdFromUrl)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (msg) =>
          msg.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.eventId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [messages, msgIdFromUrl, searchQuery])

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE)
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMessages.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredMessages, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSendMessage = () => {
    if (!selectedApp) return
    setIsModalOpen(true)
  }

  const handleViewMessage = (message) => {
    setSelectedMessage(message)
    setIsDetailModalOpen(true)
  }

  const handleSubmit = async (data) => {
    if (!selectedApp) return

    try {
      await createMutation.mutateAsync({ appId: selectedApp.id, data })
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send and manage webhook messages
          </p>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!selectedApp}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <Send className="w-5 h-5" />
          Send Message
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
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search messages..."
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
                  Failed to load messages
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredMessages.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No messages found' : 'No messages yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Send your first webhook message to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredMessages.length > 0 && (
            <>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
                <MessageTable
                  messages={paginatedMessages}
                  onViewDetails={handleViewMessage}
                  appId={selectedApp?.id}
                />
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredMessages.length}
                />
              )}
            </>
          )}
        </>
      )}

      {selectedApp && (
        <MessageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      )}

      <MessageDetailDrawer
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedMessage(null)
        }}
        message={selectedMessage}
        appId={selectedApp?.id}
      />
    </div>
  )
}
