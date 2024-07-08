import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MindHub',
        short_name: 'MindHub',
        theme_color: '#000000',
        background_color: '#e9e9e9',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'src/assets/person-light.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // https: {
    //   key: fs.readFileSync('./certs/key.pem'),
    //   cert: fs.readFileSync('./certs/cert.pem'),
    // },
    host: '0.0.0.0',
    port: 8000,
  },
})
