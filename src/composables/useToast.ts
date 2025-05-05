import { useNotification } from './useNotification'

type ToastType = 'success' | 'error' | 'info' | 'warning'

/**
 * Simple toast notification composable
 * @returns A function to show toast notifications
 */
export function useToast() {
  const { notification } = useNotification()

  /**
   * Show a toast notification
   * @param message The message to display
   * @param type The type of notification (success, error, info, warning)
   * @param timeout Optional timeout in milliseconds
   */
  return function toast(message: string, type: ToastType = 'info', timeout = 3000) {
    notification({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      text: message,
      type,
      timeout
    })
  }
}
