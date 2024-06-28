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
      v-model:items-per-page="interestsPerPage"
      v-model:search="search"
      :headers="presentation.headers"
      :items="interests"
      :items-length="totalInterests"
      :loading="loading"
      item-value="name"
      @update:options="getInterests"
    >
      <template v-slot:item.name="{ item }">
        <div class="text-start">
          {{ item.resource.name }}
        </div>
      </template>

      <template v-slot:item.type="{ item }">
        <div class="text-start">
          <v-chip
            :text="item.resource.type"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.provider="{ item }">
        <div class="text-start">
          <v-chip
            :color="presentation.colors.providers[item.provider as 'spotify' | 'user']"
            :text="item.provider"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn flat icon :href="getResourceUrl(item.resource.id, item.resource.type)" target="_blank">
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>

        <v-btn flat icon @click="deleteInterest(item)">
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
  import { type Interest } from '@/types/resources.interface';

  let interestsApi: ReturnType<typeof InterestsApiFactory>;

  export default {
    data () {
      return {
        presentation: {
          headers: [
            { title: 'Nombre', key: 'name' },
            { title: 'Tipo', key: 'type' },
            { title: 'Proveedor', key: 'provider' },
            { title: 'Acciones', key: 'actions' },
          ],
          colors: {
            providers: {
              spotify: 'green',
              user: 'purple',
            }
          },
        },
        search: '',
        loading: false,
        interests: [] as Interest[],
        interestsPerPage: 5,
        totalInterests: 0,
        snackbar: {
          enabled: false,
          text: ''
        },
      }
    },

    methods: {
      async getInterests({ page, itemsPerPage } : { page: number, itemsPerPage: number }) {
        this.loading = true;

        console.log('Getting interests', page, itemsPerPage)

        const res = await interestsApi.interestsControllerGetOwn((page - 1) * itemsPerPage, itemsPerPage, this.search);

        this.totalInterests = res.data.total;

        this.interests = res.data.interests;

        this.loading = false;
      },

      async loadInterests() {
        console.log('Loading interests')
        await this.getInterests({ page: 1, itemsPerPage: this.interestsPerPage });
      },

      getResourceUrl(resourceId: string, resourceType: string) {
        if (resourceType === 'artist') {
            return `https://open.spotify.com/artist/${resourceId}`;
        } else if (resourceType === 'track') {
            return `https://open.spotify.com/track/${resourceId}`;
        }
      },

      async deleteInterest(interest: any) {
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
    },
    created() {
      const idToken = localStorage.getItem('id_token')!;

      interestsApi = InterestsApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      })

      this.loadInterests();
    },
  }
</script>
