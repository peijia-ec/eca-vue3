import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

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

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f4f3ff',
      100: '#ece9fe',
      200: '#dbd5ff',
      300: '#bfb4fe',
      400: '#a089fc',
      500: '#825af8',
      600: '#7237f0',
      700: '#6123d9',
      800: '#521fb8',
      900: '#461b97',
      950: '#2a0f66'
    }
  }
})

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
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
