// content_script.js
const EXTENSION_ID = chrome.runtime.id
import { TAOPROMPT_EVENTS } from "@/src/const.events"

;(() => {
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return
    if (event.data?.source !== "taoprompt") return

    const { type, payload } = event.data

    if (type === TAOPROMPT_EVENTS.AUTH_SEND) {
      sendToBackground({
        type: TAOPROMPT_EVENTS.AUTH_SEND,
        data: payload,
      })
    }

    if (type === TAOPROMPT_EVENTS.POPUP_OPEN) {
      sendToBackground({
        type: TAOPROMPT_EVENTS.POPUP_OPEN,
        data: payload,
      })
    }
  })
})()
