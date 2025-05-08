<script setup>
import { useLocaleLang } from "src/composables/useLocale"
import { i18n } from "src/utils/i18n"

const currentLocale = useLocaleLang()

const locales = [
  {
    code: "en",
    language: "en-US",
    img: "us",
    name: "English",
  },
  {
    code: "vi",
    language: "vi-VN",
    img: "vn",
    name: "Tiếng Việt",
  },
]


const items = computed(() => {
  return i18n.global.availableLocales.map(lang => {

    const locale = locales.find(l => l.code === lang)
    return {
      name: locale?.name,
      label: lang,
      onSelect: () => {
        currentLocale.value = lang
      },
      active: lang === currentLocale.value,
      avatar: {
        src: `https://hatscripts.github.io/circle-flags/flags/${locale?.img.toLowerCase()}.svg`
      },
      class: 'cursor-pointer'
    }
  })
})

const activeLocale = computed(() => {
  return items.value.find(item => item.active)
})
</script>

<template>
  <UDropdownMenu :items="items" :popper="{ placement: 'bottom-end', }"

  :ui="{
    content: 'z-10',
    
  }"
  >
    <UButton variant="soft" size="sm" class="px-2 py-1 rounded-lg cursor-pointer" :avatar="activeLocale?.avatar">
      <span class="font-medium">{{ currentLocale.toUpperCase() }}</span>
      <template #trailing>
        <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>