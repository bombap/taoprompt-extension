export const configEl = {
  chatgpt: {
    inputSelector: "#prompt-textarea",
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      return "#thread-bottom form>div>div>div:nth-child(2) > div > div"
    },
  },
  claude: {
    inputSelector: `div[contenteditable="true"]`,
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      const elParent = document.querySelector("#input-tools-menu-trigger")!.parentElement!.parentElement
      const selector = getFullSelector(elParent) || ""
      return selector
    },
  },
  gemini: {
    inputSelector: `div[contenteditable="true"]`,
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      const cogButton = document.querySelector(".uploader-button-container")
      if (cogButton?.parentElement) {
        const selector = getFullSelector(cogButton?.parentElement) || ""

        return selector
      }
      return ""
    },
  },
  deepseek: {
    inputSelector: `#chat-input`,
    isInsertBefore: true,
    appendSelector: (document: Document) => {
      const inputEl = document.querySelector("#chat-input")
      if (!inputEl) return ""
      const parentEl =
        inputEl.parentElement!.parentElement!.children[1].children[2]
      if (parentEl) {
        const selector = getFullSelector(parentEl) || ""
        return selector
      }
      return ""
    },
  },
  grok: {
    inputSelector: `form textarea`,
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      const parentEl =
        document.querySelector(".query-bar")!.children[2].children[1]
          .children[0]
      if (parentEl) {
        const selector = getFullSelector(parentEl) || ""
        return selector
      }
      return ""
    },
  },
  grokX: {
    inputSelector: `main [aria-label="Grok"] textarea`,
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      const parentEl =
        document.querySelector('[aria-label="Grok something"]')!.parentElement!.parentElement!.children[0]
      if (parentEl) {
        const selector = getFullSelector(parentEl) || ""
        return selector
      }
      return ""
    },
  },
  copilot: {
    inputSelector: `[data-testid="composer-input"]`,
    isInsertBefore: false,
    appendSelector: (document: Document) => {
      const parentEl = document.querySelector('[data-testid="audio-call-button"]')!.parentElement!.parentElement!.parentElement!.children[0]
      if (parentEl) {
        const selector = getFullSelector(parentEl) || ""
        return selector
      }
      return ""
    },
  },
}

export const isDeepSeek = location.hostname === "chat.deepseek.com"
export const isGemini = location.hostname === "gemini.google.com"
export const isGrok = location.hostname === "grok.com"
export const isGrokX = location.href === "https://x.com/i/grok"
export const isCopilot = location.hostname === "copilot.microsoft.com"

export const currentAiConfig = computed(() => {
  switch (window.location.hostname) {
    case "chatgpt.com":
      return configEl.chatgpt
    case "claude.ai":
      return configEl.claude
    case "gemini.google.com":
      return configEl.gemini
    case "chat.deepseek.com":
      return configEl.deepseek
    case "grok.com":
      return configEl.grok
    case "x.com":
      return configEl.grokX
    case "copilot.microsoft.com":
      return configEl.copilot
    default:
      return null
  }
})
