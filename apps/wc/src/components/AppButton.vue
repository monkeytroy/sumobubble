<template>
  <div>
    
    <button v-if="config?.button == 'circleRight'"
      ref="launcherCircleRef"
      type="button"
      :aria-label="open ? 'Close chat' : 'Open chat'"
      :aria-expanded="open"
      aria-controls="sumobubble-dialog"
      class="fixed bottom-6 right-6 z-40 select-none p-0 border-0 bg-transparent cursor-pointer"
      @click="onClick">
      <img src="../assets/i-icon.png"
        alt=""
        class="w-12 h-12 select-none
          shadow-sm
          hover:opacity-80 hover:shadow-md
          bg-white rounded-full"/>
    </button>

    <button v-else
      ref="launcherTextRef"
      type="button"
      :aria-label="open ? 'Close chat' : 'Open chat'"
      :aria-expanded="open"
      aria-controls="sumobubble-dialog"
      class="fixed bottom-64 -right-0 -rotate-90 origin-bottom-right z-40 select-none
        p-0 border-0 bg-transparent cursor-pointer"
      @click="onClick">
      <div class="relative select-none px-2 py-1
          shadow-md
          hover:opacity-90 hover:shadow-md
          rounded-ss-lg rounded-se-lg
          bg-blue-600 text-white border-2 border-gray-500">
        <div class="font-bold text-sm">
          <span v-if="info">Info</span><span v-if="info && chat"> | </span> <span v-if="chat">Chat</span>
        </div>
      </div>
    </button>

    <div id="sumobubble-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sumobubble-title"
      :aria-hidden="!open"
      class="fixed bottom-6 right-0 sm:right-0 z-999 max-w-full sm:max-w-md w-full"
      :class="open ? 'visible': 'hidden'">

      <div class="rounded-3xl bg-white mx-4
        text-sm ring-1 ring-gray-900/5 flex flex-col shadow-md"
        style="max-height: 90vh !important; min-height: 400px !important;">

        <div class="rounded-t-3xl 
          bg-skin-primary brightness-105 h-full
          text-2xl font-bold select-none">
          <div class="flex justify-between items-center uppercase p-4"
            :class="getTextColorByBrightness(config?.theme?.primary)">
            <span id="sumobubble-title">{{ config?.title || 'Hello there' }}</span>
            <button ref="closeBtnRef"
              type="button"
              aria-label="Close"
              class="p-0 border-0 bg-transparent cursor-pointer"
              @click="close">
              <XCircleIcon class="w-6 h-6 hover:opacity-70" />
            </button>
          </div>
        </div>

        <div class="px-2 grow rounded-b-3xl overflow-hidden flex flex-col">

          <div class="px-2 overflow-y-auto grow flex flex-col" 
            ref="scrollContainer" v-if="page==PAGE.INFO">

            <div class="mb-4">
              <SummaryPanel :config="config"></SummaryPanel>
            </div>

            <div class="mb-4" v-if="config?.summary?.special">
              <SpecialPanel :config="config"></SpecialPanel>             
            </div>

            <div class="mb-4" v-if="config?.sections?.spotlight?.enabled">
              <SpotlightPanel :config="config"></SpotlightPanel>
            </div>

            <AccordionContent title="Contact us!" 
              scrollItem="contactPanelRef"
              v-if="config?.sections?.contact?.enabled">
              <div ref="contactPanelRef">
                <ContactPanel :config="config"></ContactPanel>
              </div>
            </AccordionContent>

            <AccordionContent title="Request more information" 
              scrollItem="infoRequstPanelRef"
              v-if="config?.sections?.inforequest?.enabled">
              <div ref="infoRequstPanelRef">
                <InfoRequestPanel :config="config"></InfoRequestPanel>
              </div>
            </AccordionContent>

          </div>

          <div class="flex flex-col overflow-hidden my-4 grow" 
            v-if="page==PAGE.CHAT" >
              <Chat :config="config" class="h-full"></Chat>
          </div>

        </div>

        <div class="rounded-b-3xl bg-gray-200 h-full text-2xs font-semibold select-none"
          v-if="showMenu">
          <div class="flex flex-wrap justify-evenly gap-2 uppercase p-2">

            <LowerNavButton @click="page=PAGE.INFO" text="About">
              <InformationCircleIcon class="h-8 w-auto"/>
            </LowerNavButton>            

            <LowerNavButton @click="page=PAGE.CHAT" text="Ask">
              <QuestionMarkCircleIcon class="h-8 w-auto"/>
            </LowerNavButton>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

  import { ref, provide, computed, watch, watchEffect, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { InformationCircleIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline';
  import { getTextColorByBrightness } from '@/services/theme';

  import AccordionContent from '@/components/AccordionContent.vue';
  import SummaryPanel from '@/components/SummaryPanel.vue';
  import SpecialPanel from '@/components/SpecialPanel.vue';
  import ContactPanel from '@/components/ContactPanel.vue';
  import InfoRequestPanel from '@/components/InfoRequestPanel.vue';
  import SpotlightPanel from '@/components/SpotlightPanel.vue';
  import Chat from '@/components/Chat.vue';
  import LowerNavButton from '@/components/LowerNavButton.vue';

  const enum PAGE {
    INFO = 'info',
    CHAT = 'chat'
  }

  const props = defineProps<{ config: ISite }>();
  const open = ref(false);

  const scrollContainer = ref(null);
  const openedSection = ref('');

  const contactPanelRef = ref(null);
  const spotlightPanelRef = ref(null);
  const infoRequstPanelRef = ref(null);

  // A11y: focus management + Escape handling.
  // Only one of the two launchers renders (v-if/v-else), so just one of
  // these refs is non-null at any time.
  const launcherCircleRef = ref<HTMLButtonElement | null>(null);
  const launcherTextRef = ref<HTMLButtonElement | null>(null);
  const closeBtnRef = ref<HTMLButtonElement | null>(null);

  const page = ref('');
  const info = ref(false);
  const chat = ref(false);

  watchEffect(() => {
    info.value = !!props.config?.summary.enabled;
    chat.value = !!props.config?.chatbot.enabled;
    page.value = info.value ? PAGE.INFO : PAGE.CHAT;
  });

  const showMenu = computed(() => {
    // show the menu if we have both info & chat enabled
    return props.config?.summary.enabled && 
      (props.config?.chatbot?.enabled)
  });

  const panelRefs = {
    scrollContainer,
    contactPanelRef,
    spotlightPanelRef,
    infoRequstPanelRef
  }

  provide('openedSection', openedSection);

  provide('panelRefs', panelRefs);

  const onClick = () => {
    open.value = !open.value;
  }

  const close = () => {
    open.value = false;
  }

  // Move focus into the dialog when it opens; restore focus to the
  // launcher that triggered it when it closes (either via the X or via
  // Escape). Standard dialog UX.
  watch(open, async (isOpen) => {
    await nextTick();
    if (isOpen) {
      closeBtnRef.value?.focus();
    } else {
      (launcherCircleRef.value ?? launcherTextRef.value)?.focus();
    }
  });

  // Escape closes the dialog when it's open. Listener is document-level
  // (cleaner than focus-trapping inside the bubble — the bubble overlays
  // a host page and we don't want to steal the user's tab focus).
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open.value) {
      close();
    }
  };

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

</script>