<template>
    <v-bottom-sheet v-model="shown">
      <v-card>
        <v-card-item>
          <p>¿Desearías instalar la aplicación en tu dispositivo?</p>
        </v-card-item>
        <v-card-actions>
          <v-btn @click="installPWA" color="primary">Instalar</v-btn>
          <v-btn @click="dismissPrompt" color="error">No, gracias</v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </template>
  
  <script lang="ts">
  export default {
    data: () => ({
      shown: false,
      installEvent: null as any,
    }),
  
    beforeMount() {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installEvent = e
        this.shown = true
      })
    },
  
    methods: {
      dismissPrompt() {
        this.shown = false
      },
  
      installPWA() {
        this.installEvent.prompt()
        this.installEvent.userChoice.then((choice: any) => {
          this.dismissPrompt() // Hide the prompt once the user's clicked
          if (choice.outcome === 'accepted') {
            // Do something additional if the user chose to install
          } else {
            // Do something additional if the user declined
          }
        })
      },
    }
  }
  </script>