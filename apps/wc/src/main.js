import { defineCustomElement } from 'vue'
import App from '@/App.ce.vue'

const SumoBubbleWc = defineCustomElement(App)
customElements.define('sumobubble-wc', SumoBubbleWc)