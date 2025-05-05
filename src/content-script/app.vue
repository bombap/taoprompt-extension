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

const formData = ref<CreatePromptSchema>({
  prompt: '',
  settings: {
    mode: 'fastest',
    model: 'anthropic/claude-3-haiku',
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
        setting.value.interface = message.data.interface
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


onMounted(() => {
  sendToBackground({
    type: TAOPROMPT_EVENTS.AUTH_REQUEST,
    payload: {}
  }).then((response) => {
    user.value = response.user
    setting.value.interface = response.interface
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


const srcPrompts = chrome.runtime.getURL("src/ui/options-page/index.html#prompts")

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

    <div id="taoprompt-floating-button" class="taoprompt-floating-button">
      <ButtonFlubber :tabs="['@', '|']" @open="openDrawer = true" />
    </div>
  </UApp>
  </div>
</template>
<style></style>