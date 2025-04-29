// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()
import { encrypt, decrypt } from "src/utils/encryption"
import {
  listenMessages,
  sendToAllTabs,
} from "../composables/useChromeExtensionMessaging"
import { TAOPROMPT_EVENTS } from "../const.events"
import { createPromptProcess } from "../composables/usePrompt"

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/install"),
    })

    return
  }

  if (opt.reason === "update") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/update"),
    })

    return
  }
})

// chrome.runtime.onMessageExternal.addListener(
//   (message, sender, sendResponse) => {
//     if (message.type === "SEND_AUTH") {
//       console.log("✅ Got user auth from taoprompt.com:", message)
//       chrome.storage.local.set({
//         user: message.data.u,
//         token: message.data.t,
//       })
//       sendAuthToContentScript()

//       return true
//     }
//     return false
//   },
// )

listenMessages((message, sender, sendResponse) => {
  console.log("✅ Got message from content script:", message)

  switch (message.type) {
    case TAOPROMPT_EVENTS.AUTH_REQUEST:
      {
        chrome.storage.local.get(["user", "token"], (result) => {
          sendResponse({
            user: decrypt(result.user, true),
          })
        })
      }
      return true
    case TAOPROMPT_EVENTS.AUTH_SEND:
      {
        chrome.storage.local.set({
          user: message.data.u,
          token: message.data.t,
        })
        sendAuthToContentScript()
        sendResponse({
          success: true,
        })
      }
      return true
    case TAOPROMPT_EVENTS.POPUP_OPEN:
      try {
        chrome.action.openPopup()
      } catch (error) {
        window.open(chrome.runtime.getURL("src/ui/action-popup/index.html"))
      }
      sendResponse({
        success: true,
      })
      return true
    case TAOPROMPT_EVENTS.SETTINGS_UPDATE:
      {
        chrome.storage.local.set({
          language_output: message.data.language_output,
        })
        sendResponse({
          success: true,
        })
      }
      return true
    case TAOPROMPT_EVENTS.PROMPT_CREATE:
      {
        createPromptProcess(message.data, sender.tab?.id || 0)
          .then(() => {
            sendResponse({
              success: true,
            })
          })
          .catch((error) => {
            console.error(error)
            sendResponse({
              success: false,
            })
          })
      }
      return true
    default:
      return false
  }
})

function sendAuthToContentScript() {
  chrome.storage.local.get(["user", "token"], (result) => {
    sendToAllTabs({
      type: TAOPROMPT_EVENTS.AUTH_UPDATE,
      payload: {
        user: decrypt(result.user, true),
      },
    })
  })
}

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

export {}
