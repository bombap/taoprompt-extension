<script setup lang="ts">
import { baseUrl } from "@/const"
import { getModelList } from "src/const.models"
import { TAOPROMPT_EVENTS } from "src/const.events"
const { t } = useI18n()

const version = __VERSION__

const authStore = useAuthStore()

const loading = ref(true)

function openProfile() {
  window.open(`${baseUrl}/settings/`, "_blank")
}

const router = useRouter()
function logout() {
  authStore.logout()
  router.back()
}

const prompt = ref({
  language: "English",
  model: "anthropic/claude-3.5-haiku",
  interface: true,
})

const allModels = computed(() => {
  return getModelList(
    authStore.config.promptModels.free,
    authStore.config.promptModels.paid,
  )
})

const currentModelAI = computed(() => {
  return allModels.value.find(
    (model) => model.value === prompt.value.model
  );
});

watch(currentModelAI, () => {
  const contain = allModels.value.find(
    (model) => model.value === prompt.value.model
  )
  if (!contain) {
    prompt.value.model = allModels.value[0].value
  }
})

watch(
  () => prompt.value.model,
  () => {
    if (
      authStore.isFreePlan &&
      currentModelAI.value?.isPro
    ) {
      toast.add({
        title: "Warning",
        description: t("model-warning"),
        color: "warning",
      });

      prompt.value.model = allModels.value[0].value;
    }
  }
);

const LANGUAGES: Record<string, { name: string; charset: string }> = {
  vi: {
    name: "Tiếng Việt",
    charset: "UTF-8",
  },
  en: {
    name: "English",
    charset: "UTF-8",
  },
  fr: {
    name: "Français",
    charset: "UTF-8",
  },
  es: {
    name: "Español",
    charset: "UTF-8",
  },
  de: {
    name: "Deutsch",
    charset: "UTF-8",
  },
  "zh-Hans": {
    name: "简体中文",
    charset: "UTF-8",
  },
  "zh-Hant": {
    name: "繁體中文",
    charset: "UTF-8",
  },
  ja: {
    name: "日本語",
    charset: "UTF-8",
  },
  ko: {
    name: "한국어",
    charset: "UTF-8",
  },
  ru: {
    name: "Русский",
    charset: "UTF-8",
  },
  pt: {
    name: "Português",
    charset: "UTF-8",
  },
  ar: {
    name: "العربية",
    charset: "UTF-8",
  },
  hi: {
    name: "हिन्दी",
    charset: "UTF-8",
  },
  th: {
    name: "ไทย",
    charset: "UTF-8",
  },
  it: {
    name: "Italiano",
    charset: "UTF-8",
  },
}
const languages = Object.keys(LANGUAGES).map((key) => ({
  code: key,
  value: LANGUAGES[key].name,
  label: LANGUAGES[key].name,
}))

function changeSettingsHandle() {
  sendToBackground({
    type: TAOPROMPT_EVENTS.SETTINGS_UPDATE,
    data: {
      language_output: prompt.value.language,
      interface: prompt.value.interface,
      model: prompt.value.model,
    },
  })
}

onMounted(() => {
  loading.value = true
  chrome.storage.local.get(["language_output", "interface", "model"], (result) => {
    prompt.value.language = result.language_output || "English"
    if (typeof result.interface === "boolean") {
      prompt.value.interface = result.interface
    } else {
      prompt.value.interface = true
    }
    if (result.model) {
      prompt.value.model = result.model
    }
    loading.value = false
  })
})
</script>

<template>
  <div class="p-4 max-w-[480px] w-full mx-auto">
    <RouterLinkUp />
    <div
      class="max-w-xl w-full mx-auto rounded-xl p-4 md:border border-base-200 md:shadow-lg bg-base-100 dark:bg-gray-800"
    >
      <h3 class="text-lg mb-1 mt-3">{{ $t("settings.promptGeneration") }}</h3>
      <p class="text-xs">{{ $t("settings.promptGenerationDescription") }}</p>

      <div class="flex flex-col gap-3">
        <UFormField
          :label="$t('model-select')"
          name="model"
          class="flex-1"
        >
          <USelectMenu
            v-model="prompt.model"
            :items="
              allModels.map((item) => ({
                ...item,
                disabled: authStore.isFreePlan && item.isPro,
              }))
            "
            value-key="value"
            size="xl"
            variant="soft"
            :ui="{
              base: `w-full bg-white dark:bg-gray-900 hover:!bg-gray-200 dark:hover:!bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800 border-[.5px] border-gray-300 dark:border-gray-700`,
            }"
            :placeholder="$t('model-select')"
            class="cursor-pointer w-[200px] flex-1"
             @change="changeSettingsHandle"
          >
            <div
              v-if="currentModelAI"
              class="flex items-center gap-2"
            >
              {{ currentModelAI.name }}

              <UBadge
                v-if="currentModelAI.isPro"
                class="bg-orange-500/10 text-orange-500"
              >
                Pro
              </UBadge>
            </div>
            <template #item-trailing="{ item }">
              <UBadge
                v-if="item.isPro"
                class="bg-orange-500/10 text-orange-500"
              >
                Pro
              </UBadge>
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          :label="$t('result-language')"
          name="language"
        >
          <USelectMenu
            v-model="prompt.language"
            :items="languages"
            value-key="value"
            size="xl"
            variant="soft"
            :ui="{
              base: `w-full bg-white dark:bg-gray-800 hover:!bg-gray-200 dark:hover:!bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800 border-[.5px] border-gray-300 dark:border-gray-600`,
            }"
            class="cursor-pointer w-[200px] flex-1"
            @change="changeSettingsHandle"
          ></USelectMenu>
        </UFormField>
      </div>

      <div class="py-6">
        <USeparator />
      </div>

      <h3 class="text-lg mb-1 mt-0">{{ $t("settings.userInterface") }}</h3>
      <p class="text-xs">{{ $t("settings.userInterfaceDescription") }}</p>

      <div
        v-if="!loading"
        class="mt-4"
      >
        <UFormField
          :label="$t('settings.hideGenerateButton')"
          name="hideGenerateButton"
        >
          <div class="flex items-center gap-2">
            <USwitch
              v-model="prompt.interface"
              @change="changeSettingsHandle"
            />
            <span class="text-xs">
              {{ $t("settings.hideGenerateButtonDescription") }}
            </span>
          </div>
        </UFormField>
      </div>

      <div class="mt-4">
        <UFormField
          :label="$t('settings.enableDarkTheme')"
          name="darkTheme"
        >
          <ThemeSwitch />
        </UFormField>
      </div>

      <div class="mt-4">
        <UFormField
          :label="$t('settings.changeLanguage')"
          name="language"
        >
          <LocaleSwitch />
        </UFormField>
      </div>

      <div v-if="authStore.isAuthenticated">
        <h3 class="mt-4 mb-0">{{ $t("settings.profile") }}</h3>
        <p class="text-xs">{{ $t("settings.profileDescription") }}</p>

        <UButton
          @click="openProfile()"
          class="mb-4 cursor-pointer"
        >
          <UIcon
            name="i-ph-user"
            class="size-5"
          />
          {{ $t("settings.updateProfile") }}
        </UButton>
        <UButton
          class="animate__fadeInUp animate__animated animate__fast cursor-pointer justify-center"
          @click="logout"
          size="xl"
          block
          variant="soft"
        >
          {{ $t("settings.logout") }}
        </UButton>
      </div>
    </div>

    <div class="text-xs text-center text-gray-500">
      <p>TaoPrompt.com v{{ version }}</p>
    </div>
  </div>
</template>
