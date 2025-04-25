<script setup lang="ts">
import { Notivue, Notification } from 'notivue'
</script>

<template>
  <div>
    <UApp>
    <!-- <AppHeader /> -->

      <div class="w-full p-4 prose">
        <RouterView />
      </div>
      
      <AppFooter />
      
      <Notivue v-slot="item">
        <Notification :item="item" />
      </Notivue>
    </UApp>
  </div>
</template>

<style lang="scss"></style>
