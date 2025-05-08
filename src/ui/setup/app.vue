<script setup lang="ts">
import { Notivue, Notification } from 'notivue'
const route = useRoute()
const { isDark, toggleDark } = useTheme()

onMounted(() => {
})
</script>

<template>
    <UApp>
      <div class="absolute opacity-50 inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#3d3d3d_1px,transparent_1px),linear-gradient(to_bottom,#3d3d3d_1px,transparent_1px)]"></div>
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-background"></div>
    
      <div class="p-4 fixed z-[10] top-0 left-0 w-full flex items-center justify-end gap-4">
        <LocaleSwitch/>
        <ThemeSwitch />
      </div>

      <div class="w-full p-4 prose relative z-[2] h-[100dvh]">
        <RouterView />
      </div>

      <AppFooter />

      <Notivue v-slot="item">
        <Notification :item="item" />
      </Notivue>
    </UApp>
</template>

<style lang="scss"></style>
