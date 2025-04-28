<template>
  <div class="w-full h-[100dvh] flex flex-col justify-center items-center text-center">
    <img src="@assets/logo.png" alt="logo" class="h-20 w-auto mt-0" />
    <div>
      <h1 class="mb-1">🎉 Installed! 🚀</h1>
      <h2 class="mt-0">{{ displayName }}</h2>
    </div>
    <!-- <p>
      Thank you for installing {{ displayName }}! ❤️
      <br />
      Now you can close this tab and start using the extension.
    </p> -->

    <div class="max-w-xl mx-auto mb-12">
      <div class="p-4 bg-gray-100 rounded-xl mb-3">
        Cảm ơn bạn đã tải Taoprompt Extension! Chúng tôi rất vui khi bạn sử dụng và hy vọng nó sẽ giúp ích cho công việc
        của bạn.
      </div>
      <div class="p-4 bg-gray-100 rounded-xl">
        Thank you for downloading the Taoprompt Extension! We're excited to have you onboard and hope it helps improve
        your workflow.
      </div>
    </div>

    <div  class="flex gap-4 ">
      <UButton @click="openWeb" variant="soft"
        class="flex items-center justify-center px-4 py-3 text-lg rounded-xl cursor-pointer">
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
// const version = __VERSION__
function openWeb() {
  location.href = `${baseUrl}`
}

function openExtension() {
  chrome.action.openPopup()
  window.close()
}

</script>

<style lang="scss" scoped></style>
