import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endpointsApi } from '../services/api'
import toast from 'react-hot-toast'
import { showErrorToast } from '../utils/errorHandler'

export const useEndpoints = (appId, params = {}) => {
  return useQuery({
    queryKey: ['endpoints', appId, params],
    queryFn: async () => {
      const response = await endpointsApi.list(appId, params)
      return response.data
    },
    enabled: !!appId,
  })
}

export const useEndpoint = (appId, endpointId) => {
  return useQuery({
    queryKey: ['endpoint', appId, endpointId],
    queryFn: async () => {
      const response = await endpointsApi.get(appId, endpointId)
      return response.data
    },
    enabled: !!appId && !!endpointId,
  })
}

export const useCreateEndpoint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, data }) => endpointsApi.create(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', variables.appId] })
      toast.success('Endpoint created successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to create endpoint')
    },
  })
}

export const useUpdateEndpoint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, endpointId, data }) => endpointsApi.update(appId, endpointId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', variables.appId] })
      queryClient.invalidateQueries({ queryKey: ['endpoint', variables.appId, variables.endpointId] })
      toast.success('Endpoint updated successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update endpoint')
    },
  })
}

export const useDeleteEndpoint = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, endpointId }) => endpointsApi.delete(appId, endpointId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', variables.appId] })
      toast.success('Endpoint deleted successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete endpoint')
    },
  })
}

export const useEndpointHeaders = (appId, endpointId) => {
  return useQuery({
    queryKey: ['endpointHeaders', appId, endpointId],
    queryFn: async () => {
      const response = await endpointsApi.getHeaders(appId, endpointId)
      return response.data
    },
    enabled: !!appId && !!endpointId,
  })
}

export const useUpdateEndpointHeaders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, endpointId, headers }) =>
      endpointsApi.updateHeaders(appId, endpointId, headers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['endpointHeaders', variables.appId, variables.endpointId]
      })
      toast.success('Headers updated successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update headers')
    },
  })
}

export const useEndpointSecret = (appId, endpointId) => {
  return useQuery({
    queryKey: ['endpointSecret', appId, endpointId],
    queryFn: async () => {
      const response = await endpointsApi.getSecret(appId, endpointId)
      return response.data
    },
    enabled: !!appId && !!endpointId,
  })
}

export const useRotateEndpointSecret = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, endpointId, data }) =>
      endpointsApi.rotateSecret(appId, endpointId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['endpointSecret', variables.appId, variables.endpointId]
      })
      toast.success('Secret rotated successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to rotate secret')
    },
  })
}

export const useEndpointStats = (appId, endpointId) => {
  return useQuery({
    queryKey: ['endpointStats', appId, endpointId],
    queryFn: async () => {
      const response = await endpointsApi.getStats(appId, endpointId)
      return response.data
    },
    enabled: !!appId && !!endpointId,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}
