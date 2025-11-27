import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      baseUrl: 'https://api.svix.com',

      setAuth: (token, baseUrl) =>
        set({
          token,
          baseUrl: baseUrl || 'https://api.svix.com',
        }),

      logout: () =>
        set({
          token: null,
          baseUrl: 'https://api.svix.com',
        }),

      updateBaseUrl: (baseUrl) => set({ baseUrl }),
    }),
    {
      name: 'svix-auth',
    }
  )
)
