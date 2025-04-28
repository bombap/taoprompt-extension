<script setup lang="ts">
import { baseUrl } from "@/const";

const authStore = useAuthStore()

function openProfile() {
  window.open(`${baseUrl}/settings/`, "_blank");
}

const router = useRouter()
function logout() {
  authStore.logout()
  router.back()
}

const prompt = ref({
  language: "Vietnamese"
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


watch(prompt, () => {


  chrome.runtime.sendMessage({
    type: "SEND_PROMPT_SETTINGS",
    data: {
      language_output: prompt.value.language
    },
  })
}, {
  deep: true
})

</script>

<template>
  <div class="p-4 max-w-[384px] w-full mx-auto">
    <RouterLinkUp />
    <div
      class="max-w-xl w-full mx-auto rounded-xl md:my-12 p-4 md:p-8 md:border border-base-200 md:shadow-lg bg-base-100 dark:bg-stone-800">

      <h1 class="text-xl">{{ $t('settings.title') }}</h1>

      <h3 class="text-lg mb-1 mt-3">{{ $t('settings.promptGeneration') }}</h3>
      <p class="text-xs">{{ $t('settings.promptGenerationDescription') }}</p>

      <div>
        <UFormField :label="$t('result-language')" name="language">
          <USelectMenu v-model="prompt.language" :items="languages" value-key="value" size="xl" variant="soft" :ui="{
            base: `w-full bg-white dark:bg-stone-800 hover:!bg-stone-200 dark:hover:!bg-stone-700 focus:bg-stone-100 dark:focus:bg-stone-800 border-[.5px] border-stone-300 dark:border-stone-900`,
          }" class="cursor-pointer w-[200px] flex-1">
          </USelectMenu>
        </UFormField>
      </div>

      <div class="py-6">
        <USeparator />
      </div>

      <h3 class="text-lg mb-1 mt-0">{{ $t('settings.userInterface') }}</h3>
      <p class="text-xs">{{ $t('settings.userInterfaceDescription') }}</p>

      <div class="form-control mb-2">
        <label>{{ $t('settings.enableDarkTheme') }}</label>
        <ThemeSwitch />
      </div>

      <div class="form-control">
        <label>{{ $t('settings.changeLanguage') }}</label>
        <LocaleSwitch />
      </div>

      <div v-if="authStore.isAuthenticated">
        <h3 class="mt-4">{{ $t('settings.profile') }}</h3>
        <p>{{ $t('settings.profileDescription') }}</p>

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
