import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventTypesApi } from '../services/api'
import toast from 'react-hot-toast'
import { showErrorToast } from '../utils/errorHandler'

export const useEventTypes = (params = {}) => {
  return useQuery({
    queryKey: ['eventTypes', params],
    queryFn: async () => {
      const response = await eventTypesApi.list(params)
      return response.data
    },
  })
}

export const useEventType = (eventTypeName) => {
  return useQuery({
    queryKey: ['eventType', eventTypeName],
    queryFn: async () => {
      const response = await eventTypesApi.get(eventTypeName)
      return response.data
    },
    enabled: !!eventTypeName,
  })
}

export const useCreateEventType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => eventTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
      toast.success('Event type created successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to create event type')
    },
  })
}

export const useUpdateEventType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventTypeName, data }) => eventTypesApi.update(eventTypeName, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
      queryClient.invalidateQueries({ queryKey: ['eventType', variables.eventTypeName] })
      toast.success('Event type updated successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update event type')
    },
  })
}

export const useDeleteEventType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventTypeName) => eventTypesApi.delete(eventTypeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
      toast.success('Event type deleted successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete event type')
    },
  })
}
