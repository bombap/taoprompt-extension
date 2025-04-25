<script lang="ts" setup>
const { isDark, toggleDark } = useTheme()
</script>

<template>

  <UButton :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" color="neutral" variant="ghost" @click="toggleDark()"
    class="cursor-pointer" />


</template>
