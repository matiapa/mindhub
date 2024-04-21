<template>
  <v-container class="d-flex justify-center">
    <v-row>
      <v-col cols="3">
        <MyAccountsList/>
      </v-col>

      <v-col cols="6">
        <MyInterestsTable/>
      </v-col>

      <v-col cols="3">
        <PersonalityCard v-if="ownUser.personality" title="Tu Personalidad" :personality="ownUser.personality"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import MyAccountsList from '@/components/my-data/MyAccountsList.vue'
  import MyInterestsTable from '@/components/my-data/MyInterestsTable.vue'
  import PersonalityCard from '@/components/PersonalityCard.vue'
  import { UsersApiFactory } from '@/libs/user-api-sdk';

  let usersApi: ReturnType<typeof UsersApiFactory>;

  export default {
    components: {
      MyAccountsList,
      MyInterestsTable,
      PersonalityCard
    },

    data: () => ({
      ownUser: {} as any,
    }),

    methods: {
      async getOwnUserData() {
        try {
          const uuid = localStorage.getItem('uuid')!;
          const res = await usersApi.usersControllerGetById(uuid, ['personality']);
          this.ownUser = res.data;

          console.log(this.ownUser)
        } catch (error) {
          console.error(error);
        }
      }
    },

    created() {
      const idToken = localStorage.getItem('id_token')!;

      usersApi = UsersApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      });
      
      this.getOwnUserData()
    },
  }
</script>@/libs/user-api-sdk