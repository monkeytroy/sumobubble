<template>
    <AppButton :config="config" class="font-sans text-left" 
      v-if="config && (config?.summary?.enabled || config?.chatbot?.enabled)"
      :style="cssRootString">
    </AppButton>
</template>

<script lang="ts" setup>

  import { ref, onBeforeUnmount } from 'vue';
  import AppButton from '@/components/AppButton.vue'
  import { getSiteConfig } from '@/services/api';
  import { getRGBColor, getAccessibleColor } from '@/services/theme';

  const props = defineProps<{
    site?: string;
    preview?: boolean;
  }>();
  
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

    const res = await getSiteConfig(props.site || "", props.preview);
    if (res) {
      updateConfig(res);      
    }
  }
  
  const updateConfig = async (site: ISite) => {
    config.value = site;

    const primaryColorConfig = config.value?.theme?.primary || '#aaaaff';
    if (primaryColorConfig) { 
      const primaryColor = getRGBColor(primaryColorConfig, "primary");
      const a11yColor = getRGBColor(getAccessibleColor(primaryColorConfig), "a11y");

      cssRootString.value = `${primaryColor} ${a11yColor}`;
    }
  }

  init();

  onBeforeUnmount(() => {
    // Don't leak the global preview-update hook (and avoid clobbering
    // sibling bubbles that might mount on the same page).
    if (props.preview) {
      delete window.onPreviewUpdate;
    }
  });

</script>

<style>
  @import '@/css/index.css';
</style>
<style lang="scss">
  // WYSIWYG-rendered summary content (markdown -> HTML)
  #summaryContent {
    p {
      margin-block-start: 1em !important;
      margin-block-end: 1em !important;
    }

    a { text-decoration: underline; }
    strong { font-weight: bold; }

    h1 { font-size: 2em;    font-weight: bold; margin-block-start: 0.67em; margin-block-end: 0.67em; }
    h2 { font-size: 1.5em;  font-weight: bold; margin-block-start: 0.83em; margin-block-end: 0.83em; }
    h3 { font-size: 1.17em; font-weight: bold; margin-block-start: 1em;    margin-block-end: 1em; }
    h4 { font-size: 1em;    font-weight: bold; margin-block-start: 1.33em; margin-block-end: 1.33em; }
    h5 { font-size: .83em;  font-weight: bold; margin-block-start: 1.67em; margin-block-end: 1.67em; }
    h6 { font-size: .67em;  font-weight: bold; margin-block-start: 2.33em; margin-block-end: 2.33em; }
  }
</style>