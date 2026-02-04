export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch (e) {
    return 'denied'
  }
}

export async function showLocalNotification(title, options = {}) {
  if (!isNotificationSupported()) return null
  if (Notification.permission !== 'granted') return null
  
  try {
    // Always try Service Worker API first (PWA requirement)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        ...options,
      })
      return true
    }
    
    // Only use legacy API if Service Worker not supported at all
    const notification = new Notification(title, {
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      ...options,
    })

    // Navigate to route if provided
    if (options.data?.route) {
      notification.onclick = () => {
        window.focus()
        window.location.href = options.data.route
      }
    }
    return notification
  } catch (error) {
    console.error('Failed to show notification:', error)
    return null
  }
}
