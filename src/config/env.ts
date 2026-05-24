const DEFAULT_APP_API_BASE_URL = '/api/app/v1'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveAppApiBaseUrl(rawValue?: string): string {
  const value = rawValue?.trim()
  if (!value) {
    return DEFAULT_APP_API_BASE_URL
  }
  return trimTrailingSlash(value)
}

export const APP_API_BASE_URL = resolveAppApiBaseUrl(import.meta.env.VITE_APP_API_BASE_URL)
