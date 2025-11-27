import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesApi, attemptsApi } from '../services/api'
import toast from 'react-hot-toast'
import { showErrorToast } from '../utils/errorHandler'

export const useMessages = (appId, params = {}) => {
  return useQuery({
    queryKey: ['messages', appId, params],
    queryFn: async () => {
      const response = await messagesApi.list(appId, params)
      return response.data
    },
    enabled: !!appId,
  })
}

export const useMessage = (appId, msgId) => {
  return useQuery({
    queryKey: ['message', appId, msgId],
    queryFn: async () => {
      const response = await messagesApi.get(appId, msgId)
      return response.data
    },
    enabled: !!appId && !!msgId,
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, data }) => messagesApi.create(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.appId] })
      toast.success('Message sent successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to send message')
    },
  })
}

export const useAllAttempts = (appId, params = {}) => {
  return useQuery({
    queryKey: ['attempts', 'all', appId, params],
    queryFn: async () => {
      const response = await attemptsApi.listAll(appId, params)
      return response.data
    },
    enabled: !!appId,
  })
}

export const useAttemptsByEndpoint = (appId, endpointId, params = {}) => {
  return useQuery({
    queryKey: ['attempts', 'endpoint', appId, endpointId, params],
    queryFn: async () => {
      const response = await attemptsApi.listByEndpoint(appId, endpointId, params)
      return response.data
    },
    enabled: !!appId && !!endpointId,
  })
}

export const useAttemptsByMessage = (appId, msgId, params = {}) => {
  return useQuery({
    queryKey: ['attempts', 'message', appId, msgId, params],
    queryFn: async () => {
      const response = await attemptsApi.listByMsg(appId, msgId, params)
      return response.data
    },
    enabled: !!appId && !!msgId,
  })
}

// Alias for consistency
export const useAttemptsByMsg = useAttemptsByMessage

export const useAttempt = (appId, msgId, attemptId) => {
  return useQuery({
    queryKey: ['attempt', appId, msgId, attemptId],
    queryFn: async () => {
      const response = await attemptsApi.get(appId, msgId, attemptId)
      return response.data
    },
    enabled: !!appId && !!msgId && !!attemptId,
  })
}

export const useResendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, msgId, endpointId }) =>
      attemptsApi.resend(appId, msgId, endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] })
      toast.success('Message resent successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to resend message')
    },
  })
}
