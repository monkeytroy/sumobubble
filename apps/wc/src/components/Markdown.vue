<template>
  <div v-html="markdownAsHtml"></div>
</template>

<script lang="ts" setup>

  import { defineProps, computed } from 'vue';
  import marked from 'markdown-it';
  import markedSup from 'markdown-it-sup';
  
  const props = defineProps(['source']);
  
  const markdownIt = marked();
  markdownIt.use(markedSup);
  
  const markdownAsHtml = computed(() => {
    return markdownIt.render(props?.source || '');
  });

</script>
