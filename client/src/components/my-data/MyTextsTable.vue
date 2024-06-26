<template>
  <v-card flat class="px-3">
    <v-card-title class="d-flex align-center pe-2">
      Tus textos

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
      v-model:items-per-page="textsPerPage"
      v-model:search="search"
      :headers="presentation.headers"
      :items="texts"
      :items-length="totalTexts"
      :loading="loading"
      item-value="name"
      @update:options="getTexts"
    >

      <template v-slot:item.text="{ item }">
        <div class="text-start">
          {{ textPreview(item.rawText) }}
        </div>
      </template>

      <template v-slot:item.language="{ item }">
        <div class="text-start">
          <v-chip
            :text="item.language"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.provider="{ item }">
        <div class="text-start">
          <v-chip
            :text="item.provider"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn flat icon @click="displayFullText(item.rawText)">
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>

        <v-btn flat icon @click="deleteText(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>
  </v-card>

  <v-dialog v-model="showDialog" max-width="50%">
    <v-card>
      <v-card-text>  
        {{ displayedText }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script lang="ts">
  import { TextsApiFactory } from '@/libs/user-api-sdk';
  import { type Text } from '@/types/resources.interface';

  let textsApi: ReturnType<typeof TextsApiFactory>;

  export default {
    data () {
      return {
        presentation: {
          headers: [
            { title: 'Texto', key: 'text' },
            { title: 'Idioma', key: 'language' },
            { title: 'Provedor', key: 'provider' },
            { title: 'Acciones', key: 'actions' },
          ],
          colors: {
            providers: {
              twitter: 'blue',
              user: 'purple',
            }
          },
        },
        search: '',
        loading: false,
        texts: [] as Text[],
        textsPerPage: 5,
        totalTexts: 0,
        displayedText: '',
        showDialog: false,
        snackbar: {
          enabled: false,
          text: ''
        },
      }
    },

    methods: {
      async deleteText(text: any) {
        const index = this.texts.findIndex(i => i === text);
        if (index !== -1) {
          this.texts.splice(index, 1);
        }

        try {
          await textsApi.textsControllerDelete(text._id);
        } catch (e) {
          
          this.texts.splice(index, 0, text);

          console.log(e);
          this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
          this.snackbar.enabled = true
        }
      },

      async getTexts({ page, itemsPerPage } : { page: number, itemsPerPage: number }) {
        this.loading = true;

        const res = await textsApi.textsControllerGetOwn((page - 1) * itemsPerPage, itemsPerPage, this.search);

        this.totalTexts = res.data.total;

        this.texts = res.data.texts;

        this.loading = false;
      },

      async loadTexts() {
        console.log('Loading texts')
        await this.getTexts({ page: 1, itemsPerPage: this.textsPerPage });
      },

      displayFullText(fullText: string) {
        this.displayedText = fullText;
        this.showDialog = true;
      }
    },

    computed: {
      textPreview() {
        return (text: string) => text.slice(0, 50) + '...';
      }
    },

    created() {
      const idToken = localStorage.getItem('id_token')!;

      textsApi = TextsApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      })

      this.loadTexts();
    },
  }
</script>
