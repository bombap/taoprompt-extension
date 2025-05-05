<script setup lang="ts">
import { baseUrl } from "@/const";
import { TAOPROMPT_EVENTS } from "src/const.events"

const authStore = useAuthStore()

const loading = ref(true)

function openProfile() {
  window.open(`${baseUrl}/settings/`, "_blank");
}

const router = useRouter()
function logout() {
  authStore.logout()
  router.back()
}

const prompt = ref({
  language: "English",
  interface: true
})

const LANGUAGES: Record<string, { name: string, charset: string }> = {
  "vi": {
    "name": "Vietnamese",
    "charset": "UTF-8"
  },
  "en": {
    "name": "English",
    "charset": "UTF-8"
  }
}

const languages = Object.keys(LANGUAGES).map(key => ({
  code: key,
  value: LANGUAGES[key].name,
  label: LANGUAGES[key].name
}))


function changeSettingsHandle() {
  sendToBackground({
    type: TAOPROMPT_EVENTS.SETTINGS_UPDATE,
    data: {
      language_output: prompt.value.language,
      interface: prompt.value.interface
    }
  })

}

 

onMounted(() => {
  loading.value = true
  chrome.storage.local.get(["language_output", "interface"], (result) => {
    prompt.value.language = result.language_output || "English"
    if(typeof result.interface === 'boolean') {
      prompt.value.interface = result.interface
    } else {
      prompt.value.interface = true
    }
    loading.value = false
  })
})
</script>

<template>
  <div class="p-4 max-w-[384px] w-full mx-auto">
    <RouterLinkUp />
    <div
      class="max-w-xl w-full mx-auto rounded-xl p-4 md:border border-base-200 md:shadow-lg bg-base-100 dark:bg-stone-800">

      <h1 class="text-xl">{{ $t('settings.title') }}</h1>

      <h3 class="text-lg mb-1 mt-3">{{ $t('settings.promptGeneration') }}</h3>
      <p class="text-xs">{{ $t('settings.promptGenerationDescription') }}</p>

      <div>
        <UFormField :label="$t('result-language')" name="language">
          <USelectMenu v-model="prompt.language" :items="languages" value-key="value" size="xl" variant="soft" :ui="{
            base: `w-full bg-white dark:bg-stone-800 hover:!bg-stone-200 dark:hover:!bg-stone-700 focus:bg-stone-100 dark:focus:bg-stone-800 border-[.5px] border-stone-300 dark:border-stone-600`,
          }" class="cursor-pointer w-[200px] flex-1" @change="changeSettingsHandle">
          </USelectMenu>
        </UFormField>
      </div>
    

      <div class="py-6">
        <USeparator />
      </div>

      <h3 class="text-lg mb-1 mt-0">{{ $t('settings.userInterface') }}</h3>
      <p class="text-xs">{{ $t('settings.userInterfaceDescription') }}</p>

      <div v-if="!loading" class="mt-4">
        <UFormField :label="$t('settings.hideGenerateButton')" name="hideGenerateButton">
          <div class="flex items-center gap-2">
            <USwitch v-model="prompt.interface" @change="changeSettingsHandle" />
            <span class="text-xs">{{ $t('settings.hideGenerateButtonDescription') }}</span>
          </div>
        </UFormField>
      </div>

      <div class="mt-4">
        <UFormField :label="$t('settings.enableDarkTheme')" name="darkTheme">
          <ThemeSwitch />
        </UFormField>
      </div>

      <div class="mt-4">
        <UFormField :label="$t('settings.changeLanguage')" name="language">
          <LocaleSwitch />
        </UFormField>
      </div>

      <div v-if="authStore.isAuthenticated">
        <h3 class="mt-4 mb-0">{{ $t('settings.profile') }}</h3>
        <p class="text-xs">{{ $t('settings.profileDescription') }}</p>

        <UButton @click="openProfile()" class="mb-4 cursor-pointer">
          <UIcon name="i-ph-user" class="size-5" />
          {{ $t('settings.updateProfile') }}
        </UButton>
        <UButton class="animate__fadeInUp animate__animated animate__fast cursor-pointer justify-center" @click="logout"
          size="xl" block variant="soft">
          {{ $t('settings.logout') }}
        </UButton>
      </div>

    </div>
  </div>
</template>
