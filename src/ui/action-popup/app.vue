<script setup lang="ts">
import { TAOPROMPT_EVENTS } from '@/src/const.events'
import { Notivue, Notification } from 'notivue'
import { useLocaleLang } from "src/composables/useLocale"

const authStore = useAuthStore()


const currentLocale = useLocaleLang()

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

authFetch()

onMounted(() => {
  console.log("lang", currentLocale)
  listenEvents()
})
</script>

<template>
  <div class="bg-slate-50 dark:bg-gray-900 min-h-full">
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
