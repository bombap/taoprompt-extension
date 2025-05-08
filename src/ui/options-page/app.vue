<script setup lang="ts">
import { Notivue, Notification } from "notivue"
import IndexPage from "./pages/index.vue"
import PromptsPage from "./pages/prompts.vue"
const { isDark, toggleDark } = useTheme()

const isPrompsPage = window.location.hash === "#prompts"

onMounted(() => {})
</script>

<template>
  <UApp>
    <AppHeader class="pl-4">
      
    </AppHeader>
    <div
      class="prose pt-18 prompts-page dark:!bg-gray-900 !bg-gray-100 ml-4"
    >
      <RouterView />
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
