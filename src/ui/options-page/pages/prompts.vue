<template>
    <div v-if="authStore.isAuthenticated" class="pt-14 h-[100dvh]">
        <UTabs :items="items" class="w-full" :ui="{
            list: 'bg-stone-100 dark:bg-stone-800 border-[.5px] border-stone-300 dark:border-stone-900',
            indicator: 'bg-black dark:bg-white text-white dark:text-black',
            trigger: 'data-[state=active]:text-white dark:data-[state=active]:text-black cursor-pointer'
        }">
            <template #content="{ item, index }">
                <PromptHistories v-if="index === 0" />
                <PersonalLibrary v-else />
            </template>
        </UTabs>
    </div>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { listenMessages } from "src/composables/useChromeExtensionMessaging"
import { TAOPROMPT_EVENTS } from "src/const.events"
import PersonalLibrary from '../components/PersonalLibrary.vue'

const authStore = useAuthStore()

const items = ref<TabsItem[]>([
    {
        label: 'System Library',
        icon: 'i-lucide-user',
        content: 'This is the account content.'
    },
    {
        label: 'Personal Library',
        icon: 'i-lucide-lock',
        content: 'This is the password content.'
    }
])

function authFetch() {
    authStore.login().then(() => {
        if (authStore.isAuthenticated) {
            authStore.getUser()
        }
    })
}

function listenEvents() {
    listenMessages((message, sender, sendResponse) => {
        switch (message.type) {
            case TAOPROMPT_EVENTS.AUTH_UPDATE:
                if (message.payload) {
                    authFetch()
                }
                return true
        }
    })
}

onMounted(() => {
    authFetch()
    listenEvents()
})
</script>