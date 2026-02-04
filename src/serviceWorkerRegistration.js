/**
 * Service Worker Registration dengan Proper Lifecycle
 * Best Practice PWA untuk Lento
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

export function register(config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/firebase-messaging-sw.js'

      if (isLocalhost) {
        // Development: Check if SW is valid
        checkValidServiceWorker(swUrl, config)
        
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '[SW] App is being served from cache by a service worker. ' +
            'For more details, visit https://cra.link/PWA'
          )
        })
      } else {
        // Production: Register SW normally
        registerValidSW(swUrl, config)
      }
    })
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW] Registered successfully')
      
      // Best Practice: Check for updates setiap 1 jam
      setInterval(() => {
        registration.update().catch(err => {
          console.warn('[SW] Update check failed:', err)
        })
      }, 1000 * 60 * 60)

      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) return

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('[SW] New content is available; please refresh.')
              
              if (config && config.onUpdate) {
                config.onUpdate(registration)
              }
            } else {
              // First install
              console.log('[SW] Content is cached for offline use.')
              
              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('[SW] Error during service worker registration:', error)
      // Don't throw - just log. SW failures shouldn't break the app
      if (config && config.onError) {
        config.onError(error)
      }
    })
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type')
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.')
    })
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
