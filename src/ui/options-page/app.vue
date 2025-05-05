<script setup lang="ts">
import { Notivue, Notification } from 'notivue'
import IndexPage from './pages/index.vue'
import PromptsPage from './pages/prompts.vue'
const { isDark, toggleDark } = useTheme()

const isPrompsPage = window.location.hash === '#prompts'

onMounted(() => {
  console.log(window.location)
})
</script>

<template>
  <UApp>
    <AppHeader :settingsButton="!isPrompsPage" class="pl-6"/>
    <div class="p-4 prose"
    :class="{
      'prompts-page !pl-1 !pr-4 ml-6': isPrompsPage
    }"
    >
      <IndexPage v-if="!isPrompsPage" />
      <PromptsPage v-else />
    </div>

    <AppFooter />

    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>

    <div class="fixed z-50 left-0 top-0 w-[24px] h-[100dvh] bg-black/10 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
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
