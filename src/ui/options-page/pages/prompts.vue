<template>
    <div v-if="authStore.isAuthenticated" class="h-[100dvh] px-4">
        <UTabs :items="items" class="w-full" :ui="{
            list: 'bg-gray-200 dark:bg-gray-800 border-[.5px] border-gray-300 dark:border-gray-900',
            indicator: 'bg-black dark:bg-white text-white dark:text-black',
            trigger: 'data-[state=active]:text-white dark:data-[state=active]:text-black cursor-pointer'
        }">
            <template #content="{ item, index }">
                <PromptHistories v-if="index === 1" />
                <PersonalLibrary v-else />
            </template>
        </UTabs>
    </div>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import PersonalLibrary from '../components/PersonalLibrary.vue'

const authStore = useAuthStore()

const items = ref<TabsItem[]>([
    {
        label: 'Prompt Notes',
        icon: 'hugeicons:note',
        content: 'This is the password content.'
    },

    {
        label: 'Created Prompts',
        icon: 'streamline:ai-prompt-spark',
        content: 'This is the account content.'
    },
])



authStore.getConfig()

onMounted(() => {
})
</script>