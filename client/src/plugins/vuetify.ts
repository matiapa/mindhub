/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
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
