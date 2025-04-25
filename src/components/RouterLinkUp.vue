<script setup lang="ts">
const router = useRouter()

defineProps<{
  label?: string
}>()
</script>

<template>
  <UButton
    class="mb-4 cursor-pointer"
    variant="ghost"
    @click="router.back()"
  >
    <UIcon name="i-ph-arrow-left" class="size-5" />
    {{ label || $t('goBack') }}
  </UButton>
</template>

<style scoped></style>
