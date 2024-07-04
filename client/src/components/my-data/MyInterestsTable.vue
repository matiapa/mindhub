<template>
  <v-card flat class="px-3">
    <v-card-title class="d-flex align-center pe-2">
      <v-row>
        <v-col cols="6" md="4">
          Tus intereses
        </v-col>
        <v-col cols="6" md="5">
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
        </v-col>
        <v-col cols="12" md="3">
          <v-btn variant="text" prepend-icon="mdi-plus" class="ml-3" color="blue" @click="newInterest.showDialog=true">Agregar interés</v-btn>
        </v-col>
      </v-row>
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
      <template v-slot:header.provider="{ column }">
        <p class="datatable-hiddable-col">
          {{ column.title }}
        </p>
      </template>

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
        <div class="text-start datatable-hiddable-col">
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

  <v-dialog v-model="newInterest.showDialog" class="dialog-responsive">
    <v-card>
        <v-card-item>
            <v-card-title>Agregar un nuevo interés</v-card-title>
        </v-card-item>

        <v-card-text>
            <v-form ref="form" v-model="newInterest.valid">
              <v-text-field v-model="newInterest.name" :label="` Título ${getResurceTypeNomination()}`"></v-text-field>

              <v-select label="Tipo" v-model="newInterest.resourceType" :items="presentation.resourceTypes"
                item-title="title" item-value="value"></v-select>

              <v-checkbox label="Marcar como favorito" v-model="newInterest.favorite"></v-checkbox>

              <v-btn v-if="!newInterest.saving" @click="postNewInterest" :disabled="!newInterest.valid">Guardar</v-btn>
              <v-progress-circular v-else indeterminate color="white"></v-progress-circular>
            </v-form>
        </v-card-text>

        <!-- <v-card-actions>
          <v-btn prepend-icon="mdi-account-plus" @click="send" class="mx-3 my-3">Enviar solicitud</v-btn>
        </v-card-actions> -->
    </v-card>
  </v-dialog>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
  import { InterestsApiFactory, CreateManualInterestDtoRelevanceEnum } from 'user-api-sdk';
  import { type Interest } from '@/types/resources.interface';
  import '@/styles/styles.css';

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
          resourceTypes: [
            { title: 'Artista', value: 'artist', nomination: 'del artista'},
            { title: 'Canción', value: 'track', nomination: 'de la canción'},
          ],
        },
        search: '',
        loading: false,
        interests: [] as Interest[],
        interestsPerPage: 5,
        totalInterests: 0,
        newInterest: {
          name: '',
          resourceType: 'track' as 'track' | 'artist',
          favorite: true,
          valid: false,
          showDialog: false,
          saving: false,
        },
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

      async postNewInterest() {
        try {
          this.newInterest.saving = true;

          const res = await interestsApi.interestsControllerCreate({
            relevance: this.newInterest.favorite ? CreateManualInterestDtoRelevanceEnum.Favorite : CreateManualInterestDtoRelevanceEnum.Normal,
            resource: {
              name: this.newInterest.name,
              type: this.newInterest.resourceType,
            }
          });

          this.newInterest.saving = false;

          this.interests.unshift({
            _id: res.data._id! as any as string,
            provider: res.data.provider,
            relevance: res.data.relevance,
            resource: res.data.resource,
            date: res.data.date!
          });

          this.newInterest.saving = false;
          this.newInterest.showDialog = false;
        } catch (e) {
          console.log(e);
          this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
          this.snackbar.enabled = true
          this.newInterest.saving = false;
        }
      },

      getResurceTypeNomination() {
        return this.presentation.resourceTypes.find(t => t.value === this.newInterest.resourceType)?.nomination || 'del recurso';
      }
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
