<template>
    <AppButton :config="config" class="font-sans text-left" 
      v-if="config && (config?.summary?.enabled || (config?.chatbot?.enabled && config?.chatbot?.chatbaseId))"
      :style="cssRootString">
    </AppButton>
</template>

<script lang="ts" setup>

  import { ref, defineProps } from 'vue';
  import AppButton from '@/components/AppButton.vue'
  import { getSiteConfig } from '@/services/api';
  import { getRGBColor, getAccessibleColor } from '@/services/theme';
  import { metricsInit, track } from '@/services/metrics';

  const props = defineProps({
    site: String,
    preview: Boolean,
  });
  
  // custom dynamic theme for TW
  const config = ref<ISite>();
  const cssRootString = ref('--color-primary: 200 200 250');

  const init = async () => {
    
    if (props.preview) {
      // setup handler to update config.
      window.onPreviewUpdate = (val: ISite) => {
        updateConfig(val);
      }
    }

    const res = await getSiteConfig(props.site, props.preview);
    if (res) {
      updateConfig(res);      
    }
  }
  
  const updateConfig = async (site: ISite) => {
    config.value = site;

    const customerId = config.value.customerId;
    await metricsInit(customerId, config.value?.isDev || false);

    track('Config Loaded');

    // event log config loaded.
    const primaryColorConfig = config.value?.theme?.primary || '#aaaaff';
    if (primaryColorConfig) { 
      const primaryColor = getRGBColor(primaryColorConfig, "primary");
      const a11yColor = getRGBColor(getAccessibleColor(primaryColorConfig), "a11y");

      cssRootString.value = `${primaryColor} ${a11yColor}`;
    }
  }

  init();
  
</script>

<style>
  @import '@/css/index.css';
</style>
<style lang="scss">
  @import '@/css/summary.scss';
</style>