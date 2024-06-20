<template>
  <v-list-item title="Twitter" class="py-3">
    <template v-slot:prepend>
      <v-avatar>
        <v-img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="twitter"></v-img>
      </v-avatar>
    </template>

    <template v-slot:append>
      <!-- <v-btn icon="mdi-connection" variant="text"></v-btn> -->
      <v-btn @click="showDialog = true" variant="text" :disabled="isConnected">{{ isConnected ? 'Conectado' : 'Conectar' }}</v-btn>
    </template>
  </v-list-item>

  <v-dialog v-model="showDialog" max-width="50%" persistent>
    <v-card>
      <v-card-title>Conexion a Twitter</v-card-title>
      <v-card-text>  
        <template v-if="state == 'initial'">
          Por el momento no es posible conectar tu cuenta de Twitter mediante login, pero puedes subir un archivo con tus datos.
          <v-file-input class="my-6" v-model="selectedFile" label="Archivo de datos" accept="application/zip"/>
          <v-btn @click="uploadFile">Subir</v-btn>
        </template >
        <template v-else-if="state == 'uploadingFile'">
          Cargando archivo, por favor no cierres esta ventana.
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>
        <template v-else-if="state == 'processingFile'">
          Procesando archivo, por favor no cierres esta ventana.
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>
        <template v-else-if="state == 'finished'">
          Conexion finalizada.
        </template>
        
      </v-card-text>

      <v-card-actions  v-if="state == 'initial' || state == 'finished'">
        <v-spacer></v-spacer>
        <v-btn @click="showDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar :timeout="5000" v-model="snackbar.enabled" color="red">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
export default {
  props: {
    isConnected: Boolean,
  },

  data() {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      showDialog: false,
      selectedFile: null as any,
      state: 'initial',
      snackbar: {
        enabled: false,
        text: '',
      },
    }
  },

  methods: {
    async uploadFile() {
      if (!this.selectedFile) {
        return;
      }

      const uploadUrl = 'https://your-upload-url';
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': this.selectedFile.type,
        },
        body: this.selectedFile,
      };

      try {
        this.state = 'uploadingFile';
        const response = await fetch(uploadUrl, options);
        if (!response.ok) {
          throw new Error('Upload failed');
        }

        console.log('Upload successful');

        // Await for processing (wait SQS message)
        this.state = 'processingFile';
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({ ok: true });
          }, 2000);
        });

        this.state = 'finished';

        this.$emit('connected', { provider: 'twitter', file: { date: new Date() } });
      } catch (error) {
        console.error('Error:', error);
        this.state = 'initial';
        this.snackbar = {
          enabled: true,
          text: 'Error al subir el archivo',
        };
      } finally {
        this.selectedFile = null;
      }

      
    },
  },
}
</script>