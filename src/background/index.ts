// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()
import { CreatePromptSchema } from "@/types"
import { encrypt, decrypt } from "src/utils/encryption"

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

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message.type === "SEND_AUTH") {
      console.log("✅ Got user auth from taoprompt.com:", message)
      // bạn có thể lưu, sync, hay xử lý tiếp ở đây
      chrome.storage.local.set({
        user: message.data.u,
        token: message.data.t,
      })
      sendAuthToContentScript()

      return true
    }
    return false
  },
)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REQUEST_AUTH") {
    chrome.storage.local.get(["user", "token"], (result) => {
      sendResponse({
        user: decrypt(result.user, true),
      })
    })
    return true
  }

  if (message.type === "SEND_AUTH") {
    console.log("✅ @Got user auth from taoprompt.com:", message)

    chrome.storage.local.set({
      user: message.data.u,
      token: message.data.t,
    })
    sendAuthToContentScript()
    sendResponse(true)
    return true
  }

  if (message.type === "CREATE_PROMPT") {
    createPromptHandle(message.data, sender.tab?.id || 0)
      .then(() => {
        sendResponse(true)
      })
      .catch((error) => {
        console.error(error)
        sendResponse(false)
      })
    return true
  }

  if (message.type === "SEND_PROMPT_SETTINGS") {
    chrome.storage.local.set({
      language_output: message.data.language_output,
    })

    sendResponse(true)
    return true
  }

  if (message.type === "OPEN_POPUP") {
    // chrome.action.setPopup({ popup: "src/ui/action-popup/index.html" })
    chrome.action.openPopup()
    sendResponse(true)
    return true
  }
  return true
})

function sendAuthToContentScript() {
  chrome.tabs.query({}, (tabs) => {
    chrome.storage.local.get(["user", "token"], (result) => {
      for (let tab of tabs) {
        if (tab.id && tab.url) {
          chrome.tabs.sendMessage(tab.id, {
            type: "AUTH_UPDATE",
            payload: {
              user: decrypt(result.user, true),
            },
          })
        }
      }
    })
  })
}

const promptStreamList = ref<string[]>([])

async function createPromptHandle(data: CreatePromptSchema, tabId: number) {
  let streamTextDecode = ``
  promptStreamList.value = []

  const storageRaw = await chrome.storage.local.get([
    "token",
    "language_output",
  ])

  const token = decrypt(storageRaw.token, false)
  if (!token) {
    chrome.tabs.sendMessage(tabId, {
      type: "TAOPROMPT_ERROR",
      data: "Please login to continue",
      code: 401,
    })
    throw new Error("Please login to continue")
  }

  const response = await createPrompt(
    {
      ...data,
      settings: {
        ...data.settings,
        language: storageRaw.language_output,
      },
    },
    token,
  )

  if (!response.ok) {
    const body = await response.json()
    console.log("Error create prompt:", body, response)
    chrome.tabs.sendMessage(tabId, {
      type: "TAOPROMPT_ERROR",
      data: body.error,
      error_code: body.code,
      code: response.status
    })
    throw new Error(body.error)
  }

  const decoder = new TextDecoder("utf-8")
  const reader = response.body?.getReader()

  while (true) {
    if (!reader) break
    const { value, done } = await reader.read()

    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    streamTextDecode += chunk

    promptStreamList.value = streamTextDecode.split("\n")

    chrome.tabs.sendMessage(tabId, {
      type: "TAOPROMPT_STREAM_CHUNK",
      data: promptStreamList.value,
    })
    //
  }
  streamTextDecode += decoder.decode()

  chrome.tabs.sendMessage(tabId, {
    type: "TAOPROMPT_STREAM_DONE",
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
