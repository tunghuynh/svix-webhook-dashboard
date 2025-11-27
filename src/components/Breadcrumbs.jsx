import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  endpoints: 'Endpoints',
  messages: 'Messages',
  attempts: 'Attempts',
  'event-types': 'Event Types',
  settings: 'Settings',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Don't show breadcrumbs on login page or root
  if (location.pathname === '/' || location.pathname === '/login') {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4">
      <Link
        to="/dashboard"
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1)

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white">{label}</span>
            ) : (
              <Link
                to={to}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
