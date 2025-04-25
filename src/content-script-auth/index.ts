// content_script.js
const EXTENSION_ID = chrome.runtime.id;

(() => {

  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin) return
    if (event.data?.source !== "taoprompt") return

    const { type, payload } = event.data

    if (type === "SEND_AUTH") {

      chrome.runtime.sendMessage(EXTENSION_ID, {
        type: "SEND_AUTH",
        data: payload,
      })
    }
  })
})()
