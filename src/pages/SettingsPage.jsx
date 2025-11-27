import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useBrandStore } from '../store/brandStore'
import { Server, Key, Trash2, Shield, Info, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../contexts/ConfirmContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()

  const { token, baseUrl, updateBaseUrl, logout } = useAuthStore()
  const { brandName, headerTitle, logoLight, logoDark, saveConfig, resetBrand } = useBrandStore()

  const [newBaseUrl, setNewBaseUrl] = useState(baseUrl)
  const [showToken, setShowToken] = useState(false)

  // Brand form state
  const [newBrandName, setNewBrandName] = useState(brandName)
  const [newHeaderTitle, setNewHeaderTitle] = useState(headerTitle)
  const [newLogoLight, setNewLogoLight] = useState(logoLight || '')
  const [newLogoDark, setNewLogoDark] = useState(logoDark || '')

  const handleUpdateBaseUrl = () => {
    if (!newBaseUrl.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      new URL(newBaseUrl)
      updateBaseUrl(newBaseUrl)
      toast.success('API endpoint updated successfully')
    } catch (error) {
      toast.error('Invalid URL format')
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'warning'
    })

    if (confirmed) {
      logout()
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  const handleClearCache = async () => {
    const confirmed = await confirm({
      title: 'Clear Cache',
      message: 'This will clear all cached data and reload the application. Continue?',
      confirmText: 'Clear Cache',
      cancelText: 'Cancel',
      variant: 'warning'
    })

    if (confirmed) {
      localStorage.clear()
      sessionStorage.clear()
      toast.success('Cache cleared successfully')
      window.location.reload()
    }
  }

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      toast.success('Token copied to clipboard')
    }
  }

  const handleUpdateBrand = async () => {
    try {
      await saveConfig({
        brandName: newBrandName,
        headerTitle: newHeaderTitle,
        logoLight: newLogoLight || null,
        logoDark: newLogoDark || null,
      })
      toast.success('Brand settings updated successfully')
    } catch (error) {
      toast.error('Failed to save brand settings')
    }
  }

  const handleResetBrand = async () => {
    const confirmed = await confirm({
      title: 'Reset Brand Settings',
      message: 'Reset all brand settings to default? This will restore the default Svix branding.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'warning'
    })

    if (confirmed) {
      try {
        await resetBrand()
        setNewBrandName('Svix')
        setNewHeaderTitle('Svix Webhook Management')
        setNewLogoLight('')
        setNewLogoDark('')
        toast.success('Brand settings reset to default')
      } catch (error) {
        toast.error('Failed to reset brand settings')
      }
    }
  }

  const isBrandChanged =
    newBrandName !== brandName ||
    newHeaderTitle !== headerTitle ||
    newLogoLight !== (logoLight || '') ||
    newLogoDark !== (logoDark || '')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your dashboard configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Configuration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your Svix API endpoint
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newBaseUrl}
                    onChange={(e) => setNewBaseUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://api.svix.com"
                  />
                  <button
                    onClick={handleUpdateBaseUrl}
                    disabled={newBaseUrl === baseUrl}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    Update
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current: {baseUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Customization */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Brand Customization
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your dashboard branding
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Svix"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Displayed in sidebar and header
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Header Title
                </label>
                <input
                  type="text"
                  value={newHeaderTitle}
                  onChange={(e) => setNewHeaderTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Svix Webhook Management"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Displayed in page header
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL (Light Mode)
                </label>
                <input
                  type="url"
                  value={newLogoLight}
                  onChange={(e) => setNewLogoLight(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://example.com/logo-light.png"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Logo displayed in light mode (leave empty for default icon)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL (Dark Mode)
                </label>
                <input
                  type="url"
                  value={newLogoDark}
                  onChange={(e) => setNewLogoDark(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://example.com/logo-dark.png"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Logo displayed in dark mode (leave empty for default icon)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleUpdateBrand}
                  disabled={!isBrandChanged}
                  className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleResetBrand}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Reset to Default
                </button>
              </div>

              <p className="text-xs text-red-500 dark:text-red-400 mt-4">
                Brand settings are saved to the application and application metadata in the Svix database with the UID <strong>`app-system-config`</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Access Token */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Access Token
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Svix authentication token
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Token
                </label>
                <div className="flex gap-2">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token || ''}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={copyToken}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  To change your token, please logout and login again
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Irreversible actions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Clear Cache</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remove all cached data and refresh
                  </p>
                </div>
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Logout</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Sign out from this dashboard
                  </p>
                </div>
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
          {/* About */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  About
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard information
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Version</span>
                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Framework</span>
                <span className="font-medium text-gray-900 dark:text-white">React 18</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">API Version</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  <a
                    href="https://hub.docker.com/layers/svix/svix-server/v1/images/sha256-f3afa1cf85e998979a04c8f4c75724678d7a8b234f7510030d2f8c8f5157b017"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    svix/svix-server:v1
                  </a>
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Build Tool</span>
                <span className="font-medium text-gray-900 dark:text-white">Vite 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
