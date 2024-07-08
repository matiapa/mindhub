<template>
  <v-list-item title="Spotify" class="py-3">
    <template v-slot:prepend>
      <v-avatar>
        <v-img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="spotify"></v-img>
      </v-avatar>
    </template>

    <template v-slot:append>
      <v-btn @click="openDialog" variant="text" :disabled="!enabled">
        {{ getButtonLabel() }}
      </v-btn>
    </template>
  </v-list-item>

  <v-dialog v-model="showDialog" class="dialog-responsive" persistent>
    <v-card>
      <v-card-title>Conexion a Spotify</v-card-title>
      <v-card-text>  
        <template v-if="state == 'initial'">
          <p>Al continuar, te redirigiremos a la pagina de Spotify para que inicies sesion y nos des permisos para acceder a tus datos.</p>
          <v-btn @click="openLoginPage" class="my-3">Continuar</v-btn>
        </template >

        <template v-else-if="state == 'waitingAuth'">
          Por favor, completa la conexion y al finalizar vuelve a esta ventana.
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>

        <template v-else-if="state == 'processingData'">
          Procesando datos...
          <v-progress-linear class="my-6" indeterminate></v-progress-linear>
        </template>

        <template v-else-if="state == 'finished'">
          <p>¡Conexión finalizada! Se han extraído y procesado {{ connection?.lastProcessed?.summary?.interests }} intereses.</p>
          <p class="mt-6">Actualizado el {{ new Date(connection!.lastProcessed!.date).toLocaleString("es-ES", {hour12: false}) }}</p>

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
        <v-btn @click="closeDialog" :disabled="state == 'waitingAuth'">Close</v-btn>
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
  WaitingAuth = 'waitingAuth',
  ProcessingData = 'processingData',
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
      enabled: false,
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
      this.connection = res.data.connections.find((c: any) => c.provider === 'spotify');

      const twitterConnection = res.data.connections.find((c: any) => c.provider === 'twitter');

      // Spotify will only be enabled after connecting Twitter because currently
      // recommendations cannot be generated without text data. The button must
      // be enabled too if Spofity is already connected so that it can be disconnected
      // then even if Twitter is disconnected first.
      if (this.connection?.lastProcessed?.success) {
        this.enabled = true;
      } else {
        this.enabled = twitterConnection?.lastProcessed?.success || false;
      }
    },

    async openLoginPage() {
      // Get the Spotify login URL
      const res = await providersApi.authControllerLogin('spotify');

      // console.log('Opening Spotify login page')

      // Open Spotify login page on a new tab
      window.open(res.data, '_blank')!.focus();

      this.state = ConnectionState.WaitingAuth; 
    },

    async removeConnection() {
      try {
        this.state = ConnectionState.RemovingConnection;
        await providersApi.connectionsControllerDeleteConnection("spotify");
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
      } else if (this.state == ConnectionState.WaitingAuth) {
        return 'Aguardando autenticación...';
      } else if (this.state == ConnectionState.ProcessingData) {
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
        this.connection = res.data.connections.find((c: any) => c.provider === 'spotify');
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

            // console.log('Connection finished')
          } else {
            this.state = ConnectionState.Failed;
            console.error('Connection failed')
          }

          if(interval)
            clearInterval(interval);
        } else {
          this.state = ConnectionState.ProcessingData;
        }
      } else {
        this.state = ConnectionState.Initial;
      }
    }
  },

  async created() {
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
