import { Layers, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function AppSelector({ applications, selectedApp, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!applications || applications.length === 0) {
    return (
      <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
        No applications available. Please create an application first.
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[250px]"
      >
        <Layers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div className="flex-1 text-left">
          {selectedApp ? (
            <>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedApp.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {selectedApp.id}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">Select application...</div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                onSelect(app)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                selectedApp?.id === app.id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {app.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                {app.id}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
