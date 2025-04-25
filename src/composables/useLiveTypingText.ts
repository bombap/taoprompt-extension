import { ref, watch } from 'vue'

export function useLiveTypingText(source: Ref<string>, typingSpeed = 1, onFinished?: () => void, endContent?: ComputedRef<string>) {
  const displayText = ref('')
  let currentIndex = 0
  let typing = false

  const typeNext = async () => {
    if (typing) return
    typing = true

    while (currentIndex < source.value.length) {
      displayText.value += source.value[currentIndex]
      currentIndex++
      await new Promise((resolve) => setTimeout(resolve, typingSpeed))
    }

    typing = false
    if(endContent?.value.trim()&& displayText.value.endsWith(endContent?.value.trim() || '')) {
        onFinished?.()
    }
  }

  watch(source, () => {
    typeNext()
  })

  const resetDisplayText = () => {
    displayText.value = ''
    currentIndex = 0
    typing = false
  }

  return {
    displayText,
    resetDisplayText
  }
}
