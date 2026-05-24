import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const uviewLuchRequestShim = fileURLToPath(
  new URL('./src/plugins/uview-luch-request-shim.ts', import.meta.url)
)

export default defineConfig({
  resolve: {
    alias: {
      // uview-plus@3.8.37 imports ../luch-request from its props config, but
      // the npm package only ships d.ts files at that relative path. The app
      // uses src/api/http.ts for real API calls, so keep this as a narrow
      // compatibility shim instead of adding another HTTP client dependency.
      '../luch-request': uviewLuchRequestShim,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "uview-plus/theme.scss";'
      }
    }
  },
  plugins: [uni()],
})
