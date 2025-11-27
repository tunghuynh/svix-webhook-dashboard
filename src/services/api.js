import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const createApiClient = () => {
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const { token, baseUrl } = useAuthStore.getState()
      config.baseURL = baseUrl
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

// Applications API
export const applicationsApi = {
  list: (params = {}) =>
    apiClient.get('/api/v1/app', { params }),

  get: (appId) =>
    apiClient.get(`/api/v1/app/${appId}`),

  create: (data) =>
    apiClient.post('/api/v1/app', data),

  update: (appId, data) =>
    apiClient.put(`/api/v1/app/${appId}`, data),

  delete: (appId) =>
    apiClient.delete(`/api/v1/app/${appId}`),
}

// Event Types API
export const eventTypesApi = {
  list: (params = {}) =>
    apiClient.get('/api/v1/event-type', { params }),

  get: (eventTypeName) =>
    apiClient.get(`/api/v1/event-type/${eventTypeName}`),

  create: (data) =>
    apiClient.post('/api/v1/event-type', data),

  update: (eventTypeName, data) =>
    apiClient.put(`/api/v1/event-type/${eventTypeName}`, data),

  delete: (eventTypeName) =>
    apiClient.delete(`/api/v1/event-type/${eventTypeName}`),
}

// Endpoints API
export const endpointsApi = {
  list: (appId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint`, { params }),

  get: (appId, endpointId) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint/${endpointId}`),

  create: (appId, data) =>
    apiClient.post(`/api/v1/app/${appId}/endpoint`, data),

  update: (appId, endpointId, data) =>
    apiClient.put(`/api/v1/app/${appId}/endpoint/${endpointId}`, data),

  delete: (appId, endpointId) =>
    apiClient.delete(`/api/v1/app/${appId}/endpoint/${endpointId}`),

  // Headers
  getHeaders: (appId, endpointId) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint/${endpointId}/headers`),

  updateHeaders: (appId, endpointId, headers) =>
    apiClient.put(`/api/v1/app/${appId}/endpoint/${endpointId}/headers`, { headers }),

  patchHeaders: (appId, endpointId, headers) =>
    apiClient.patch(`/api/v1/app/${appId}/endpoint/${endpointId}/headers`, { headers }),

  // Secret
  getSecret: (appId, endpointId) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint/${endpointId}/secret`),

  rotateSecret: (appId, endpointId, data = {}) =>
    apiClient.post(`/api/v1/app/${appId}/endpoint/${endpointId}/secret/rotate`, data),

  // Stats
  getStats: (appId, endpointId) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint/${endpointId}/stats`),

  // Recover
  recover: (appId, endpointId, data) =>
    apiClient.post(`/api/v1/app/${appId}/endpoint/${endpointId}/recover`, data),

  // Replay missing
  replayMissing: (appId, endpointId, data) =>
    apiClient.post(`/api/v1/app/${appId}/endpoint/${endpointId}/replay-missing`, data),
}

// Messages API
export const messagesApi = {
  list: (appId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/msg`, { params }),

  get: (appId, msgId) =>
    apiClient.get(`/api/v1/app/${appId}/msg/${msgId}`),

  create: (appId, data) =>
    apiClient.post(`/api/v1/app/${appId}/msg`, data),

  expungeContent: (appId, msgId) =>
    apiClient.delete(`/api/v1/app/${appId}/msg/${msgId}/content`),
}

// Message Attempts API
export const attemptsApi = {
  // List all attempts for an app (aggregate from all messages)
  listAll: async (appId, params = {}) => {
    // Get all messages first
    const messagesResponse = await apiClient.get(`/api/v1/app/${appId}/msg`, { params: { limit: params.limit || 100 } })
    const messages = messagesResponse.data?.data || []

    // Fetch attempts for each message
    const attemptsPromises = messages.map(msg =>
      apiClient.get(`/api/v1/app/${appId}/attempt/msg/${msg.id}`, { params: { limit: 50 } })
        .then(res => res.data?.data || [])
        .catch(() => [])
    )

    const allAttemptsArrays = await Promise.all(attemptsPromises)
    const allAttempts = allAttemptsArrays.flat()

    return { data: { data: allAttempts } }
  },

  listByEndpoint: (appId, endpointId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/attempt/endpoint/${endpointId}`, { params }),

  listByMsg: (appId, msgId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/attempt/msg/${msgId}`, { params }),

  get: (appId, msgId, attemptId) =>
    apiClient.get(`/api/v1/app/${appId}/msg/${msgId}/attempt/${attemptId}`),

  listAttemptedMessages: (appId, endpointId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/endpoint/${endpointId}/msg`, { params }),

  listAttemptedDestinations: (appId, msgId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/msg/${msgId}/endpoint`, { params }),

  listAttemptsForEndpoint: (appId, msgId, endpointId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/msg/${msgId}/endpoint/${endpointId}/attempt`, { params }),

  resend: (appId, msgId, endpointId) =>
    apiClient.post(`/api/v1/app/${appId}/msg/${msgId}/endpoint/${endpointId}/resend`),
}

// Integration API
export const integrationApi = {
  listKeys: (appId, params = {}) =>
    apiClient.get(`/api/v1/app/${appId}/integration`, { params }),

  getKey: (appId, integId) =>
    apiClient.get(`/api/v1/app/${appId}/integration/${integId}`),

  createKey: (appId, data) =>
    apiClient.post(`/api/v1/app/${appId}/integration`, data),

  updateKey: (appId, integId, data) =>
    apiClient.put(`/api/v1/app/${appId}/integration/${integId}`, data),

  deleteKey: (appId, integId) =>
    apiClient.delete(`/api/v1/app/${appId}/integration/${integId}`),

  rotateKey: (appId, integId, data = {}) =>
    apiClient.post(`/api/v1/app/${appId}/integration/${integId}/key/rotate`, data),
}

// Health API
export const healthApi = {
  health: () =>
    apiClient.get('/api/v1/health'),
}
