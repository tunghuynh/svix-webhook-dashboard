import { create } from 'zustand'
import { loadSystemConfig, saveSystemConfig } from '../services/systemConfig'

export const useBrandStore = create((set, get) => ({
  brandName: 'Svix',
  headerTitle: 'Svix Webhook Management',
  logoLight: null,
  logoDark: null,
  isLoading: false,

  // Load config from API
  loadConfig: async () => {
    set({ isLoading: true })
    try {
      const config = await loadSystemConfig()
      set({
        brandName: config.brandName,
        headerTitle: config.headerTitle,
        logoLight: config.logoLight,
        logoDark: config.logoDark,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load brand config:', error)
      set({ isLoading: false })
    }
  },

  // Save config to API
  saveConfig: async (config) => {
    try {
      await saveSystemConfig(config)
      set({
        brandName: config.brandName,
        headerTitle: config.headerTitle,
        logoLight: config.logoLight,
        logoDark: config.logoDark,
      })
      return true
    } catch (error) {
      console.error('Failed to save brand config:', error)
      throw error
    }
  },

  setBrandName: (name) => set({ brandName: name }),
  setHeaderTitle: (title) => set({ headerTitle: title }),
  setLogoLight: (url) => set({ logoLight: url }),
  setLogoDark: (url) => set({ logoDark: url }),

  resetBrand: async () => {
    const defaultConfig = {
      brandName: 'Svix',
      headerTitle: 'Svix Webhook Management',
      logoLight: null,
      logoDark: null,
    }

    try {
      await saveSystemConfig(defaultConfig)
      set(defaultConfig)
    } catch (error) {
      console.error('Failed to reset brand config:', error)
      throw error
    }
  },
}))
