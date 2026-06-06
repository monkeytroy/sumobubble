<template>
  <div>

    <p v-if="content" class="text-gray-600 select-none text-xl mb-3">
      {{ content }}
    </p>
        
    <iframe :src="spotlight?.url"
      frameborder="0" 
      class="w-full h-48 mb-8"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen>
    </iframe>
    
  </div>
</template>

<script lang="ts"  setup>

  import { computed } from 'vue';

  const props = defineProps<{ config: ISite }>();
  const spotlight = computed(() => props?.config?.sections.spotlight);
  const content = computed(() => props.config?.sections?.spotlight?.content || '');

</script>
