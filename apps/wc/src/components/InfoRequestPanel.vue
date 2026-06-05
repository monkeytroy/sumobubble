<template>
  <div>
    <p v-if="content" class="text-gray-600 select-none text-xl mb-3">
      {{ content }}
    </p>

    <form ref="formRef" @submit.prevent="submitClick" class="mx-auto text-xl">
      <div class="grid grid-cols-1 gap-y-2 gap-x-8 sm:grid-cols-2">
        <div class="col-span-2">
          <label for="full-name" 
            class="block text-sm font-semibold leading-6 text-gray-900 select-none">Full name</label>
          <div class="mt-1">
            <input type="text" name="first-name" id="first-name"
              autocomplete="given-name" 
              ref="nameInputRef" v-model="nameInput" required
              class="block w-full py-1.5 px-3.5  
                text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6
                rounded-md border border-slate-300
                focus:outline-none focus:border-skin-primary
                focus:ring-1 focus:ring-skin-primary focus:ring-opacity-50
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                invalid:text-red-600" />
          </div>
        </div>
        <div class="col-span-2">
          <label for="email" class="block text-sm font-semibold leading-6 text-gray-900 select-none">Email</label>
          <div class="mt-1">
            <input type="email" name="email" id="email" autocomplete="email" 
              ref="emailInputRef" v-model="emailInput" required
              class="block w-full py-1.5 px-3.5  
                text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6
                rounded-md border border-slate-300
                focus:outline-none focus:border-skin-primary
                focus:ring-1 focus:ring-skin-primary focus:ring-opacity-50
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                invalid:text-red-600" />
          </div>
        </div>
        <div class="col-span-2">
          <label for="message" class="block text-sm font-semibold leading-6 text-gray-900 select-none">Request</label>
          <div class="mt-1">
            <textarea name="message" id="message" rows="3" minlength="4" 
              ref="messageInputRef" v-model="messageInput" required
              class="block w-full py-1.5 px-3.5  
                text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6
                rounded-md border border-slate-300
                focus:outline-none focus:border-skin-primary
                focus:ring-1 focus:ring-skin-primary focus:ring-opacity-50
                disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                invalid:text-red-600"/>
          </div>
        </div>

        <CatSelect :categories="categories" @selected-cateogry="onSelectedCategory"
          v-if="categories.length > 1">
        </CatSelect>

      </div>
      <div class="mt-4">
        <div class="mb-4 bg-red-100 border-t border-b border-red-500 text-red-700 px-4 py-3" role="alert"
          v-if="submitFail">
          <p class="text-sm"><span class="font-bold">Oh no!</span>Something went wrong.  Try again please.</p>
        </div>

        <div class="mb-4 bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert"
          v-if="submitSuccess">
          <p class="text-sm"><span class="font-bold">Message Sent</span> Someone will get back to you shortly!  Thanks!</p>
        </div>
      </div>
      <div class="flex">

        <button type="submit" 
          class="rounded-md grow mr-4
          bg-skin-primary opacity-90 hover:bg-opacity-80 px-3.5 py-2.5 
          text-center text-sm font-semibold shadow-sm
          focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-2 
          focus-visible:outline-skin-primary"
          :class="getTextColorByBrightness(config?.customer?.theme.primary)">
          Send
        </button>

        <div class="text-xs w-1/2 text-gray-500">
          Protected by reCAPTCHA - The Google
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and
            <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </div>

      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>

  import { ref, defineProps, computed, onMounted } from 'vue';
  import { sendContact } from '@/services/api';
  import CatSelect from './CatSelect.vue';
  import { getTextColorByBrightness } from '@/services/theme';

  interface IContactCategory {
    title: string,
    email: string
  }

  // todo options for loading this
  const CAPTCHA_KEY = '6LdHNPIkAAAAAHi7HsTDq-RFRKGFMwt6ZOWSFEGn';
  const props = defineProps(['config']);
  const section = props.config?.sections?.inforequest;
  const content = computed(() => section?.content || '');

  const categories = computed(() => {
    
    const cats: Array<IContactCategory> = section?.props?.categories || [];
    return [
      {
        title: 'General',
        email: section?.props?.email
      },
      ...cats
    ]
  });

  const nameInput = ref();
  const emailInput = ref();
  const messageInput = ref();
  const formRef = ref();
  const messageInputRef = ref();
  const submitSuccess = ref(false);
  const submitFail = ref(false);
  const selectedCategory = ref('');

  const onSelectedCategory = (cat: string) => {
    selectedCategory.value = cat;
  }

  /**
   * Load the recaptcha script and insert it in doc
   */
  const setupRecaptcha = async () => {
      // todo check if recaptchaV2 already exists...
      if (!document.querySelector('#recaptchaV3')) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=' + CAPTCHA_KEY;
        script.id = 'recaptchaV3';
        document.head.appendChild(script);
      }
  }

  onMounted(async () => {
    await setupRecaptcha();
  });

  const submitClick = async (e: Event) => {

    const token = await window.grecaptcha.execute(CAPTCHA_KEY, { action: 'submit' });  

    submitSuccess.value = false;
    submitFail.value = false;

    const success = await sendContact({
      section: 'inforequest',
      token,
      contactInfo: {
        category: selectedCategory.value,
        email: emailInput.value,
        name: nameInput.value,      
        message: messageInput.value,
      }
    });

    if (success) {
      submitSuccess.value = true;
      emailInput.value = '';
      nameInput.value = '';
      messageInput.value = '';
      formRef.value.reset();

      setTimeout(() => {
        submitSuccess.value = false;
      }, 5000);

    } else {
      submitFail.value = true;

      setTimeout(() => {
        submitFail.value = false;
      }, 5000);
    }

  }

</script>

<style>
  .grecaptcha-badge { 
    opacity: 0;
    visibility: hidden;
  }
</style>