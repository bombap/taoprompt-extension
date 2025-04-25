<script setup lang="ts">
import chatGptIcon from "@assets/ai-apps/chatgpt-icon.svg"
import googleGeminiIcon from "@assets/ai-apps/google-gemini-icon.svg"
import grokIcon from "@assets/ai-apps/grok-icon.svg"
import deepSeekIcon from "@assets/ai-apps/deepseek-icon.svg"
import claudeAIAIcon from "@assets/ai-apps/claude-ai-icon.svg"
import { baseUrl } from "@/const"
import { useLocaleLang } from "src/composables/useLocale"

const currentLocale = useLocaleLang()
const authStore = useAuthStore()

function loginHandle() {
  const langPath =currentLocale.value === 'vi' ? '/vi/' : '/'
  window.open(`${baseUrl}${langPath}extension-login`, "_blank");
}

const ai_apps = [
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    icon: chatGptIcon
  },
  {
    name: "Claude",
    url: "https://claude.ai/",
    icon: claudeAIAIcon
  },
  {
    name: "Gemini",
    url: "https://gemini.google.com/",
    icon: googleGeminiIcon
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com/",
    icon: deepSeekIcon
  },
  {
    name: "Grok",
    url: "https://grok.com/",
    icon: grokIcon
  }
]

function openApp(app: typeof ai_apps[0]) {
  openOrActivateTab(app.url);
}

function openOrActivateTab(url: string) {
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find(tab => tab.url?.startsWith(url));
    if (existingTab && existingTab.id) {
      chrome.tabs.update(existingTab.id, { active: true });
      chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url });
    }
  });
}

function openAbout() {
  window.open(`${baseUrl}/`, "_blank");
}

function openPlan() {
  window.open(`${baseUrl}/settings/plan`, "_blank");
}

onMounted(() => {
 })
const { isDark, toggleDark } = useTheme()

const particlesColor = computed(() => (isDark.value ? "#FFFFFF" : "#000000"));

</script>

<template>
  <div class="min-h-[500px]">
    <div class="sparkles-container">
      <Sparkles background="transparent" :min-size="0.4" :max-size="1.4" :particle-density="300" class="size-full"
        :particle-color="particlesColor" />
    </div>
    <div class="relative max-w-6xl flex flex-col space-y-6 p-4">
      <h1 class="animate__animated animate__fadeInUp text-2xl font-semibold">{{ $t('home.sayHi') }} {{ authStore.user?.name }}</h1>

      <div v-if="authStore.isAuthenticated"
        class="animate__fadeInUp animate__animated animate__fast p-3 flex items-center gap-2 border-[.5px] border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 rounded-lg">
        <UAvatar :src="authStore.user?.image" />
        <div>
          <h3 class="text-sm font-medium !my-0">{{ authStore.user?.name }}</h3>
          <p class="text-xs text-gray-500 !my-0">{{ authStore.user?.email }}</p>
        </div>
        <div class="flex-1"></div>
        <div>
          <UButton @click="openPlan" color="primary" size="sm" class="cursor-pointer">
            {{
              authStore.user?.subscriptionId ? 'Premium' : 'Free'
            }} Plan
          </UButton>
        </div>
      </div>

      <UButton v-else @click="loginHandle" color="primary" size="xl" class="cursor-pointer justify-center h-[48px]">
        {{ $t('home.signIn') }}
      </UButton>


      <div class="flex flex-col gap-2">
        <UButton v-for="(app, index) in ai_apps" :key="app.name" size="xl" variant="soft"
          class="animate__fadeInUp animate__animated animate__fast cursor-pointer bg-stone-100 border-[.5px] border-stone-200 hover:bg-stone-300 dark:border-stone-800 dark:bg-stone-800/60 hover:dark:bg-stone-600/60 dark:text-white"
          @click="openApp(app)" trailing-icon="i-ph-arrow-square-out-thin"
          :style="
          {
            animationDelay: `${index * 50}ms`,
          }
          "
          >
          <div class="flex items-center gap-2 flex-1">
            <img :src="app.icon" :alt="app.name" class="size-8 !my-0" />
            {{ app.name }}
          </div>
        </UButton>
      </div>

     


      <!-- <a href="/common/about" class="text-primary"> -->


      <UButton @click="openAbout" size="xl" block variant="soft"
        class="animate__fadeInUp animate__animated animate__fast cursor-pointer dark:bg-stone-800/60 dark:text-white">
        <UIcon name="i-ph-question" class="size-5" />
        {{ $t('home.about') }}
      </UButton>

    </div>
  </div>
</template>

<style>


.sparkles-container {
  position: absolute;
  width: 100%;
  height: 180px;
}

.sparkles-container::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(252, 249, 250, 0) 0%, rgba(252, 249, 250, 1) 60%);
}

.dark .sparkles-container::before {
  background: linear-gradient(180deg, rgba(28, 25, 25, 0) 0%, rgba(28, 25, 25, 1) 60%);
}




</style>
