export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_TYPE: 'tokenType',
  TOKEN_EXPIRATION: 'tokenExpiration',
  IS_LOGGED_IN: 'isLoggedIn',
  REMEMBER_ME: 'rememberMe',
  
  // Theme
  THEME: 'theme',
  
  // Strava
  STRAVA_AUTH_SESSION: 'strava_auth_session',
  
  // User preferences
  USER_PREFERENCES: 'userPreferences',
  LANGUAGE: 'language',
  TIMEZONE: 'timezone'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]; 