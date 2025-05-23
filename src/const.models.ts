import chatGptIcon from "@assets/ai-apps/chatgpt-icon.svg"
import googleGeminiIcon from "@assets/ai-apps/google-gemini-icon.svg"
import grokIcon from "@assets/ai-apps/grok-icon.svg"
import deepSeekIcon from "@assets/ai-apps/deepseek-icon.svg"
import claudeAIAIcon from "@assets/ai-apps/claude-ai-icon.svg"
import modelMistral from "@assets/ai-apps/mistralai-icon.svg"

export const providerLogo = {
  openai: chatGptIcon,
  anthropic: claudeAIAIcon,
  google: googleGeminiIcon,
  mistralai: modelMistral,
  deepseek: deepSeekIcon,
}

export function parseOpenRouterModelId(modelId: string): {
  provider: string
  name: string
} {
  const [providerPart, rest] = modelId.split("/")
  const [baseName, modifier] = rest.split(":")

  const provider = providerPart

  // Danh sách các từ cần viết hoa đúng cách
  const knownWords = [
    "gpt",
  ]

  const name = baseName
    .split("-")
    .map((part) => {
      // Viết hoa nếu là từ đã biết
      if (knownWords.includes(part.toLowerCase())) {
        return part.toUpperCase().replace(/^\w/, (c) => c.toUpperCase())
      }
      // Nếu là số (version) thì giữ nguyên
      if (/^\d+(\.\d+)?$/.test(part)) {
        return part
      }
      // Mặc định viết hoa chữ cái đầu
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")

  const finalName = modifier
    ? `${name} (${modifier.charAt(0).toUpperCase() + modifier.slice(1)})`
    : name

  return { provider, name: finalName }
}

export function getModelList(freeModels: string[], paidModels: string[]) {
  const allModels = [...freeModels, ...paidModels]

  const models = allModels.map((modelId) => {
    const { provider, name } = parseOpenRouterModelId(modelId)
    return {
      provider,
      name,
      id: modelId,
      isPro: paidModels.includes(modelId),
      //
      avatar: {
        src: providerLogo[provider as keyof typeof providerLogo],
        alt: `${name}`,
      },
      label: name,
      value: modelId,
    }
  })

  return models
}
