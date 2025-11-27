import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '../services/api'
import toast from 'react-hot-toast'
import { showErrorToast } from '../utils/errorHandler'

export const useApplications = (params = {}) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async () => {
      const response = await applicationsApi.list(params)
      return response.data
    },
  })
}

export const useApplication = (appId) => {
  return useQuery({
    queryKey: ['application', appId],
    queryFn: async () => {
      const response = await applicationsApi.get(appId)
      return response.data
    },
    enabled: !!appId,
  })
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application created successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to create application')
    },
  })
}

export const useUpdateApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, data }) => applicationsApi.update(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] })
      toast.success('Application updated successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to update application')
    },
  })
}

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appId) => applicationsApi.delete(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application deleted successfully')
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to delete application')
    },
  })
}
