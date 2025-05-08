<template>
  <div class="flex justify-center w-full mb-3">
    <div class="relative w-full px-1">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search prompt..."
        class="!w-full !pl-10 pr-4 py-2 !rounded-xl !outline-none !ring-0 !bg-gray-50 !border-gray-200 focus:!border-gray-400 dark:!bg-gray-900 dark:!border-gray-800 focus:!border-gray-700"
      />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <UIcon
          name="mingcute:search-line"
          class="size-5 !text-gray-400"
        />
      </span>
    </div>
  </div>
  
  <div
    v-if="loading"
    class="flex flex-col h-full space-y-3"
  >
    <USkeleton
      class="h-4 w-[250px] !bg-gray-400 dark:!bg-gray-700"
    />
    <USkeleton
      class="h-4 w-[200px] !bg-gray-400 dark:!bg-gray-700"
    />
  </div>
  <div v-else-if="promptHistory.length > 0">
    <div>
      <div
        v-for="(item, index) in promptHistory"
        :key="index"
        class="border-b-[.5px] border-gray-300 dark:border-gray-700 block px-2 py-2 mb-1 text-gray-700 dark:text-white/80 hover:bg-gray-100 cursor-pointer hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900 dark:hover:text-white transition-colors"
        @click="injectPrompt(item)"
      >
        <div class="flex gap-2">
          <UIcon
            name="mingcute:add-circle-line"
            class="size-8"
          />

          <div class="flex-1 min-w-0">
            <h3 class="text-sm truncate !my-0">{{ item.title }}</h3>
            <p class="text-xs text-gray-500 line-clamp-2 mb-0">
              {{ item.finalPrompt }}
            </p>
            <a
              @click.stop
              :href="`http://taoprompt.com/p/${item.id}`"
              target="_blank"
              class="text-primary text-xs flex items-center gap-1"
            >
              View
              <UIcon
                name="famicons:open-outline"
                class="size-3"
              />
            </a>
          </div>
        </div>
      </div>
      <div
        v-if="!isEnd"
        class="flex items-center justify-center"
      >
        <UButton
          @click="loadMore"
          color="primary"
          variant="ghost"
          size="sm"
          block
          class="cursor-pointer"
          :disabled="loadmoreLoading"
          :loading="loadmoreLoading"
        >
          <span class="text-gray-400">{{ $t("more") }}</span>
        </UButton>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center h-full max-w-[12rem] mx-auto space-y-3"
  >
    <Icon
      name="mingcute:empty-box-line"
      class="drop-shadow-md drop-shadow-white dark:drop-shadow-black text-gray-300 dark:text-white/40 size-14 animate__animated animate__fadeIn animate__fast"
    />
    <p class="text-center text-sm text-gray-400 dark:text-white/40">
      {{ $t("no-prompt") }}
    </p>
  </div>
</template>
<script setup lang="ts">
import type { PromptItemOnSidebar } from "@/types"
import { TAOPROMPT_EVENTS } from "../const.events"

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
  clickToClose: {
    type: Boolean,
    default: false,
  },
})

const getPromptList = async (
  searchQuery: string,
  page: number,
  limit: number,
) => {
  const input = {
    params: {
      q: searchQuery,
      page,
      limit,
    },
  }

  const queryString = new URLSearchParams(input.params as any).toString()

  const response = await api.get("prompt?" + queryString)
  return response
}

const promptHistory = ref<PromptItemOnSidebar[]>([])
const limit = 10
const page = ref(1)
const loading = ref(false)
const loadmoreLoading = ref(false)
const isEnd = ref(false)
const searchQuery = ref("")

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchPromptHistory()
  }, 400)
})

const fetchPromptHistory = async () => {
  if (page.value === 1) {
    loading.value = true
  } else {
    loadmoreLoading.value = true
  }
  const res = await getPromptList(searchQuery.value, page.value, limit)
  if (page.value === 1) {
    promptHistory.value = res.prompts.filter((item: any) => item.title !== "")
  } else {
    promptHistory.value.push(
      ...res.prompts.filter((item: any) => item.title !== ""),
    )
  }
  isEnd.value = res.prompts.length < limit
  if (page.value === 1) {
    loading.value = false
  } else {
    loadmoreLoading.value = false
  }
}

const loadMore = async () => {
  page.value++
  fetchPromptHistory()
}

const injectPrompt = (prompt: PromptItemOnSidebar) => {
  sendToBackground({
    type: TAOPROMPT_EVENTS.INJECT_PROMPT,
    data: {
      prompt: prompt.finalPrompt,
    },
  })
}

onMounted(() => {
  fetchPromptHistory()
})

onUnmounted(() => {})
</script>
