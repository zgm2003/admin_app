import type { App } from 'vue'

type UViewThemeMode = 'light' | 'dark'

type UViewRuntime = {
  color: {
    primary: string
    info: string
    default: string
    warning: string
    error: string
    success: string
    mainColor: string
    contentColor: string
    tipsColor: string
    lightColor: string
    borderColor: string
    bgColor: string
    disabledColor: string
  }
  config: {
    unit: 'px'
    type: readonly string[]
  }
  theme: {
    mode: UViewThemeMode
    version: number
    vars: Record<string, string>
  }
  zIndex: {
    toast: number
    noNetwork: number
    popup: number
    mask: number
    navbar: number
    topTips: number
    sticky: number
    indexListSticky: number
  }
}

const runtime: UViewRuntime = {
  color: {
    primary: '#3c9cff',
    info: '#909399',
    default: '#909399',
    warning: '#f9ae3d',
    error: '#f56c6c',
    success: '#5ac725',
    mainColor: '#303133',
    contentColor: '#606266',
    tipsColor: '#909399',
    lightColor: '#c0c4cc',
    borderColor: '#dadbde',
    bgColor: '#f3f4f6',
    disabledColor: '#c8c9cc',
  },
  config: {
    unit: 'px',
    type: ['primary', 'success', 'error', 'warning', 'info'] as const,
  },
  theme: {
    mode: 'light',
    version: 0,
    vars: {},
  },
  zIndex: {
    toast: 10090,
    noNetwork: 10080,
    popup: 10075,
    mask: 10070,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965,
  },
}

export function createUViewRuntime(): UViewRuntime {
  return {
    color: { ...runtime.color },
    config: {
      unit: runtime.config.unit,
      type: [...runtime.config.type] as readonly string[],
    },
    theme: {
      mode: runtime.theme.mode,
      version: runtime.theme.version,
      vars: { ...runtime.theme.vars },
    },
    zIndex: { ...runtime.zIndex },
  }
}

export function installUViewRuntime(app: App): UViewRuntime {
  const uViewRuntime = createUViewRuntime()
  const uniGlobal = globalThis as typeof globalThis & { uni?: { $u?: UViewRuntime } }
  const uniObject = uniGlobal.uni ?? (uniGlobal.uni = {})
  uniObject.$u = uViewRuntime
  app.config.globalProperties.$u = uViewRuntime
  return uViewRuntime
}
