<template>
  <v-list-item title="Twitter" class="py-3">
    <template v-slot:prepend>
      <v-avatar>
        <v-img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="twitter"></v-img>
      </v-avatar>
    </template>

    <template v-slot:append>
      <v-btn @click="openDialog" variant="text">
        {{ getButtonLabel() }}
      </v-btn>
    </template>
  </v-list-item>

  <v-dialog v-model="showDialog" max-width="50%" persistent>
    <v-card>
      <v-card-title>Conexión a Twitter</v-card-title>

      <v-card-text>  
        <template v-if="state == 'initial'">
          Por el momento no es posible conectar tu cuenta de Twitter mediante login, pero puedes subir un archivo con tus datos.
          <v-file-input class="my-6" v-model="selectedFile" label="Archivo de datos" accept="application/zip"/>
          <v-btn @click="uploadFile">Subir</v-btn>
        </template >

        <template v-else-if="state == 'uploadingFile'">
          Cargando archivo...
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>

        <template v-else-if="state == 'processingFile'">
          Procesando archivo...
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>

        <template v-else-if="state == 'finished'">
          <p>¡Conexión finalizada! Se han extraído y procesado {{ connection?.lastProcessed?.summary?.texts }} textos.</p>
        </template>
        
        <template v-else-if="state == 'failed'">
          <p>La conexión ha fallado, por favor vuelve a intentarlo más tarde o comunícate con soporte.</p><br>
          <p>ERROR: {{ connection?.lastProcessed?.error }}</p>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog" :disabled="state == 'uploadingFile'">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar :timeout="5000" v-model="snackbar.enabled" color="red">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
import { ProvidersApiFactory } from '@/libs/user-api-sdk';
import type ProviderConnection from '@/types/provider.interface';

let providersApi: ReturnType<typeof ProvidersApiFactory>;
let interval: any;

enum ConnectionState {
  Initial = 'initial',
  UploadingFile = 'uploadingFile',
  ProcessingFile = 'processingFile',
  Finished = 'finished',
  Failed = 'failed',
}

export default {
  emits: ['new-connection'],
  
  data() {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      connection: undefined as ProviderConnection | undefined,
      showDialog: false,
      selectedFile: null as any,
      state: 'initial' as ConnectionState,
      snackbar: {
        enabled: false,
        text: '',
      },
    }
  },

  methods: {
    async loadData() {
      const res = await providersApi.connectionsControllerGetConnections();
      this.connection = res.data.connections.find((c: any) => c.provider === 'twitter');
    },

    async uploadFile() {
      if (!this.selectedFile) {
        return;
      }

      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': this.selectedFile.type,
        },
        body: this.selectedFile,
      };

      try {
        console.log('Uploading file')

        this.state = ConnectionState.UploadingFile;

        // Upload the file

        const res = await providersApi.fileControllerGetFileUploadUrl('twitter');
        const uploadUrl = res.data;
        console.log("Upload URL", uploadUrl)

        const response = await fetch(uploadUrl, options);
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        console.log('File uploaded succesfully')

        this.state = ConnectionState.ProcessingFile;
      } catch (error) {
        this.logError(error, 'Error al subir el archivo')
        this.state = ConnectionState.Initial;
      } finally {
        this.selectedFile = null;
      }
    },

    logError(error: any, message: string) {
      console.error(error);
      this.snackbar = {
        enabled: true,
        text: message,
      };
    },

    getButtonLabel() {
      if (this.state == ConnectionState.Initial) {
        return 'Conectar';
      } else if (this.state == ConnectionState.UploadingFile) {
        return 'Subiendo archivo...';
      } else if (this.state == ConnectionState.ProcessingFile) {
        return 'Procesando...';
      } else if (this.state == ConnectionState.Finished) {
        return 'Conectado';
      } else if (this.state == ConnectionState.Failed) {
        return 'Fallido';
      }
    },

    openDialog() {
      this.showDialog = true;

      interval = setInterval(async () => {
        console.log('Checking for connection updates')
        const res = await providersApi.connectionsControllerGetConnections();
        this.connection = res.data.connections.find((c: any) => c.provider === 'twitter');
      }, 5000);
    },

    closeDialog() {
      this.showDialog = false;
      clearInterval(interval);
    }
  },

  watch: {
    connection() {
      if (this.connection) {
        if (this.connection.lastProcessed) {
          if (this.connection.lastProcessed.success) {
            this.state = ConnectionState.Finished;

            this.$emit('new-connection');

            console.log('Connection finished')
          } else {
            this.state = ConnectionState.Failed;
            console.log('Connection failed')
          }

          if(interval)
            clearInterval(interval);
        } else {
          this.state = ConnectionState.ProcessingFile;
        }
      } else {
        this.state = ConnectionState.Initial;
      }
    }
  },

  created() {
    const idToken = localStorage.getItem('id_token')!;

    providersApi = ProvidersApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })

    this.loadData();
  },
}
</script>
