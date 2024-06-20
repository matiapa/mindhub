import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#000000',
            secondary: '#da0000',
            accent: '#da0000',
            surface: '#FFFFFF',
            background: '#e9e9e9',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#000000',
            secondary: '#da0000',
            accent: '#da0000',
            surface: '#262626',
            background: '#434343',
          },
        },
      },
    },
  })

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
