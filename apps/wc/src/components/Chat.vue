<template>
  <div class="flex flex-col gap-6 overflow-hidden grow">

    <div class="grow flex flex-col gap-4 px-4 overflow-y-auto">

      <div v-for="(chat, index) in chats" :key="index" 
        :class="[ chat.user == 'AI' ? 
          'flex justify-start' : 
          'flex justify-end' ]">
        <div class="flex flex-col gap-0.5 py-2 px-4 rounded-md shadow-md w-auto" 
          :class="[ chat.user == 'AI' ? 
            'bg-green-300' : 
            'bg-blue-200' ]">
          <div class="text-sm text-gray-600">
            {{ chat.user }}
          </div>
          <div class="text-gray-800">
            {{ chat.text }}
          </div>
        </div>
      </div>
      <div ref="scrollToTargetRef" id="fred" class=""></div>
    </div>

    <div class="flex flex-col">
      <div v-if="thinking">
        <svg xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink" 
        style="margin: auto; 
        display: block;" width="34px" height="34px" 
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="translate(25 50)">
        <circle cx="0" cy="0" r="12" fill="#292664">
          <animateTransform attributeName="transform" type="scale" begin="-0.3333333333333333s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
        </circle>
        </g><g transform="translate(50 50)">
        <circle cx="0" cy="0" r="12" fill="#667395">
          <animateTransform attributeName="transform" type="scale" begin="-0.16666666666666666s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
        </circle>
        </g><g transform="translate(75 50)">
        <circle cx="0" cy="0" r="12" fill="#94a9ce">
          <animateTransform attributeName="transform" type="scale" begin="0s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
        </circle>
        </g>
        </svg>
      </div>

      <input type="text"
        v-model="chatValue"
        ref="chatRef"
        @keyup.enter="onChatEnter"
        class="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm 
          ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
          focus:ring-2 focus:ring-inset focus:ring-blue-600 
          sm:text-sm sm:leading-6"
        placeholder="Ask a question..."/>
    </div>
    
  </div>
</template>

<script lang="ts" setup>

  import { IChat, sendChat } from '@/services/api';
  import { Ref, defineProps, nextTick, ref } from 'vue';
  
  const props = defineProps(['config']);
  const chatRef = ref<HTMLInputElement | null>(null);
  const chatValue = ref('');
  const thinking = ref(false);
  const scrollToTargetRef = ref<HTMLElement>();

  const chats: Ref<Array<IChat>> = ref([
    {
      text: 'Hello! How can I help you today?',
      user: 'AI'
    }
  ]);

  const onChatEnter = async () => {
    
    const v = chatValue.value;
    chatValue.value = '';

    if (v) {
      console.log('Chatting...');  

      chats.value.push({
        user: 'User',
        text: v
      });

      nextTick(scrollTo);

      sendQuery(v);
    }
  }

  const sendQuery = async (query: string) => {

    const siteId = props.config?._id;

    thinking.value = true;
    const res = await sendChat(siteId, query);

    if (res?.success) {
      chats.value.push({
        user: 'AI',
        text: res.message
      });
    }

    thinking.value = false;

    nextTick(scrollTo);
  }

  const scrollTo = () => {
    scrollToTargetRef.value?.scrollIntoView({behavior: 'smooth'});
  }

</script>