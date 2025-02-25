import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import store from './store'
import GoogleAuth from './auth/goauthWrapper.js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import local from '@/localisation'
import { Role } from '@/role'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const app = createApp(App)

const head = createHead()
app.use(head)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: "primevue",
        order: "base, primevue",
      },
      darkModeSelector: '.app-dark',
    },
  },
})

const gauthOption = {
  clientId: import.meta.env.VITE_GO_CLIENT_ID,
  scope: 'profile email',
  prompt: 'select_account'
}
app.use(GoogleAuth, gauthOption)
app.use(createPinia())
app.use(router)
app.use(store)

app.config.globalProperties.$moment = dayjs
app.config.globalProperties.$local = local
app.config.globalProperties.$roles = Role

app.provide('$moment', dayjs)
app.provide('$local', local)
app.provide('$roles', Role)

app.mount('#app')
