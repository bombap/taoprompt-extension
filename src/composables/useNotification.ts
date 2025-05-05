/**
 * Notification interface
 */
export interface NotificationOptions {
  title?: string
  text: string
  type?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

/**
 * Simple notification composable that uses the browser's native notification API
 * and falls back to console messages if notifications are not supported or permitted
 */
export function useNotification() {
  /**
   * Show a notification
   */
  const notification = (options: NotificationOptions) => {
    const { title = 'Notification', text, type = 'info', timeout = 3000 } = options
    
    // Check if the browser supports notifications
    if ('Notification' in window) {
      // Check if permission is granted
      if (Notification.permission === 'granted') {
        // Create and show the notification
        const notification = new Notification(title, {
          body: text,
          icon: type === 'error' ? '🔴' : 
                type === 'success' ? '✅' : 
                type === 'warning' ? '⚠️' : 'ℹ️'
        })
        
        // Auto close after timeout
        if (timeout) {
          setTimeout(() => {
            notification.close()
          }, timeout)
        }
      } 
      // If permission is not granted and not denied, request permission
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            notification(options)
          } else {
            // Fall back to console
            logToConsole(title, text, type)
          }
        })
      } else {
        // Permission denied, fall back to console
        logToConsole(title, text, type)
      }
    } else {
      // Notifications not supported, fall back to console
      logToConsole(title, text, type)
    }
  }
  
  /**
   * Log notification to console as fallback
   */
  const logToConsole = (title: string, text: string, type: string) => {
    const message = `${title}: ${text}`
    
    switch (type) {
      case 'error':
        console.error(message)
        break
      case 'warning':
        console.warn(message)
        break
      case 'success':
        console.log('%c' + message, 'color: green')
        break
      default:
        console.info(message)
    }
  }
  
  return {
    notification
  }
}
