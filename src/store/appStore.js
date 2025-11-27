import { create } from 'zustand'

export const useAppStore = create((set) => ({
  selectedApp: null,
  setSelectedApp: (app) => set({ selectedApp: app }),
}))
