<template>
  <div>
    
    <div v-if="config?.button == 'circleRight'"
      class="fixed bottom-6 right-6 z-40 select-none">
      <img src="../assets/i-icon.png" 
        class="w-12 h-12 select-none
          cursor-pointer shadow-sm
          hover:opacity-80 hover:shadow-md
          bg-white rounded-full"
        @click="onClick"/>
    </div>

    <div v-else
      class="fixed bottom-64 -right-0 -rotate-90 origin-bottom-right z-40 select-none">
      <div class="relative select-none px-2 py-1
          cursor-pointer shadow-md
          hover:opacity-90 hover:shadow-md
          rounded-ss-lg rounded-se-lg
          bg-blue-600 text-white border-2 border-gray-500"
        @click="onClick">
        <div class="font-bold text-sm">
          <span v-if="info">Info</span><span v-if="info && chat"> | </span> <span v-if="chat">Chat</span>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 right-0 sm:right-0 z-999 max-w-full sm:max-w-md w-full" 
      :class="open ? 'visible': 'hidden'">

      <div class="rounded-3xl bg-white mx-4
        text-sm ring-1 ring-gray-900/5 flex flex-col shadow-md"
        style="max-height: 90vh !important; min-height: 400px !important;">

        <div class="rounded-t-3xl 
          bg-skin-primary brightness-105 h-full
          text-2xl font-bold select-none">
          <div class="flex justify-between items-center uppercase p-4 "
            :class="getTextColorByBrightness(config?.customer?.theme.primary)">
            {{ config?.title || 'Hello there'}}
            <XCircleIcon class="w-6 h-6 cursor-pointer hover:opacity-70" 
              @click="close">
            </XCircleIcon>
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

            <LowerNavButton @click="page=PAGE.INFO" text="About Us">
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

  import { ref, defineProps, provide, computed, watchEffect } from 'vue';
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

  import { track } from '@/services/metrics';
  
  const enum PAGE {
    INFO = 'info',
    CHAT = 'chat'
  }

  const props = defineProps(['config']);
  const open = ref(false);

  const scrollContainer = ref(null);
  const openedSection = ref('');

  const contactPanelRef = ref(null);
  const spotlightPanelRef = ref(null);
  const infoRequstPanelRef = ref(null);

  const page = ref('');
  const info = ref(false);
  const chat = ref(false);

  watchEffect(() => {
    info.value = !!props.config?.summary.enabled;
    chat.value = !!props.config?.chatbot.enabled;
    page.value = (info && chat) ? PAGE.INFO : (info ? PAGE.INFO : PAGE.CHAT);
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
    
    // event track
    track('SumoBubble Opened');

    open.value = !open.value;
  }

  const close = () => {
    open.value = false;
  }

</script>