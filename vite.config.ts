import process from 'node:process'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { setupVitePlugins } from './build/plugins'
import { createViteProxy, getBuildInfo } from './build/config'

export default defineConfig((configEnv) => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta

  const { desc, time, version } = getBuildInfo()

  const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/assets/scss/global.scss" as *;`,
        },
      },
    },
    plugins: setupVitePlugins(viteEnv, time, version),
    define: {
      BUILD_TIME: JSON.stringify(time),
      BUILD_DESC: JSON.stringify(desc),
    },
    server: {
      host: '0.0.0.0',
      port: viteEnv.VITE_SERVER_PORT,
      open: true,
      proxy: createViteProxy(viteEnv, enableProxy),
      fs: {
        cachedChecks: false,
      },
    },
    preview: {
      port: viteEnv.VITE_PREVIEW_PORT,
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      commonjsOptions: {
        ignoreTryCatch: false,
      },
    },
  }
})
