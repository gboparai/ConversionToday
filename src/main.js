import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import VueGtag from "vue-gtag"
import { createMetaManager, defaultConfig } from 'vue-meta'

createApp(App).use(createMetaManager(false, {
  ...defaultConfig,
  meta: { tag: 'meta', nameless: true }
}
)).use(store).use(router).use(VueGtag, {
  appName: 'No Limit Converter',
  pageTrackerScreenviewEnabled: true,
  config: {
    id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID,
  },
}, router).mount('#app');