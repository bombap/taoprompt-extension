<template>
    <div v-if="props.tabs.length" :class="cn('relative', props.class)"
        style="filter: url(&quot;#exclusionTabsGoo&quot;) drop-shadow(0px 0px 6px rgba(0,0,0,.1)) drop-shadow(0px 0px 1px rgba(0,0,0,.15))"
        @click="updateActive('')" @mouseover="updateActive('|')" @mouseout="updateActive('')">
        <button v-for="tab in props.tabs" :key="tab"
            @click="openHandle(tab)"
            :class="cn('px-3 h-10 bg-white  text-black transition-all duration-500 cursor-pointer')" :style="{
                margin: `0 ${activeTab === tab ? props.margin : 0}px`,
            }">
            <img v-if="tab === '@'" src="@assets/logo-symbol-dark.svg" width="18">
            <div v-else style="height: 36px"></div>
        </button>

        <div class="absolute w-full">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="exclusionTabsGoo" x="-50%" y="-50%" width="200%" height="200%"
                        color-interpolation-filters="sRGB">
                        <feGaussianBlur in="SourceGraphic" :stdDeviation="blurStdDeviation" result="blur">
                        </feGaussianBlur>
                        <feColorMatrix in="blur" type="matrix" values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 36 -12" result="goo"></feColorMatrix>
                        <feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite>
                    </filter>
                </defs>
            </svg>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface Props {
    tabs: string[];
    margin?: number;
    class?: string;
    blurStdDeviation?: number;
}

const props = withDefaults(defineProps<Props>(), {
    margin: 20,
    blurStdDeviation: 6,
});

const emit = defineEmits(['open'])


const activeTab = ref('');

function updateActive(tab: string) {
    activeTab.value = tab


}

function openHandle(tab: string) {
    if(tab === '@') {
        emit('open')
    }
}
</script>

<style></style>