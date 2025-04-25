import { i18n } from "src/utils/i18n"
import { notivue } from "src/utils/notifications"
import { pinia } from "src/utils/pinia"
import { createApp } from "vue"
import App from "./app.vue"
// import ui from "@nuxt/ui/vue-plugin"

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

function initVueApp(mountEl: Element) {

  if (!mountEl || mountEl.hasAttribute("data-mounted")) return
  

  
  const app = createApp(App).use(i18n).use(notivue)

  mountEl.setAttribute("data-mounted", "true")
  app.mount(mountEl)
  return app
}

export { initVueApp }
