<template>
  <div class="personal-library">
    <!-- Header with Add Button -->

    <!-- Search Bar -->
    <div class="relative w-full px-1 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search prompt..."
        class="!w-full !pl-10 pr-4 py-2 !rounded-xl !outline-none !ring-0 !bg-gray-50 !border-gray-200 focus:!border-gray-400 dark:!bg-gray-900 dark:!border-gray-800 focus:!border-gray-700"
        @input="debouncedSearch"
      />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 z-[1]">
        <UIcon
          name="mingcute:search-line"
          class="size-5 !text-gray-400"
        />
      </span>
    </div>

    <UAlert
      v-if="showSecurityAlert"
      color="info"
      variant="subtle"
      :title="$t('personal-library.security-alert-title')"
      :description="$t('personal-library.security-alert-description')"
      icon="i-lucide-shield-check"
      class="mb-4"
      :actions="[
        {
          label: $t('personal-library.dismiss'),
          color: 'neutral',
          variant: 'subtle',
          onClick: () => dismissSecurityAlert()
        },
      ]"
    />

    <!-- Prompts List -->
    <div v-if="prompts.length > 0">
      <div
        v-for="(prompt, index) in prompts"
        :key="prompt.id"
        class="border-b-[.5px] border-gray-300 dark:border-gray-700 block px-2 py-2 mb-1 text-gray-700 dark:text-white/80 hover:bg-gray-100 cursor-pointer hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-900 dark:hover:text-white transition-colors"
        @click="injectPrompt(prompt)"
      >
        <div class="flex gap-2">
          <UIcon
            name="mingcute:add-circle-line"
            class="size-8"
          />

          <div class="flex-1 min-w-0">
            <h3 class="text-sm truncate !my-0">{{ prompt.title }}</h3>
            <p class="text-xs text-gray-500 line-clamp-2 mb-0">
              {{ prompt.content }}
            </p>
          </div>
          <UDropdownMenu
            placement="bottom-end"
            :items="[
              {
                label: 'Edit',
                icon: 'mingcute:edit-line',
                class: 'cursor-pointer',
                onSelect: () => editPrompt(prompt),
              },
              {
                label: 'Delete',
                icon: 'mingcute:delete-line',
                class: 'cursor-pointer',
                onSelect: () => confirmDelete(prompt.id!),
              },
            ]"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="mdi:dots-vertical"
              size="xs"
              @click.stop
              class="!p-1 cursor-pointer"
            />
          </UDropdownMenu>
        </div>
      </div>

      <div class="py-12"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading"
      class="text-center py-8"
    >
      <UIcon
        name="mingcute:inbox-line"
        class="size-16 mx-auto text-gray-400 mb-2"
      />
      <p class="text-gray-500 dark:text-gray-400">
        {{
          searchQuery
            ? "No prompts found matching your search"
            : "No prompts yet. Create your first one!"
        }}
      </p>
      <UButton
        v-if="!searchQuery"
        @click="openAddModal"
        color="primary"
        variant="soft"
        size="xl"
        class="cursor-pointer rounded-xl mt-2"
      >
        Add Prompt
      </UButton>
    </div>

    <!-- Loading State -->
    <div
      v-else
      class="text-center py-8"
    >
      <USkeleton class="h-12 mb-2" />
      <USkeleton class="h-12 mb-2" />
      <USkeleton class="h-12" />
    </div>

    <div
      class="fixed bottom-0 left-0 right-0 py-2 pl-9 pr-4 flex justify-center bg-black/10 dark:bg-white/10"
    >
      <UButton
        @click="openAddModal"
        color="primary"
        icon="mingcute:add-line"
        size="lg"
        block
        class="rounded-lg cursor-pointer"
      >
        Add Prompt
      </UButton>
    </div>

    <!-- Add/Edit Modal -->
    <UModal
      v-model:open="isModalOpen"
      :ui="{
        content: 'left-[calc(50%+10px)] z-10',
        overlay: 'z-[7] bg-gray-900/80 dark:bg-gray-900/90',
      }"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">
                {{ editingPrompt ? "Edit Prompt" : "Add New Prompt" }}
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="p-1 h-auto"
                @click="isModalOpen = false"
              />
            </div>
          </template>

          <div class="flex flex-col space-y-4">
            <UFormField
              label="Title"
              name="title"
            >
              <UInput
                v-model="promptForm.title"
                placeholder="Enter prompt title"
                class="!w-full flex-1"
                :ui="{
                  base: 'w-full flex-1 !outline-none !ring-0 !bg-gray-50 !border-gray-100 focus:!border-gray-400 dark:!bg-gray-900 dark:!border-gray-800 focus:!border-gray-700',
                }"
              />
            </UFormField>

            <UFormField
              label="Content"
              name="content"
            >
              <UTextarea
                v-model="promptForm.content"
                placeholder="Enter prompt content"
                :rows="6"
                class="!w-full !outline-none"
                style="height: 200px"
                :ui="{
                  base: '!w-full !whitespace-normal  !outline-none !ring-0 !bg-gray-50 !border-gray-100 focus:!border-gray-400 dark:!bg-gray-900 dark:!border-gray-800 focus:!border-gray-700',
                }"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-4">
              <UButton
                color="primary"
                variant="soft"
                @click="isModalOpen = false"
                size="xl"
                class="cursor-pointer flex-1 justify-center"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="isSaving"
                @click="savePrompt"
                size="xl"
                class="cursor-pointer flex-1 justify-center"
              >
                {{ editingPrompt ? "Update" : "Save" }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      :ui="{
        content: 'left-[calc(50%+12px)]',
      }"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Confirm Delete</h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="p-1 h-auto"
                @click="isDeleteModalOpen = false"
              />
            </div>
          </template>

          <p>
            Are you sure you want to delete this prompt? This action cannot be
            undone.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="primary"
                variant="soft"
                @click="isDeleteModalOpen = false"
                class="cursor-pointer"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                :loading="isDeleting"
                @click="deleteSelectedPrompt"
                class="cursor-pointer"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue"
import { usePromptDB, type Prompt } from "../../../composables/usePromptDB"
import { TAOPROMPT_EVENTS } from "@/src/const.events"

// Initialize prompt database
const {
  prompts: promptsRef,
  isLoading,
  addPrompt,
  updatePrompt,
  deletePrompt,
  getPrompts,
} = usePromptDB()

// Toast notifications
const toast = useToast()

// State
const prompts = ref<Prompt[]>([])
const searchQuery = ref("")
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const promptToDeleteId = ref<number | null>(null)
const editingPrompt = ref<Prompt | null>(null)
const showSecurityAlert = ref(true)

// Form state
const promptForm = reactive({
  title: "",
  content: "",
})

// Load prompts on mount
onMounted(() => {
  loadPrompts()
})

// Watch for changes in the prompts from the database
watch(promptsRef, (newPrompts) => {
  prompts.value = newPrompts
})

// Debounced search
let searchTimeout: number | null = null
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    loadPrompts()
  }, 300)
}

// Load prompts with optional search
const loadPrompts = async () => {
  try {
    const result = await getPrompts({ query: searchQuery.value })
    prompts.value = result
  } catch (error) {
    console.error("Failed to load prompts:", error)
    toast.add({ description: "Failed to load prompts", color: "error" })
  }
}

// Open add modal
const openAddModal = () => {
  editingPrompt.value = null
  promptForm.title = ""
  promptForm.content = ""
  isModalOpen.value = true
}

// Edit prompt
const editPrompt = (prompt: Prompt) => {
  editingPrompt.value = prompt
  promptForm.title = prompt.title
  promptForm.content = prompt.content
  isModalOpen.value = true
}

// Save prompt (add or update)
const savePrompt = async () => {
  if (!promptForm.title.trim() || !promptForm.content.trim()) {
    toast.add({ description: "Please fill in all fields", color: "error" })
    return
  }

  isSaving.value = true

  try {
    if (editingPrompt.value) {
      // Update existing prompt
      await updatePrompt(editingPrompt.value.id!, {
        title: promptForm.title,
        content: promptForm.content,
      })
      toast.add({
        description: "Prompt updated successfully",
        color: "success",
      })
    } else {
      // Add new prompt
      await addPrompt({
        title: promptForm.title,
        content: promptForm.content,
      })
      toast.add({ description: "Prompt added successfully", color: "success" })
    }

    isModalOpen.value = false
    await loadPrompts()
  } catch (error) {
    console.error("Failed to save prompt:", error)
    toast.add({ description: "Failed to save prompt", color: "error" })
  } finally {
    isSaving.value = false
  }
}

// Confirm delete
const confirmDelete = (id: number) => {
  promptToDeleteId.value = id
  isDeleteModalOpen.value = true
}

// Delete prompt
const deleteSelectedPrompt = async () => {
  if (!promptToDeleteId.value) return

  isDeleting.value = true

  try {
    await deletePrompt(promptToDeleteId.value)
    toast.add({ description: "Prompt deleted successfully", color: "success" })
    isDeleteModalOpen.value = false
    await loadPrompts()
  } catch (error) {
    console.error("Failed to delete prompt:", error)
    toast.add({ description: "Failed to delete prompt", color: "error" })
  } finally {
    isDeleting.value = false
  }
}

const injectPrompt = (prompt: Prompt) => {
  sendToBackground({
    type: TAOPROMPT_EVENTS.INJECT_PROMPT,
    data: {
      prompt: prompt.content,
    },
  })
}

const dismissSecurityAlert = () => {
  showSecurityAlert.value = false
  localStorage.setItem("hideSecurityAlert", "true")
}

onMounted(() => {
  showSecurityAlert.value = localStorage.getItem("hideSecurityAlert") !== "true"
})
</script>
