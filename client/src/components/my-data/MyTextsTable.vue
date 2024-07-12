<template>
  <v-card flat class="px-3">
    <v-card-title class="d-flex align-center pe-2">
      <v-row>
        <v-col cols="6" md="4">
          Tus textos
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
          <v-btn variant="text" prepend-icon="mdi-plus" class="ml-3" color="blue" @click="newText.showDialog=true">Agregar texto</v-btn>
        </v-col>
      </v-row>     
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
      <template v-slot:header.language="{ column }">
        <p class="datatable-hiddable-col">
          {{ column.title }}
        </p>
      </template>

      <template v-slot:header.provider="{ column }">
        <p class="datatable-hiddable-col">
          {{ column.title }}
        </p>
      </template>

      <template v-slot:item.text="{ item }">
        <div class="text-start">
          {{ textPreview(item.rawText) }}
        </div>
      </template>

      <template v-slot:item.language="{ item }">
        <div class="text-start datatable-hiddable-col">
          <v-chip
            :text="getLanguageTitle(item.language)"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.provider="{ item }">
        <div class="text-start datatable-hiddable-col">
          <v-chip
            :text="item.provider"
            :color="presentation.colors.providers[item.provider as 'twitter' | 'user']"
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

  <v-dialog v-model="showDialog" class="dialog-responsive">
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

  <v-dialog v-model="newText.showDialog" class="dialog-responsive">
    <v-card>
        <v-card-item>
            <v-card-title>Agregar un nuevo texto</v-card-title>
        </v-card-item>

        <v-card-text>
            <v-form ref="form" v-model="newText.valid">
              <v-textarea v-model="newText.rawText" label="Texto"></v-textarea>

              <v-select label="Idioma" v-model="newText.language" :items="presentation.languages"
                item-title="title" item-value="value"></v-select>

              <v-btn v-if="!newText.saving" @click="postNewText" :disabled="!newText.valid">Guardar</v-btn>
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
  import { TextsApiFactory } from 'user-api-sdk';
  import { type Text } from '@/types/resources.interface';
  import '@/styles/styles.css';

  let textsApi: ReturnType<typeof TextsApiFactory>;

  export default {
    data () {
      return {
        presentation: {
          headers: [
            { title: 'Texto', key: 'text' },
            { title: 'Idioma', key: 'language' },
            { title: 'Proveedor', key: 'provider' },
            { title: 'Acciones', key: 'actions' },
          ],
          colors: {
            providers: {
              twitter: 'blue',
              user: 'purple',
            }
          },
          languages: [
            { title: 'Español', value: 'es'},
            { title: 'Inglés', value: 'en'},
          ],
        },
        search: '',
        loading: false,
        texts: [] as Text[],
        textsPerPage: 5,
        totalTexts: 0,
        displayedText: '',
        showDialog: false,
        newText: {
          rawText: '',
          language: 'es' as 'es' | 'en',
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
      async deleteText(text: any) {
        const index = this.texts.findIndex(i => i === text);
        if (index !== -1) {
          this.texts.splice(index, 1);
        }

        try {
          await textsApi.textsControllerDelete(text._id);
        } catch (e) {
          
          this.texts.splice(index, 0, text);

          console.error(e);
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
        // console.log('Loading texts')
        await this.getTexts({ page: 1, itemsPerPage: this.textsPerPage });
      },

      getLanguageTitle(language: string) {
        return this.presentation.languages.find(l => l.value === language)?.title;
      },

      displayFullText(fullText: string) {
        this.displayedText = fullText;
        this.showDialog = true;
      },

      async postNewText() {
        try {
          this.newText.saving = true;

          const res = await textsApi.textsControllerCreate({
            rawText: this.newText.rawText,
            language: this.newText.language,
          });

          // console.log("Created text", res);

          this.newText.saving = false;
          this.texts.unshift({
            _id: res.data._id! as any as string,
            provider: res.data.provider,
            rawText: res.data.rawText,
            language: res.data.language,
            date: res.data.date!
          });

          this.newText.saving = false;
          this.newText.showDialog = false;
        } catch (e) {
          console.error(e);
          this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
          this.snackbar.enabled = true
          this.newText.saving = false;
        }
      },
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
