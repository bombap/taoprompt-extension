import { initVueApp } from "./app"
import {
  configEl,
  currentAiConfig,
  isDeepSeek,
  isGrok,
  isGrokX,
} from "./config"

import appCss from "./index.scss?inline"
import injectedJS from "./injected-script-ai.ts?script&module"
import injectStyle from "./inject-style.css?inline"

const script = document.createElement("script")
script.src = chrome.runtime.getURL(injectedJS)
script.onload = function () {
  this.remove()
}
;(document.head || document.documentElement).appendChild(script)

let container: HTMLDivElement | null = null

function copyCssVariablesToShadowRoot(shadowRoot: ShadowRoot) {
  const rootStyles = getComputedStyle(document.documentElement)
  const cssVars: string[] = []

  for (let i = 0; i < rootStyles.length; i++) {
    const name = rootStyles[i]
    if (name.startsWith("--")) {
      const value = rootStyles.getPropertyValue(name).trim()
      cssVars.push(`${name}: ${value};`)
    }
  }

  const styleEl = document.createElement("style")
  styleEl.textContent = `:host { ${cssVars.join("\n")} }`
  shadowRoot.appendChild(styleEl)
}

function injectElement(targetInput: Element) {
  if (!targetInput) return

  initPreview()

  if (!container) {
    container = document.createElement("div")
    container.id = "taoprompt-container"
    container.dataset.plugin = "taoprompt"
    const shadow = container.attachShadow({ mode: "open" })

    const mountEl = document.createElement("div")
    mountEl.id = "taoprompt-app"
    mountEl.setAttribute("data-theme", "light")
    mountEl.setAttribute("data-ai", location.hostname)
    shadow.appendChild(mountEl)

    var link = document.createElement("style")
    link.textContent = appCss
    shadow.appendChild(link)
    copyCssVariablesToShadowRoot(shadow)
    initVueApp(mountEl)
    injectDOM(targetInput, container)

    //

    //
  } else {
    injectDOM(targetInput, container)
  }

  targetInput.classList.add(`taoprompt-container-parent`)

  var link = document.createElement("style")
  link.textContent = injectStyle
  document.head.appendChild(link)

  //
}

function injectDOM(targetInput: Element, el: Element) {
  if (currentAiConfig.value?.isInsertBefore) {
    targetInput.parentNode?.insertBefore(el, targetInput)
  } else {
    targetInput.appendChild(el)
  }

  setTimeout(() => {
    const shadowRoot = el.shadowRoot
    const buttonA = shadowRoot?.querySelector(
      "#taoprompt-floating-button",
    ) as HTMLElement

    buttonA.style.right = `0px`

    setTimeout(() => {
      const buttonA = shadowRoot?.querySelector(
        "#taoprompt-floating-button",
      ) as HTMLElement
      if (!buttonA) return
      const buttonBox = buttonA?.getBoundingClientRect()
      if (buttonBox && buttonA) {
        const distanceToRight = window.innerWidth - buttonBox.right
        const delta = distanceToRight + 50
        buttonA.style.right = `${-delta}px`
      }
    }, 300)
  }, 100)
}

function initPreview() {
  // const previewEl = document.querySelector(
  //   "#thread-bottom #prompt-textarea",
  // )
  // const prevewContent = document.createElement("div")
  // prevewContent.id = "taoprompt-preview"
  // previewEl?.parentNode?.appendChild(prevewContent)
}

function waitForElement<T extends Element>(
  selector: string,
  callback: (el: T) => void,
  timeout = 10000,
) {
  if (!selector) {
    return
  }

  const start = Date.now()
  const interval = setInterval(() => {
    const el = document.querySelector(selector) as T | null
    if (el) {
      clearInterval(interval)
      callback(el)
    } else if (Date.now() - start > timeout) {
      clearInterval(interval)
      console.warn("⏰ Timeout: Không tìm thấy selector", selector)
    }
  }, 300)
}

function init() {
  if (!currentAiConfig.value) return
  waitForElement<HTMLButtonElement>(
    currentAiConfig.value?.appendSelector(document),
    (container) => {
      if (container) {
        injectElement(container)
      }
    },
  )
}

function appendInputIfMissing() {
  const target = document.querySelector("#taoprompt-container")
  if (!target) {
    init()
  }
}

;(() => {
  let timeOutValue = 0

  if (isDeepSeek || isGrok || isGrokX) {
    timeOutValue = 300
  }
  setTimeout(() => {
    appendInputIfMissing()
  }, timeOutValue)
  window.addEventListener("locationchange", function () {
    setTimeout(() => {
      appendInputIfMissing()
    }, 300)
  })
})()

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}
