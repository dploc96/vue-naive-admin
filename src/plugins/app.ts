import { $t } from '@/locales'
import { NButton } from 'naive-ui'
import { h } from 'vue'
import type { App } from 'vue'

export function setupAppErrorHandle(app: App) {
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, vm, info)
  }
}

export function setupAppVersionNotification() {
  const canAutoUpdateApp = import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === 'Y'

  if (!canAutoUpdateApp)
    return

  let isShow = false

  document.addEventListener('visibilitychange', async () => {
    const preConditions = [!isShow, document.visibilityState === 'visible', !import.meta.env.DEV]

    if (!preConditions.every(Boolean))
      return

    const buildTime = await getHtmlBuildTime()

    if (buildTime === BUILD_TIME) {
      return
    }

    isShow = true

    const n = window.$notification?.create({
      title: $t('system.updateTitle'),
      content: $t('system.updateContent'),
      action() {
        return h('div', { style: { display: 'flex', justifyContent: 'end', gap: '12px', width: '325px' } }, [
          h(
            NButton,
            {
              onClick() {
                n?.destroy()
              },
            },
            () => $t('system.updateCancel'),
          ),
          h(
            NButton,
            {
              type: 'primary',
              onClick() {
                location.reload()
              },
            },
            () => $t('system.updateConfirm'),
          ),
        ])
      },
      onClose() {
        isShow = false
      },
    })
  })
}

async function getHtmlBuildTime() {
  const res = await fetch(`/index.html?time=${Date.now()}`)

  const html = await res.text()

  const match = html.match(/<meta name="build-time" content="([^"]*)">/)

  const buildTime = match?.[1] || ''

  return buildTime
}
