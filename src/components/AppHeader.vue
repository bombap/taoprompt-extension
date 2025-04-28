<script setup lang="ts">
const { isDark, toggleDark } = useTheme()

</script>

<template>
  <div class="fixed top-0 w-full left-0 top-0 z-50">
    <div
      class="flex items-center justify-between max-w-[384px] h-[64px] mx-auto w-full dark:bg-black bg-stone-100 text-primary-content p-2 border-[.5px] border-stone-300 dark:border-stone-700">
      <div class="flex-1 pl-2">
        <RouterLink to="/" class="flex gap-2 items-center">

          <img v-if="isDark" src="@assets/logo-full-dark.svg" class="h-10">
          <img v-else src="@assets/logo-full.svg" class="h-10">
        
        </RouterLink>
      </div>
      <div class="flex-none flex items-center gap-2">
        <ThemeSwitch />
        <RouterLink to="/options-page">
          <UButton icon="mingcute:settings-3-line" color="neutral" variant="ghost" class="cursor-pointer" />
        </RouterLink>

      </div>
    </div>
  </div>
</template>

<style scoped></style>
