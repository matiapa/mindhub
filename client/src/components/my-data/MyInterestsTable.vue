<template>
  <v-card flat class="px-3">
    <v-card-title class="d-flex align-center pe-2">
      Tus intereses

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        label="Buscar"
        single-line
        flat
        hide-details
        variant="solo-filled"
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:search="search"
      :headers="presentation.headers"
      :items="interests"
      :items-length="totalItems"
      :loading="loading"
      item-value="name"
      @update:options="getInterests"
    >
      <template v-slot:item.type="{ item }">
        <div class="text-end">
          <v-chip
            :text="item.type"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.provider="{ item }">
        <div class="text-end">
          <v-chip
            :color="presentation.colors.providers[item.provider]"
            :text="item.provider"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <!-- <template v-slot:item.relevance="{ item }">
        <div class="text-end">
          <v-icon :color="item.relevance === 'favourite' ? 'red' : ''">
            {{ item.relevance === 'favorite' ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </div>
      </template> -->

      <template v-slot:item.actions="{ item }">
        <v-btn flat icon :href="getResourceUrl(item.resourceId, item.type)" target="_blank">
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>

        <v-btn flat icon @click="deleteItem(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>
  </v-card>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
  import { InterestsApiFactory } from '@/libs/user-api-sdk';

  let interestsApi: ReturnType<typeof InterestsApiFactory>;

  export default {
    data () {
      return {
        presentation: {
          headers: [
            { title: 'Nombre', key: 'name' },
            { title: 'Tipo', key: 'type' },
            { title: 'Provedor', key: 'provider' },
            // { title: 'Favorito', key: 'relevance' },
            { title: 'Acciones', key: 'actions' },
          ],
          colors: {
            providers: {
              spotify: 'green',
              twitter: 'blue',
              user: 'purple',
            }
          },
        },
        search: '',
        loading: false,
        interests: [] as any[],
        itemsPerPage: 5,
        totalItems: 0,
        snackbar: {
          enabled: false,
          text: ''
        },
      }
    },

    methods: {
      async deleteItem(interest: any) {
        const index = this.interests.findIndex(i => i === interest);
        if (index !== -1) {
          this.interests.splice(index, 1);
        }

        try {
          await interestsApi.interestsControllerDelete(interest._id);
        } catch (e) {
          
          this.interests.splice(index, 0, interest);

          console.log(e);
          this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
          this.snackbar.enabled = true
        }
      },

      async getInterests({ page, itemsPerPage }) {
        this.loading = true;

        const res = await interestsApi.interestsControllerGetOwn((page - 1) * itemsPerPage, itemsPerPage, this.search);

        this.totalItems = res.data.total;

        this.interests = res.data.interests.map(i => ({
          _id: i._id,
          provider: i.provider,
          relevance: i.relevance,
          resourceId: i.resource.id,
          type: i.resource.type,
          name: i.resource.name
        }));

        this.loading = false;
      },

      getResourceUrl(resourceId: string, resourceType: string) {
        if (resourceType === 'artist') {
            return `https://open.spotify.com/artist/${resourceId}`;
        } else if (resourceType === 'track') {
            return `https://open.spotify.com/track/${resourceId}`;
        }
      }
    },

    created() {
      const idToken = localStorage.getItem('id_token')!;

      interestsApi = InterestsApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      })

      this.getInterests({ page: 1, itemsPerPage: 10 })
    },
  }
</script>@/libs/user-api-sdk