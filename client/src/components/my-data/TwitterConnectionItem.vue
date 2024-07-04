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

  <v-dialog v-model="showDialog" class="dialog-responsive" persistent>
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

          <v-btn @click="removeConnection" color="error" variant="text" class="mt-6">Desconectar</v-btn>
        </template>

        <template v-else-if="state == 'removingConnection'">
          <p>Desconectando proveedor...</p>
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
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

  <v-snackbar :timeout="5000" v-model="snackbar.enabled" :color="snackbar.color">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
import { ProvidersApiFactory } from 'user-api-sdk';
import type ProviderConnection from '@/types/provider.interface';
import '@/styles/styles.css';

let providersApi: ReturnType<typeof ProvidersApiFactory>;
let interval: any;

enum ConnectionState {
  Initial = 'initial',
  UploadingFile = 'uploadingFile',
  ProcessingFile = 'processingFile',
  Finished = 'finished',
  Failed = 'failed',
  RemovingConnection = 'removingConnection',
}

export default {
  emits: ['new-connection', 'removed-connection'],
  
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
        color: 'primary',
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
        this.displayMessage('Error al subir el archivo', error)
        this.state = ConnectionState.Initial;
      } finally {
        this.selectedFile = null;
      }
    },

    async removeConnection() {
      try {
        this.state = ConnectionState.RemovingConnection;
        await providersApi.connectionsControllerDeleteConnection("twitter");
        this.connection = undefined;
        this.state = ConnectionState.Initial;
        this.displayMessage('Proveedor desconectado exitosamente');

        this.$emit('removed-connection');
      } catch (error) {
        this.displayMessage('Error al desconectar', error)
        this.state = ConnectionState.Finished;
      }
    },

    displayMessage(message: string, error?: any) {
      if (error) console.error(error);
      this.snackbar = {
        enabled: true,
        text: message,
        color: error ? 'error' : 'primary',
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
