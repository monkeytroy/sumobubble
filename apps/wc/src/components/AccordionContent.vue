<template>
  <div class="border-t border-gray-900">
    <Disclosure as="div" class="py-6 px-4" v-slot="{ open }" :defaultOpen=defaultOpen>
      <DisclosureButton class="flex w-full items-start justify-between text-left text-gray-900">
        <span class="text-base font-semibold leading-7">{{title || 'More'}}</span>
        <span class="ml-6 flex h-7 items-center">
          <PlusIcon v-if="!open" class="h-6 w-6" aria-hidden="true" @click="onClick"/>
          <MinusIcon v-else class="h-6 w-6" aria-hidden="true" />
        </span>
      </DisclosureButton>
      <DisclosurePanel as="div" className="mt-4">
        <div ref="contentRef">
          <slot :isContainerOpen="isOpen"></slot>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script lang="ts" setup>

  import { defineProps, inject, nextTick, Ref, ref, watch } from 'vue';
  import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
  import { track } from '@/services/metrics';
  import { scrollContent } from '@/services/scroll';
  import { MinusIcon, PlusIcon } from '@heroicons/vue/20/solid';

  const props = defineProps(['title', 'defaultOpen', 'config', 'scrollItem']);
  const isOpen = ref(props.defaultOpen);
  const contentRef = ref(null);

  // used to do scrolling.
  const panelsRefs = inject('panelRefs');

  // inject the opened section
  const openedSection:any = inject('openedSection');

  // watch for changes to it so only one opened at a time.
  watch(openedSection, () => {
    if (openedSection.value != props.title) {
      isOpen.value = false;
    }
  });

  const onClick = () => {
  
    if (!isOpen.value) {

      track('Panel Open', {
        appPanel: props.title
      });

      // set the opened section.
      // will trigger the watch above and close other sections.
      openedSection.value = props.title;

      // event the panel is open.
      nextTick(() => {
        setTimeout(() => {
          scrollContent(props.scrollItem, panelsRefs);
        },10);
      });
      
    }

    isOpen.value = !isOpen.value;
  }

</script>