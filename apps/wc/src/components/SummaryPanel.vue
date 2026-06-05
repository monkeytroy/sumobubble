<template>
  <div class="flex-col select-none">
    <div id="summaryContent" class="fred text-lg" 
      v-if="content"
      v-html="safeHTML(content)">
    </div>  
    <div v-else class="fred text-lg">
      Welcome! Glad you could stop by.
    </div>
    <div class=""></div>
  </div>
</template>

<script lang="ts" setup>

  import { defineProps, computed } from 'vue';
  import VueSecureHTML from 'vue-html-secure';

  const props = defineProps(['config']);

  const safeHTML = VueSecureHTML.safeHTML;
  
  const content = computed(() => props.config?.summary?.content || '');

</script>
