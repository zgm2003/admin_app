import { session } from '@/hooks/useSession'

export const LOGIN_PAGE = '/views/login/index'
export const HOME_PAGE = '/views/home/index'

export interface AuthGuardSession {
  hydrate(): Promise<void>
  isAuthenticated: {
    readonly value: boolean
  }
}

export interface AuthNavigator {
  reLaunch(options: { url: string }): void
  switchTab(options: { url: string }): void
}

export function createAuthGuards(authSession: AuthGuardSession, navigator: AuthNavigator) {
  function redirectToLogin(): void {
    navigator.reLaunch({ url: LOGIN_PAGE })
  }

  function redirectToHome(): void {
    navigator.switchTab({ url: HOME_PAGE })
  }

  async function requireAuthenticatedPage(): Promise<boolean> {
    await authSession.hydrate()
    if (authSession.isAuthenticated.value) {
      return true
    }
    redirectToLogin()
    return false
  }

  return {
    redirectToLogin,
    redirectToHome,
    requireAuthenticatedPage,
  }
}

function createDefaultAuthGuards() {
  return createAuthGuards(session, uni)
}

export function redirectToLogin(): void {
  createDefaultAuthGuards().redirectToLogin()
}

export function redirectToHome(): void {
  createDefaultAuthGuards().redirectToHome()
}

export function requireAuthenticatedPage(): Promise<boolean> {
  return createDefaultAuthGuards().requireAuthenticatedPage()
}
