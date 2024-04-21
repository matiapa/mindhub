<template>
  <v-card class="pa-3" flat>
    <v-card-title>Tus cuentas</v-card-title>

    <v-list>
      <TwitterConnectionItem :isConnected="isProviderConnected('twitter')"/>
      <SpotifyConnectionItem :isConnected="isProviderConnected('spotify')"/>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import TwitterConnectionItem from '@/components/my-data/TwitterConnectionItem.vue';
import SpotifyConnectionItem from '@/components/my-data/SpotifyConnectionItem.vue';
import { ProvidersApiFactory } from '@/libs/user-api-sdk';

let providersApi: ReturnType<typeof ProvidersApiFactory>;

export default {
  components: {
    TwitterConnectionItem,
    SpotifyConnectionItem
  },

  data() {
    return {
      presentation: {
        providers: [
          { provider: 'spotify', name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
          { provider: 'twitter', name: 'Twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg' },
        ],
      },
      
      user: {
        connectedProviders: [] as any[],
      },

      dialog: false,
    }
  },

  methods: {
    async getConnectedProviders() {
      const res = await providersApi.connectionsControllerGetConnections();
      this.user.connectedProviders = res.data.connections.map(c => ({
        provider: c.provider, oauth: c.oauth, file: c.file
      }));
    },

    isProviderConnected(provider: string) {
      return this.user.connectedProviders.some((c: any) => c.provider === provider);
    }
  },

  async created() {
    const idToken = localStorage.getItem('id_token')!;

    providersApi = ProvidersApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })

    await this.getConnectedProviders();
  },
}
</script>@/libs/user-api-sdk