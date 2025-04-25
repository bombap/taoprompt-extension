<template>
    <button class="taoprompt-generate-button" type="button" :disabled="isThinking || isGenerating"
    :class="{ 'isLoading': isThinking || isGenerating }"
    >
        <span v-if="isThinking || isGenerating" v-html="loading_icon"></span>
        <span v-else v-html="mingcute_ai_fill"></span>

        <span v-if="isThinking" class="font-semibold">Thinking...</span>
        <span v-else-if="isGenerating" class="font-semibold">Generating...</span>
        <span v-else class="font-semibold">Generate Prompt</span>
    </button>
</template>

<script lang="ts" setup>
import { loading_icon, mingcute_ai_fill } from '@/const';


defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    isThinking: {
        type: Boolean,
        default: false
    },
    isGenerating: {
        type: Boolean,
        default: false
    }
})

</script>