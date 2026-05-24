declare module 'uview-plus' {
  import type { App, Plugin } from 'vue'

  const plugin: Plugin
  export default plugin

  export function install(app: App): void
  export function mount$u(): void
}
