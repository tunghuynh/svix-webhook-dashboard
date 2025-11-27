import { applicationsApi } from './api'
import { SYSTEM_CONFIG } from '../utils/constants'

/**
 * Load system configuration from application metadata
 */
export const loadSystemConfig = async () => {
  try {
    // Get all applications
    const response = await applicationsApi.list({ limit: 100 })
    const apps = response.data?.data || []

    // Find the system config application by UID
    const configApp = apps.find(app => app.uid === SYSTEM_CONFIG.APP_UID)

    if (configApp && configApp.metadata) {
      return {
        brandName: configApp.metadata.brandName || 'Svix',
        headerTitle: configApp.metadata.headerTitle || 'Svix Webhook Management',
        logoLight: configApp.metadata.logoLight || null,
        logoDark: configApp.metadata.logoDark || null,
      }
    }

    // Return defaults if not found
    return {
      brandName: 'Svix',
      headerTitle: 'Svix Webhook Management',
      logoLight: null,
      logoDark: null,
    }
  } catch (error) {
    console.error('Failed to load system config:', error)
    // Return defaults on error
    return {
      brandName: 'Svix',
      headerTitle: 'Svix Webhook Management',
      logoLight: null,
      logoDark: null,
    }
  }
}

/**
 * Save system configuration to application metadata
 */
export const saveSystemConfig = async (config) => {
  try {
    // Get all applications to find existing config app
    const response = await applicationsApi.list({ limit: 100 })
    const apps = response.data?.data || []
    const configApp = apps.find(app => app.uid === SYSTEM_CONFIG.APP_UID)

    const metadata = {
      brandName: config.brandName,
      headerTitle: config.headerTitle,
      logoLight: config.logoLight,
      logoDark: config.logoDark,
    }

    if (configApp) {
      // Update existing config application
      await applicationsApi.update(configApp.id, {
        name: SYSTEM_CONFIG.APP_NAME,
        uid: SYSTEM_CONFIG.APP_UID,
        metadata,
      })
    } else {
      // Create new config application
      await applicationsApi.create({
        name: SYSTEM_CONFIG.APP_NAME,
        uid: SYSTEM_CONFIG.APP_UID,
        metadata,
      })
    }

    return true
  } catch (error) {
    console.error('Failed to save system config:', error)
    throw error
  }
}
