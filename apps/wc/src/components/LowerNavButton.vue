<template>
  <div class="group cursor-pointer drop-shadow-md hover:underline hover:brightness-50
      flex flex-col gap-0 items-center text-gray-500" 
      @click="emit('click')">

    <div class="p-1 bg-transparent border-transparent rounded-full border-2 hover:drop-shadow-lg">
      <slot></slot>
    </div>
    <span class="">{{text}}</span>
  </div>
</template>

<script lang="ts" setup>

  import { defineProps, defineEmits } from 'vue';

  const props = defineProps(['icon', 'text']);
  const emit = defineEmits(['click']);

</script>