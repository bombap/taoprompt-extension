<script setup lang="ts">
const { isDark, toggleDark } = useTheme()

const props = defineProps({
  settingsButton: {
    type: Boolean,
    default: true
  },
  })

</script>

<template>
  <div class="fixed top-0 w-full left-0 top-0 z-[2]">
    <div
      class="flex items-center justify-between max-w-[480px] h-[64px] mx-auto w-full dark:bg-black bg-gray-100 text-primary-content p-2 border-[.5px] border-gray-300 dark:border-gray-700">
      <div class="flex-1 pl-2">
        <RouterLink to="/" class="flex gap-2 items-center">

          <img v-if="isDark" src="@assets/logo-full-dark.svg" class="h-8">
          <img v-else src="@assets/logo-full.svg" class="h-8">
        
        </RouterLink>
      </div>
      <div class="flex-none flex items-center gap-2">
        <ThemeSwitch />
        <RouterLink v-if="settingsButton" to="/options-page">
          <UButton icon="mingcute:settings-3-line" color="neutral" variant="ghost" class="cursor-pointer" />
        </RouterLink>
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
