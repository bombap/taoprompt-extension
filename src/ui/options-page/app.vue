<script setup lang="ts">
import { Notivue, Notification } from "notivue"
import { useLocaleLang } from "src/composables/useLocale"
import { baseUrl } from "@/const"

import { listenMessages } from "src/composables/useChromeExtensionMessaging"
import { TAOPROMPT_EVENTS } from "src/const.events"

const { isDark, toggleDark } = useTheme()
const authStore = useAuthStore()
const currentLocale = useLocaleLang()

const isPrompsPage = window.location.hash === "#prompts"
function loginHandle() {
  const langPath = currentLocale.value === "vi" ? "/vi/" : "/"
  window.open(`${baseUrl}${langPath}extension-login`, "_blank")
}
function authFetch() {
    authStore.login().then(() => {
        if (authStore.isAuthenticated) {
            authStore.getUser()
        }
    })
}

function listenEvents() {
    listenMessages((message, sender, sendResponse) => {
        switch (message.type) {
            case TAOPROMPT_EVENTS.AUTH_UPDATE:
                if (message.payload) {
                    authFetch()
                }
                return true
        }
    })
}

onMounted(() => {
  authFetch()
  listenEvents()
})
</script>

<template>
  <UApp>
    <AppHeader class="pl-4">
      
    </AppHeader>
    <div
      class="prose pt-18 prompts-page dark:!bg-gray-900 !bg-gray-100 ml-4"
    >
      <RouterView v-if="authStore.isAuthenticated"/>
      <div v-else class="flex items-center justify-center h-full">
        <UButton
        @click="loginHandle"
        color="primary"
        size="xl"
        class="cursor-pointer justify-center h-[48px]"
      >
        {{ $t("home.signIn") }}
      </UButton>
      </div>
      <!-- <IndexPage v-if="!isPrompsPage" />
      <PromptsPage v-else /> -->
    </div>

    <AppFooter />

    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>

    <div
      class="fixed z-50 left-0 top-0 w-[18px] h-[100dvh] bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-l-lg"
    >
      <div class="w-[5px] h-[3rem] bg-black/30 dark:bg-white/30 rounded"></div>
    </div>
  </UApp>
</template>

<style scoped>
.prompts-page {
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
