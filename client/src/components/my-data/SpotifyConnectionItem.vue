<template>
  <v-list-item title="Spotify" class="py-3">
    <template v-slot:prepend>
      <v-avatar>
        <v-img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="spotify"></v-img>
      </v-avatar>
    </template>

    <template v-slot:append>
      <!-- <v-btn icon="mdi-connection" variant="text"></v-btn> -->
      <v-btn @click="showDialog = true" variant="text" :disabled="isConnected">{{ isConnected ? 'Conectado' : 'Conectar' }}</v-btn>
    </template>
  </v-list-item>

  <v-dialog v-model="showDialog" max-width="50%" persistent>
    <v-card>
      <v-card-title>Conexion a Spotify</v-card-title>
      <v-card-text>  
        <template v-if="state == 'initial'">
          <p>Al continuar, te redirigiremos a la pagina de Spotify para que inicies sesion y nos des permisos para acceder a tus datos.</p>
          <v-btn @click="startFlow" class="my-3">Continuar</v-btn>
        </template >
        <template v-else-if="state == 'pendingConnection'">
          Por favor, completa la conexion y al finalizar vuelve a esta ventana.
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
import { ProvidersApiFactory } from '@/libs/user-api-sdk';

let providersApi: ReturnType<typeof ProvidersApiFactory>;

export default {
  props: {
    isConnected: Boolean,
  },

  data() {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      showDialog: false,
      state: 'initial',
      snackbar: {
        enabled: false,
        text: '',
      },
    }
  },

  methods: {
    async startFlow() {
      // Get the Spotify login URL
      const res = await providersApi.authControllerLogin('spotify');

      // Open Spotify login page on a new tab
      window.open(res.data, '_blank')!.focus();

      this.state = 'pendingConnection';

      // Await for connection (wait SQS message)
      const connectionPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, 5000);
      });

      connectionPromise.then(() => {
        this.state = 'finished';

        this.$emit('connected', { provider: 'spotify', oauth: { date: new Date() } });
      }).catch((error) => {
        console.error('Error:', error);
        this.state = 'initial';
        this.snackbar = {
          enabled: true,
          text: 'Error al conectar con Spotify',
        };
      });   
    },
  },

  async created() {
    const idToken = localStorage.getItem('id_token')!;

    providersApi = ProvidersApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })
  },
}
</script>@/libs/user-api-sdk