import { createApp } from 'vue'
import store, { vuexStoreKey } from './store'
import App from './App.vue'

const app = createApp(App)

app
  .use(store, vuexStoreKey)

app.mount('#app')
