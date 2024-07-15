<template>
  <v-container class="d-flex justify-center">
    <v-row>
      <v-col cols="12" md="3">
        <MyAccountsList @new-connection="newConnection" @removed-connection="removedConnection"/>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <MyInterestsTable ref="myInterestsTable"/>
          
          <div class="mt-6">
            <MyTextsTable ref="myTextsTable"/>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <PersonalityCard v-if="ownPersonality" title="Tu Personalidad" :personality="ownPersonality" :showGenerationDate="true" />
        <v-card v-else class="pa-3">
          <v-card-title>Tu personalidad</v-card-title>
          <v-card-text class="mt-3">
            <p v-if="!refreshingPersonality">Por favor, conecta al menos una cuenta para poder evaluar tu personalidad.</p>
            <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import MyAccountsList from '@/components/my-data/MyAccountsList.vue'
  import MyInterestsTable from '@/components/my-data/MyInterestsTable.vue'
  import MyTextsTable from '@/components/my-data/MyTextsTable.vue'
  import PersonalityCard from '@/components/PersonalityCard.vue'
  import { UsersApiFactory } from 'user-api-sdk';

  let usersApi: ReturnType<typeof UsersApiFactory>;

  export default {
    components: {
      MyAccountsList,
      MyInterestsTable,
      MyTextsTable,
      PersonalityCard
    },

    data: () => ({
      ownPersonality: undefined as any,
      refreshingPersonality: false,
    }),

    methods: {
      async loadPersonality() {
        try {
          // console.log('Loading personality')
          const uuid = localStorage.getItem('uuid')!;
          const res = await usersApi.usersControllerGetById(uuid, ['personality']);
          this.ownPersonality = res.data.personality;
        } catch (error) {
          console.error(error);
        }
      },

      async newConnection() {
        // Extracted resources will be instantly available
        (this.$refs.myInterestsTable as InstanceType<typeof MyInterestsTable>).loadInterests();
        (this.$refs.myTextsTable as InstanceType<typeof MyTextsTable>).loadTexts();

        // But personality may take a while to be generated, so we need to wait
        // and will only be refreshed if there wasn't a previous personality calculated
        this.refreshingPersonality = true;
        while (!this.ownPersonality) {
          this.loadPersonality();
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        this.refreshingPersonality = false;
      },

      async removedConnection() {
        (this.$refs.myInterestsTable as InstanceType<typeof MyInterestsTable>).loadInterests();
        (this.$refs.myTextsTable as InstanceType<typeof MyTextsTable>).loadTexts();
      },
    },

    created() {
      const idToken = localStorage.getItem('id_token')!;

      usersApi = UsersApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      });
      
      this.loadPersonality()
    },
  }
</script>
