<script setup lang="ts">
import { Notivue, Notification } from 'notivue'
import { useLocaleLang } from "src/composables/useLocale"

const authStore = useAuthStore()

authStore.login().then(() => {
  if (authStore.isAuthenticated) {
    authStore.getUser()
  }
})


const currentLocale = useLocaleLang()

onMounted(() => {
  console.log("lang", currentLocale)

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTH_UPDATE" && message.payload) {
      authStore.login().then(() => {
        if (authStore.isAuthenticated) {
          authStore.getUser()
        }
      })
      return true
    }
  })
})
</script>

<template>
  <div class="bg-slate-50 dark:bg-stone-900 min-h-full">
    <AppHeader />
    <div class="prose pt-16">
      <RouterView />
    </div>

    <AppFooter />

    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
  </div>
</template>

<style scoped></style>
