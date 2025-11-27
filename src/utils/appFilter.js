import { SYSTEM_CONFIG } from './constants'

/**
 * Filter out system config application from application list
 * @param {Array} applications - List of applications
 * @returns {Array} Filtered applications without system config app
 */
export const filterSystemApps = (applications) => {
  if (!Array.isArray(applications)) return []
  return applications.filter(app => app.uid !== SYSTEM_CONFIG.APP_UID)
}
