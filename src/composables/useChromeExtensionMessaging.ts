// src/composables/useChromeExtensionMessaging.ts
/**
 * Normalize data for Chrome messaging (deep clone, remove proxies, etc.)
 */
export function normalizeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

/**
 * Send message from popup/content/background to background script
 */
export function sendToBackground<T = any, R = any>(message: T): Promise<R> {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore:next-line
      chrome.runtime.sendMessage(normalizeData(message), (response) => {
        // Fix TS: lastError is only available at runtime, not in types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((chrome.runtime as any).lastError) {
          reject((chrome.runtime as any).lastError)
        } else {
          resolve(response as R)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Send message from background to a specific tab (content script)
 */
export function sendToTab<T = any>(tabId: number, message: T) {
    chrome.tabs.sendMessage(tabId, normalizeData(message))
}


/**
 * Send message from background to all tabs (content scripts)
 */
export function sendToAllTabs<T = any>(message: T) {
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      if (tab.id && tab.url) {
        chrome.tabs.sendMessage(tab.id, normalizeData(message))
      }
    }
  })
}

/**
 * Listen for messages in background/content/popup
 * Returns an unsubscribe function
 */
export function listenMessages(
  handler: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void | boolean
) {
  chrome.runtime.onMessage.addListener(handler as any)
  return () => chrome.runtime.onMessage.removeListener(handler as any)
}