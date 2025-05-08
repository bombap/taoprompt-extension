<template>
  <div class="w-full h-full flex flex-col justify-center items-center text-center">
    <img src="@assets/logo.png" alt="logo" class="h-20 w-auto mt-0 shadow-lg rounded-xl" />
    <div>
      <h1 class="mb-1">{{ isUpdate ? `Updated ${version}` : 'Installed' }}</h1>
      <h2 class="mt-0">{{ displayName }}</h2>
    </div>
    <!-- <p>
      Thank you for installing {{ displayName }}! ❤️
      <br />
      Now you can close this tab and start using the extension.
    </p> -->

    <div class="max-w-xl mx-auto mb-12">
      <div class="p-4 bg-gray-100 dark:bg-black rounded-xl mb-3">
        {{ $t('setup.thankYou') }}
      </div>
    </div>

    <div  class="flex gap-4 ">
      <UButton @click="openWeb" variant="soft"
        class="flex items-center justify-center px-4 py-3 text-lg rounded-xl cursor-pointer backdrop-blur-sm">
        TaoPrompt.com
      </UButton>
      <UButton @click="openExtension" class="flex items-center justify-center px-4 py-3 text-lg rounded-xl cursor-pointer">
        Open Extension
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { baseUrl } from '@/const'


const displayName = __DISPLAY_NAME__
const version = __VERSION__
function openWeb() {
  location.href = `${baseUrl}`
}

function openExtension() {
  chrome.action.openPopup()
  window.close()
}

const isUpdate = window.location.hash === "#/setup/update"

onMounted(() => {
  console.log("isUpdate", isUpdate)
})

</script>

<style lang="scss" scoped></style>
