<script setup lang="ts">
import { baseUrl } from "@/const";

const optionsStore = useOptionsStore()
// const { toggleDark } = optionsStore
const { isDark, profile, others } = storeToRefs(optionsStore)
const authStore = useAuthStore()

function openProfile() {
  window.open(`${baseUrl}/settings/`, "_blank");
}

const router = useRouter()
function logout() {
  authStore.logout()
  router.back()
}
</script>

<template>
  <div class="p-4 max-w-[384px] w-full mx-auto">
    <RouterLinkUp />
    <div
      class="max-w-xl w-full mx-auto rounded-xl md:my-12 p-4 md:p-8 md:border border-base-200 md:shadow-lg bg-base-100 dark:bg-stone-800">

      <h1 class="text-2xl">{{ $t('settings.title') }}</h1>
      <!-- <p>
      You can configure various options related to this extension here. These
      options/ settings are peristent, available in all contexts, implemented
      using Pinia and useBrowserStorage composable.
    </p> -->

      <h3>{{ $t('settings.userInterface') }}</h3>
      <p>{{ $t('settings.userInterfaceDescription') }}</p>

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
        <UButton  class="animate__fadeInUp animate__animated animate__fast cursor-pointer justify-center" @click="logout" size="xl" block variant="soft">
          {{ $t('settings.logout') }}
        </UButton>
      </div>

    </div>
  </div>
</template>
