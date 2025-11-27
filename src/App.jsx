import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useBrandStore } from './store/brandStore'

// Components
import ErrorBoundary from './components/ErrorBoundary'
import { ConfirmProvider } from './contexts/ConfirmContext'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import EventTypesPage from './pages/EventTypesPage'
import EndpointsPage from './pages/EndpointsPage'
import EndpointConfigPage from './pages/EndpointConfigPage'
import MessagesPage from './pages/MessagesPage'
import AttemptsPage from './pages/AttemptsPage'
import SettingsPage from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Query error:', error)
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { token } = useAuthStore()
  const { loadConfig } = useBrandStore()

  // Load brand config from API when user is authenticated
  useEffect(() => {
    if (token) {
      loadConfig()
    }
  }, [token, loadConfig])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="event-types" element={<EventTypesPage />} />
                <Route path="endpoints" element={<EndpointsPage />} />
                <Route path="endpoints/:appId/:endpointId/config" element={<EndpointConfigPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="attempts" element={<AttemptsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ConfirmProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
