<script setup lang="ts">
import { marked } from 'marked'

import { CreatePromptSchema, User } from '@/types';
import GenerateButton from './components/GenerateButton.vue';
import BackButton from './components/BackButton.vue';
import { currentAiConfig, isGemini, isDeepSeek, isGrok, isGrokX, isCopilot, isTest } from './config';
import { baseUrl, loading_icon } from '@/const';
import { TAOPROMPT_EVENTS } from '../const.events';
import ButtonFlubber from './components/ButtonFlubber.vue';


if (isGemini) {
  const renderer = new marked.Renderer();

  let listCounter = 0;
  let isOrdered = false;

  renderer.list = function (token) {
    listCounter = 0;
    isOrdered = token.ordered;

    return token.raw;
  };

  renderer.listitem = function (text) {
    if (isOrdered) {
      listCounter++;
      return `<p>${listCounter}. ${text.text}</p>`;
    } else {
      return `<p>• ${text.text}</p>`;
    }
  };

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
  });


} else {
  marked.setOptions({
    breaks: true,
    gfm: true,
    renderer: new marked.Renderer()
  })
}

const user = ref<User | null>(null)

const loading = ref(true)


const generateButton = ref<InstanceType<typeof GenerateButton> | null>(null)
const backButton = ref<InstanceType<typeof BackButton> | null>(null)


const isTextAreaInput = computed(() => {
  if (isDeepSeek || isGrok || isGrokX || isCopilot || isTest) {
    return true
  }
  return false
})

function getInputValue() {
  const config = currentAiConfig.value
  if (!config) return ""

  const input = document.querySelector(config.inputSelector) as HTMLDivElement | null;
  if (input) {
    if (isTextAreaInput.value) {
      return (input as HTMLInputElement).value
    } else {
      return input.innerText
    }
  }
  return "";
}

function setTextToInput(_text: string) {
  let text = formatStringStreamText(_text)
  text = text.replaceAll(/\\"/g, '"')

  if (!isTextAreaInput.value) {
    text = text.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;')
  }
  // 
  if (!currentAiConfig.value) return
  const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement

  if (isTextAreaInput.value) {
    (inputEl as HTMLInputElement).value = text;

    (inputEl as HTMLInputElement).innerText = text;

    if (isDeepSeek) {
      (inputEl as HTMLInputElement).parentElement!.children[1]!.innerHTML = text;
    }
  } else {
    const val = marked.parse(text)
    if (val instanceof Promise) {
      val.then((v) => {
        inputEl.innerHTML = v
      })
    } else {
      inputEl.innerHTML = val
    }
  }

  (inputEl as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));

  placeCaretAtEnd(inputEl)
}

const isGenerating = ref(false);
const isThinking = ref(false);
const prevInputValue = ref('')
const openDrawer = ref(false)
const floatingButton = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const initialY = ref(0)
const initialTop = ref(0)
// Config for floating button positioning
const floatingButtonConfig = {
  minTopPx: 100,         // Minimum distance from top of viewport in pixels
  maxBottomMarginPx: 80, // Margin from bottom of viewport in pixels
  defaultPositionPercent: 100, // Default position as percentage between min and max (0-100)
  storageKey: 'taoprompt-button-position-percent' // Key for localStorage
}

// Get saved position from localStorage or use default
const getSavedPositionPercent = (): number => {
  try {
    const savedValue = localStorage.getItem(floatingButtonConfig.storageKey)
    if (savedValue !== null) {
      const parsedValue = parseFloat(savedValue)
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
        return parsedValue
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error)
  }
  return floatingButtonConfig.defaultPositionPercent
}

// Save position to localStorage
const savePositionPercent = (percent: number) => {
  try {
    localStorage.setItem(floatingButtonConfig.storageKey, percent.toString())
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Current position percent (from localStorage or default)
const positionPercent = ref(getSavedPositionPercent())

// Calculate button position based on percentage between min and max
const calculateButtonPosition = () => {
  const maxTop = window.innerHeight - floatingButtonConfig.maxBottomMarginPx
  const availableSpace = maxTop - floatingButtonConfig.minTopPx
  return floatingButtonConfig.minTopPx + (availableSpace * positionPercent.value / 100)
}

const buttonPosition = ref(calculateButtonPosition())

const formData = ref<CreatePromptSchema>({
  prompt: '',
  settings: {
    mode: 'fastest',
    model: 'anthropic/claude-3.5-haiku',
    temperature: 1,
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    language: 'Vietnamese'
  }
})

const setting = ref({
  interface: true
})

const promptStreamList = ref<string[]>([])
const promptStreamListValue = computed(() => {
  return promptStreamList.value.map(line => {
    if (line.startsWith("0:")) {
      let str = line;
      if (!line.endsWith(`"`)) {
        str += `"`;
      }
      const cleanChunk = (str.match(/^0:"([\s\S]*)"$/)?.[1] || '')
        .replace(/\\n/g, "\n");
      return cleanChunk;
    }
    return '';
  });
})
const promptStreamText = computed(() => {
  let textPrefix = `<Inputs>`;
  return `${textPrefix}${promptStreamListValue.value.join('')}`
})

const promptResultStreamInstructions = computed(() => {
  return getTagContent(promptStreamText.value, 'Instructions')
})

function getTagContent(input: string, tag: string): string {
  if (input.includes(`<${tag}>`)) {
    const endCheck = input.includes(`</${tag}>`)
    if (endCheck) {
      return extractContent(formatStringStreamText(input), tag)
    } else {
      return formatStringStreamText(input.split(`<${tag}>`)[1])
    }
  }

  return ''
}

const extractContent = (text: string, tag: string) => {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`)
  const match = text.match(regex)
  return match ? match[1].trim() : ""
}

function formatStringStreamText(input: string): string {
  return input.replace(/^\n+/, '').trim()
}

const formatStringToHTMLPreview = (text: string) => {
  if (isTextAreaInput.value) {
    return text
  }
  return text
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;')
}

const promptTextFormated = computed(() => {
  let text = formatStringStreamText(promptResultStreamInstructions.value)

  text = text.replaceAll(/\\"/g, '"')

  return text
})

const promptTextFormatedPreview = computed(() => {
  return formatStringToHTMLPreview(promptTextFormated.value)
})



watch(promptTextFormatedPreview, () => {
  if (!isGenerating.value) return

  if (!currentAiConfig.value) return
  const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement

  if (isTextAreaInput.value) {
    (inputEl as HTMLInputElement).value = promptTextFormatedPreview.value;

    (inputEl as HTMLInputElement).innerText = promptTextFormatedPreview.value;

    if (isDeepSeek) {
      (inputEl as HTMLInputElement).parentElement!.children[1]!.innerHTML = promptTextFormatedPreview.value;
    }
  } else {
    const val = marked.parse(promptTextFormatedPreview.value)
    if (val instanceof Promise) {
      val.then((v) => {
        inputEl.innerHTML = v
      })
    } else {
      inputEl.innerHTML = val
    }
  }

  (inputEl as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));

  placeCaretAtEnd(inputEl)

})

watch(isThinking, () => {
  if (isThinking.value) {
    disableInput()
  }
})

watch(isGenerating, () => {
  if (!isGenerating.value) {
    enableInput()
  }
})


function disableInput() {
  if (isTextAreaInput.value) {
    return
  }
  if (!currentAiConfig.value) return
  const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement
  inputEl.classList.add('taoprompt-disabled-input')
}
function enableInput() {
  if (isTextAreaInput.value) {
    return
  }
  if (!currentAiConfig.value) return
  const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement
  inputEl.classList.remove('taoprompt-disabled-input')
}


function resetPromptPreview() {
  isThinking.value = false
  isGenerating.value = false
}

function onFinished() {
  setTimeout(() => {
    prevInputValue.value = formData.value.prompt
    resetPromptPreview()
  }, 300);
}

const generatePrompt = () => {
  if (!user.value) {
    sendToBackground({
      type: TAOPROMPT_EVENTS.POPUP_OPEN,
    })
    return
  }
  //
  const inputValue = getInputValue();
  if (!inputValue.trim()) {
    notify("Please enter a prompt before optimizing.");
    return;
  }


  formData.value.prompt = inputValue;

  isThinking.value = true;
  isGenerating.value = true;

  try {

    sendToBackground({
      type: TAOPROMPT_EVENTS.PROMPT_CREATE,
      data: formData.value
    }).then((response) => {
      if (!response.success) {
        resetPromptPreview()
      }
    })
  } catch (error) {
    console.error(error)
  }
}

function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false); // false = đặt về cuối

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function onLoaded() {
  loading.value = false
}

function togglePromptManager() {
  openDrawer.value = !openDrawer.value
}

function listenEvents() {

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "P") {
      e.preventDefault();
      // Toggle prompt manager UI (sidepanel, popup...)
      togglePromptManager();
    }
  });

  window.addEventListener(TAOPROMPT_EVENTS.LOADED, onLoaded);
  listenMessages((message, sender, sendResponse) => {
    switch (message.type) {
      case TAOPROMPT_EVENTS.AUTH_UPDATE:
        user.value = message.payload
        return true
      case TAOPROMPT_EVENTS.PROMPT_STREAM_CHUNK:
        onStreamCreatePrompt(message.data)
        return true
      case TAOPROMPT_EVENTS.PROMPT_STREAM_DONE:
        onDoneCreatePrompt()
        return true
      case TAOPROMPT_EVENTS.PROMPT_ERROR:
        onPromptError(message)
      case TAOPROMPT_EVENTS.INJECT_PROMPT:
        onInjectPrompt(message)
      case TAOPROMPT_EVENTS.SETTINGS_UPDATE:
        {
          if(typeof message.data.interface === 'boolean') {
            setting.value.interface = message.data.interface
          } else {
            setting.value.interface = true
          }
        }
        return true
    }
  })
}

function onPromptError(message: any) {
  if (message.code === 401) {
    sendToBackground({
      type: TAOPROMPT_EVENTS.POPUP_OPEN,
    })


  } else {
    if (message.error_code === "DAILY_LIMIT_REACHED") {
      window.open(`${baseUrl}/pricing`, '_blank');
      return
    }
    alert(message.data)
  }
}

function onInjectPrompt(message: any) {
  setTextToInput(message.data.prompt)
}

function onDoneCreatePrompt() {
  onFinished()
}

function onStreamCreatePrompt(data: string[]) {
  promptStreamList.value = data

  if (promptResultStreamInstructions.value) {
    isThinking.value = false;
  }
}


function undoHandle() {
  if (!currentAiConfig.value) return
  const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement
  if (inputEl) {
    if (isTextAreaInput.value) {
      (inputEl as HTMLInputElement).value = prevInputValue.value;
      (inputEl as HTMLInputElement).innerText = prevInputValue.value;
    } else {
      inputEl.innerText = prevInputValue.value
    }
    placeCaretAtEnd(inputEl)
  }

  (inputEl as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
  prevInputValue.value = ''

}

function notify(message: string) {
  alert(message)
}


const startDrag = (event: MouseEvent) => {
  // Prevent default to avoid text selection during drag
  event.preventDefault()
  event.stopPropagation()
  
  if (!floatingButton.value) return
  
  // Get the actual current position from the DOM
  const computedStyle = window.getComputedStyle(floatingButton.value)
  const topValue = computedStyle.top
  initialTop.value = parseFloat(topValue) || buttonPosition.value
  
  isDragging.value = true
  initialY.value = event.clientY
  
  // Add event listeners for drag and release
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// Use a variable to track the last animation frame request
let animationFrameId: number | null = null

// Track if we've moved during drag to distinguish between click and drag
let hasMoved = false

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value || !floatingButton.value) return
  
  // Prevent default and stop propagation
  event.preventDefault()
  event.stopPropagation()
  
  // Mark that we've moved during this drag session
  // This helps distinguish between a click and a drag
  const deltaY = Math.abs(event.clientY - initialY.value)
  if (deltaY > 3) { // Consider it a move if we've moved more than 3px
    hasMoved = true
  }
  
  // Cancel any pending animation frame
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  
  // Use requestAnimationFrame for smoother performance
  animationFrameId = requestAnimationFrame(() => {
    if (!floatingButton.value) return
    
    // Calculate the vertical movement in pixels
    const deltaY = event.clientY - initialY.value
    
    // Calculate new top position in pixels
    let newTop = initialTop.value + deltaY
    
    // Constrain to keep button within viewport using config values
    const maxTop = window.innerHeight - floatingButtonConfig.maxBottomMarginPx
    newTop = Math.max(floatingButtonConfig.minTopPx, Math.min(maxTop, newTop))
    
    // Apply the new position directly to the DOM for smoother performance
    floatingButton.value.style.top = `${newTop}px`
    
    // Reset animation frame ID
    animationFrameId = null
  })
}
    
const stopDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  // Cancel any pending animation frame
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  // Update the reactive buttonPosition value with the final position
  if (floatingButton.value) {
    const computedStyle = window.getComputedStyle(floatingButton.value)
    const topValue = computedStyle.top
    buttonPosition.value = parseFloat(topValue) || buttonPosition.value
    
    // Calculate and save the position as a percentage
    const maxTop = window.innerHeight - floatingButtonConfig.maxBottomMarginPx
    const availableSpace = maxTop - floatingButtonConfig.minTopPx
    if (availableSpace > 0) {
      const newPercent = Math.min(100, Math.max(0, 
        ((buttonPosition.value - floatingButtonConfig.minTopPx) / availableSpace) * 100
      ))
      positionPercent.value = newPercent
      savePositionPercent(newPercent)
    }
  }
  
  // If we've moved during the drag, prevent the click event from firing
  if (hasMoved) {
    // Add a small timeout to prevent the click event from firing
    setTimeout(() => {
      hasMoved = false
    }, 100)
  }
  
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Initialize the button position when component is mounted
const initButtonPosition = () => {
  if (floatingButton.value) {
    floatingButton.value.style.top = `${buttonPosition.value}px`
  }
}

onMounted(() => {
  // Set initial position
  initButtonPosition()
  
  // Update position if window is resized
  window.addEventListener('resize', () => {
    // Recalculate position based on the percentage between min and max
    if (floatingButton.value) {
      buttonPosition.value = calculateButtonPosition()
      floatingButton.value.style.top = `${buttonPosition.value}px`
    }
  })
  
  sendToBackground({
    type: TAOPROMPT_EVENTS.AUTH_REQUEST,
    payload: {}
  }).then((response) => {
    user.value = response.user
    if(typeof response.interface === 'boolean') {
      setting.value.interface = response.interface
    } else {
      setting.value.interface = true
    }
    console.log("🚀 ~ onMounted ~ setting:", setting.value)
  })

  setTimeout(() => {
    loading.value = false
  }, 1000);

  listenEvents()
})



onUnmounted(() => {
  window.removeEventListener(TAOPROMPT_EVENTS.LOADED, onLoaded);
})


const srcPrompts = chrome.runtime.getURL("src/ui/options-page/index.html#/options-page/prompts")

</script>

<template>
  <div
  :style="
  setting.interface ? '' : 'opacity: 0; pointer-events: none;'
  "
  >
    <UApp>
    <div class="flex ">
      <span v-if="loading" v-html="loading_icon">
      </span>
      <div v-else class="flex gap-2">
        <div v-if="prevInputValue" class="tooltip" data-tip="Undo Optimization">
          <BackButton ref="backButton" @click="undoHandle" />
        </div>
        <div class="tooltip" data-tip="Generate Prompt">
          <GenerateButton ref="generateButton" :isThinking="isThinking" :isGenerating="isGenerating"
            @click="generatePrompt" />
        </div>
      </div>
    </div>

    <UDrawer direction="right" v-model:open="openDrawer" class="taoprompt-drawer" :ui="{
      handle: ['!ml-2 !h-[100dvh] !bg-transparent !ml-0 !w-[24px]'],
      body: '!h-[100%]'
    }">
      <template #body>
        <iframe :src="srcPrompts"></iframe>
      </template>
    </UDrawer>

    <div id="taoprompt-floating-button" class="taoprompt-floating-button" ref="floatingButton">
      <div class="drag-handle border border-gray-200 rounded-xl overflow-hidden shadow-lg" @mousedown.stop.prevent="startDrag">
        <button 
              @click="!hasMoved && (openDrawer = true)"
              :class="cn('px-3 h-10 bg-white  text-black transition-all duration-500 cursor-pointer')">
              <img src="@assets/logo-symbol-dark.svg" width="18">
          </button>
      </div>
    </div>
  </UApp>
  </div>
</template>
<style></style>