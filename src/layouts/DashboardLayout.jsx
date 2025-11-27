import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBrandStore } from '../store/brandStore'
import { useAppStore } from '../store/appStore'
import {
  Shield,
  Layers,
  Tag,
  Webhook,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  BarChart3,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useApplications } from '../hooks/useApplications'
import AppSelector from '../components/AppSelector'
import Breadcrumbs from '../components/Breadcrumbs'
import Footer from '../components/Footer'
import { filterSystemApps } from '../utils/appFilter'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Applications', href: '/applications', icon: Layers },
  { name: 'Event Types', href: '/event-types', icon: Tag },
  { name: 'Endpoints', href: '/endpoints', icon: Webhook },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Attempts', href: '/attempts', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout() {
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const { brandName, headerTitle, logoLight, logoDark } = useBrandStore()
  const { selectedApp, setSelectedApp } = useAppStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark'
    }
    return false
  })

  const { data: appsData } = useApplications({ limit: 100 })
  const allApplications = appsData?.data || []

  // Filter out system config application
  const applications = useMemo(() => filterSystemApps(allApplications), [allApplications])

  // Auto-select first application
  useEffect(() => {
    if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0])
    }
  }, [applications, selectedApp, setSelectedApp])

  // Check if current page should show app selector
  const showAppSelector = ['/dashboard', '/endpoints', '/messages', '/attempts'].some(
    path => location.pathname.startsWith(path)
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {(logoLight || logoDark) ? (
                <>
                  {logoLight && !darkMode && (
                    <img src={logoLight} alt={brandName} className="h-8 w-auto" />
                  )}
                  {logoDark && darkMode && (
                    <img src={logoDark} alt={brandName} className="h-8 w-auto" />
                  )}
                </>
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {brandName}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {darkMode ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">Dark Mode</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 dark:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 flex-1">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {headerTitle}
              </span>
            </div>

            {/* Application Selector - aligned to right */}
            {showAppSelector && (
              <div className="ml-auto w-full sm:w-auto max-w-xs">
                <AppSelector
                  applications={applications}
                  selectedApp={selectedApp}
                  onSelect={setSelectedApp}
                />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Breadcrumbs />
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
