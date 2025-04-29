import { apiBaseUrl } from "@/const"
import { CreatePromptSchema } from "@/types"
import { TAOPROMPT_EVENTS } from "../const.events"
import { sendToTab } from "./useChromeExtensionMessaging"

async function createPrompt(data: CreatePromptSchema, token: string) {
  const response = await fetch(`${apiBaseUrl}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  return response
}

async function createPromptProcess(data: CreatePromptSchema, tabId: number) {
  const promptStreamList = ref<string[]>([])

  let streamTextDecode = ``

  const storageRaw = await chrome.storage.local.get([
    "token",
    "language_output",
  ])

  const token = decrypt(storageRaw.token, false)
  if (!token) {
    sendToTab(tabId, {
      type: TAOPROMPT_EVENTS.PROMPT_ERROR,
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
    sendToTab(tabId, {
      type: TAOPROMPT_EVENTS.PROMPT_ERROR,
      data: body.error,
      error_code: body.code,
      code: response.status,
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

    sendToTab(tabId, {
      type: TAOPROMPT_EVENTS.PROMPT_STREAM_CHUNK,
      data: JSON.parse(JSON.stringify(promptStreamList.value)),
    })
    //
  }
  streamTextDecode += decoder.decode()

  sendToTab(tabId, {
    type: TAOPROMPT_EVENTS.PROMPT_STREAM_DONE,
  })
}

export { createPromptProcess }
