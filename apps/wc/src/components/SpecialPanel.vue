<template>
  <div v-if="content" class="">
    <div class="rounded-md bg-blue-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div class="ml-3 flex-1 md:flex md:justify-between">
          <p class="text-sm text-blue-700">Special Announcement!</p>
        </div>
      </div>
    </div>
    <Markdown :source="content" class="text-lg p-4"></Markdown>
  </div>
</template>

<script lang="ts" setup>
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';
  import { defineProps, computed } from 'vue';
  import Markdown from '@/components/Markdown.vue';
  
  const props = defineProps(['config', 'scrollContainer']);
  const content = computed(() => props.config?.summary?.special || '');

</script>
