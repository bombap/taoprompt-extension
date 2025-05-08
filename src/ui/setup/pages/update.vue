<script setup lang="ts">
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
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center text-center"
  >
  <img src="@assets/logo.png" alt="logo" class="h-20 w-auto mt-0 shadow-lg rounded-xl" />
    <h1 class="mb-1">Updated!</h1>
    <h2 class="mt-0 mb-4">{{ displayName }}</h2>
    <p>
      New Version: {{ version }}
    </p>
    

    <div  class="flex gap-4 ">
      <UButton @click="openWeb" variant="soft"
        class="flex items-center justify-center px-4 py-3 text-lg rounded-xl cursor-pointer backdrop-blur-sm">
        TaoPrompt.com
      </UButton>
      <UButton @click="openExtension" class="flex items-center justify-center px-4 py-3 text-lg rounded-xl cursor-pointer">
        Open Extension
      </UButton>
    </div>

  

    <hr />
  </div>
</template>
