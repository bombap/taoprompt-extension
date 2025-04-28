<script setup lang="ts">
import { marked } from 'marked'

import { CreatePromptSchema, User } from '@/types';
import GenerateButton from './components/GenerateButton.vue';
import BackButton from './components/BackButton.vue';
import { configEl, currentAiConfig, isGemini, isDeepSeek, isGrok, isGrokX, isCopilot } from './config';
import { useLiveTypingText } from '../composables/useLiveTypingText';
import { baseUrl, loading_icon } from '@/const';



if (isGemini) {
  // Tạo một renderer tùy chỉnh
  const renderer = new marked.Renderer();

  // Biến đếm toàn cục để theo dõi số thứ tự cho danh sách có thứ tự
  let listCounter = 0;
  let isOrdered = false;

  // Ghi đè phương thức list để xử lý danh sách
  renderer.list = function (token) {
    // Đặt lại biến đếm và lưu trạng thái loại danh sách
    listCounter = 0;
    isOrdered = token.ordered;

    // Chỉ trả về body (các items đã được render)
    return token.raw;
  };

  // Ghi đè phương thức listitem để sử dụng thẻ p thay vì li
  renderer.listitem = function (text) {
    if (isOrdered) {
      listCounter++;
      return `<p>${listCounter}. ${text.text}</p>`;
    } else {
      return `<p>• ${text.text}</p>`;
    }
  };

  // Thiết lập các tùy chọn cho marked
  marked.setOptions({
    renderer: renderer,
    gfm: true,         // GitHub flavored markdown
    breaks: true,      // Chuyển đổi line breaks thành <br>
  });


} else {
  // Setup options (tuỳ chọn nếu muốn thêm)
  marked.setOptions({
    breaks: true,
    gfm: true,
    renderer: new marked.Renderer()
  })
}

const user = ref<User | null>(null)

const loading = ref(true)
const showAnalysis = ref(false)


const generateButton = ref<InstanceType<typeof GenerateButton> | null>(null)
const backButton = ref<InstanceType<typeof BackButton> | null>(null)

// function setButtonWidth(button: HTMLElement) {
//   const autoWidth = button.scrollWidth + 'px';

//   button.style.width = autoWidth;
// }

const isTextAreaInput = computed(() => {
  if (isDeepSeek || isGrok || isGrokX || isCopilot) {
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

const isGenerating = ref(false);
const isThinking = ref(false);
const prevInputValue = ref('')

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

const endContent = ref('')

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


const isExpertMode = computed(() => {
  return formData.value.settings.mode === 'expert'
})


const promptResultStream = computed(() => {
  if (isExpertMode.value) {
    return `
${promptResultStreamInputs.value}
\n
${promptResultStream5W1H.value}
\n
${promptResultStreamFrameworkSelection.value}
\n
${promptResultStreamFormulaApplication.value}
\n
${promptResultStreamInstructionStructure.value}
\n
${promptResultStreamTitle.value}
\n
${promptResultStreamCategories.value}
`
  }

  return `
${promptResultStreamInputs.value}
\n
${promptResultStreamInstructionsStructure.value}
\n
${promptResultStreamTitle.value}
\n
${promptResultStreamCategories.value}
`
})

const promptResultStreamTitle = computed(() => {
  return getTagContent(promptStreamText.value, 'Title')
})
const promptResultStreamInputs = computed(() => {
  return getTagContent(promptStreamText.value, 'Inputs')
})
const promptResultStreamInstructionsStructure = computed(() => {
  return getTagContent(promptStreamText.value, 'Instructions Structure')
})
const promptResultStreamInstructionStructure = computed(() => {
  return getTagContent(promptStreamText.value, 'Instruction Structure')
})
const promptResultStreamCategories = computed(() => {
  return getTagContent(promptStreamText.value, 'Categories')
})
const promptResultStream5W1H = computed(() => {
  return getTagContent(promptStreamText.value, '5W1H Analysis')
})
const promptResultStreamFrameworkSelection = computed(() => {
  return getTagContent(promptStreamText.value, 'Framework Selection')
})
const promptResultStreamFormulaApplication = computed(() => {
  return getTagContent(promptStreamText.value, 'Formula Application')
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


const promptVariables = ref({
  variables: {} as Record<string, any>
})

const promptTextFormated = computed(() => {
  let text = formatStringStreamText(promptResultStreamInstructions.value)

  text = text.replaceAll(/\\"/g, '"')

  return text
})

const promptTextFormatedPreview = computed(() => {
  return formatStringToHTMLPreview(promptTextFormated.value)

  // .replaceAll(/\{\$(.+?)\}/g, (match, p1) => {
  //     const nonce = generateId()
  //     const value = promptVariables.value.variables[p1]
  //     const transformed = `<span id="var-${p1}-${nonce}" class="p-var ${value ? 'p-var--filled' : ''}" data-key="${p1}">${value || p1}</span>`;
  //     return transformed;
  // });
  // .replace(/\{\@(.+)\}/g, '<span class="p-var p-var--filled">$1</span>')
})

const endContentFormated = computed(() => {
  if (endContent.value) {
    return formatStringToHTMLPreview(endContent.value)
  }
  return ''
})

// const { displayText, resetDisplayText, } = useLiveTypingText(promptTextFormatedPreview, 1, onFinished, endContentFormated)




// watch(displayText, () => {
//   if (!isGenerating.value) return

//   if (!currentAiConfig.value) return
//   const inputEl = document.querySelector(currentAiConfig.value.inputSelector) as HTMLElement

//   if(isDeepSeek || isGrok) {
//     (inputEl as HTMLInputElement).value = displayText.value;

//     (inputEl as HTMLInputElement).innerText = displayText.value;

//     if(isDeepSeek) {
//       (inputEl as HTMLInputElement).parentElement!.children[1]!.innerHTML = displayText.value;
//     }
//   } else {
//     const val = marked.parse(displayText.value)
//     if (val instanceof Promise) {
//       val.then((v) => {
//         inputEl.innerHTML = v
//       })
//     } else {
//       inputEl.innerHTML = val
//     }
//   }

//   (inputEl as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));

//   placeCaretAtEnd(inputEl)

// })
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

  endContent.value = ''
  // resetDisplayText()
}

function onFinished() {
  setTimeout(() => {
    prevInputValue.value = formData.value.prompt
    resetPromptPreview()
  }, 300);
}

const generatePrompt = () => {

  //
  if (!user.value) {
    window.open(chrome.runtime.getURL("src/ui/action-popup/index.html"), '_blank');
    return
  }
  //
  const inputValue = getInputValue();
  if (!inputValue.trim()) {
    alert("Please enter a prompt before optimizing.");
    return;
  }


  formData.value.prompt = inputValue;


  // if (!generateButton.value) return
  // setButtonWidth(generateButton.value.$el as HTMLElement);

  isThinking.value = true;
  isGenerating.value = true;

  chrome.runtime.sendMessage(
    {
      type: "CREATE_PROMPT",
      data: {
        ...formData.value
      },
    },
    (response) => {
      if (!response) {
        resetPromptPreview()
      }
    }
  );

  // simulateTypingEditableSlow(document.querySelector(configEl.chatgpt.inputSelector) as HTMLElement, formData.value.prompt, 10);
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

async function simulateTypingEditableSlow(el: HTMLElement, text: string, delay = 100) {
  // formData.value.isGenerating = true;
  el.focus();
  el.innerText = '';

  for (const char of text) {
    el.innerText += char;

    placeCaretAtEnd(el);

    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, delay));
  }
  placeCaretAtEnd(el);
}


function listenAuth() {

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTH_UPDATE") {
      user.value = message.payload
      // Xử lý nội dung ở đây
    }
    if (message.type === 'TAOPROMPT_STREAM_CHUNK') {
      onStreamCreatePrompt(message.data)
    }

    if (message.type === 'TAOPROMPT_STREAM_DONE') {
      onDoneCreatePrompt()
      // Có thể thực hiện cleanup hoặc kết thúc giao diện ở đây
    }
    if (message.type === 'TAOPROMPT_ERROR') {
      if (message.code === 401) {
        // window.open(chrome.runtime.getURL("src/ui/action-popup/index.html"), '_blank');
        chrome.runtime.sendMessage(
          {
            type: "OPEN_POPUP",
          });

      } else {
        if(message.error_code === "DAILY_LIMIT_REACHED") {
          window.open(`${baseUrl}/pricing`, '_blank');
          return
        } 
        alert(message.data)
      }
      // Có thể thực hiện cleanup hoặc kết thúc giao diện ở đây

    }

    return true
  });
}


const renderPromptVariables = () => {
  const arr = promptResultStreamInputs.value.split('\n').map(line => line.trim()).filter(line => line !== '');

  const variablesKeys = arr.map((item) => {
    const match = item.match(/\{\$(\w+)\}/);
    return match ? match[1] : null
  }).filter(item => item !== null)

  promptVariables.value.variables = variablesKeys.reduce((acc, item) => {
    acc[item] = '';
    return acc;
  }, {} as Record<string, any>);

}

function onDoneCreatePrompt() {
  renderPromptVariables()
  // 
  setTimeout(() => {
    endContent.value = promptResultStreamInstructions.value.slice(-20)
  }, 300);

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


onMounted(() => {
  chrome.runtime.sendMessage(
    {
      type: "REQUEST_AUTH",
      payload: {
      }
    },
    (response) => {
      user.value = response.user
    }
  );

  setTimeout(() => {
    loading.value = false
  }, 1000);
  listenAuth()
})



onUnmounted(() => {
})

window.addEventListener('taoprompt-style-updated', (event) => {
  loading.value = false
});


</script>

<template>
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

        <!-- <button class="btn btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
      </button> -->
      </div>
    </div>
  </UApp>

  <!-- <Teleport to="#taoprompt-preview">
    <div v-if="showAnalysis" class="prompt-preview">
      <div>
        {{ user?.name }}
      </div>
      <div>
        {{ user?.email }}
      </div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga blanditiis optio, tenetur et voluptates, nam corrupti sequi molestias soluta nobis a sint quasi vel perferendis incidunt. Aliquam, obcaecati atque! Commodi.
    
      <button @click="closeAnalysis" class="close" type="button">X</button>
    </div>
  </Teleport> -->
</template>
<style></style>