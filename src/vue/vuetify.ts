import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
      elevation: 3,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: true,
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: true,
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: true,
      chips: true,
      closableChips: true,
    },
    VDialog: {
      scrim: true,
    },
  },
  theme: {
    defaultTheme: 'efsDark',
    themes: {
      efsLight: {
        dark: false,
        colors: {
          background: '#f4f7fb',
          surface: '#ffffff',
          primary: '#1976d2',
          secondary: '#455a64',
          error: '#d32f2f',
          info: '#0288d1',
          success: '#2e7d32',
          warning: '#ed6c02',
        },
      },
      efsDark: {
        dark: true,
        colors: {
          background: '#0f172a',
          surface: '#111827',
          primary: '#90caf9',
          secondary: '#78909c',
          error: '#ef5350',
          info: '#29b6f6',
          success: '#66bb6a',
          warning: '#ffa726',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})
