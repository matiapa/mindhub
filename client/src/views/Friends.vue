<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="3">
        <v-card rounded="lg" >
          <v-card-title>Solicitudes de amistad</v-card-title>

          <v-expansion-panels class="mt-2" min-height="268" variant="accordion" elevation="0">
            <v-expansion-panel title="Recibidas">
              <v-expansion-panel-text>
                <v-list v-if="friendships.recieved.length" lines="one">
                  <v-list-item v-for="(friendship, index) in friendships.recieved" :key="friendship.user._id" @click="openRequestProfile(friendship)">
                    <template v-slot:prepend>
                      <v-icon>mdi-account-arrow-left</v-icon>
                    </template>

                    <v-list-item-title>{{ friendship.user.profile.name }}</v-list-item-title>

                    <template v-slot:append>
                      <v-list-item-action start>
                        <v-btn icon="mdi-check" variant="text" @click="acceptFriendRequest(index)"></v-btn>
                        <v-btn icon="mdi-close" variant="text" @click="rejectFriendRequest(index)"></v-btn>
                      </v-list-item-action>
                    </template>
                  </v-list-item>
                </v-list>
                <p v-else>No has recibido solicitudes aún</p>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel title="Enviadas">
              <v-expansion-panel-text>
                <v-list v-if="friendships.sent.length">
                  <v-list-item v-for="(friendship, index) in friendships.sent" :key="friendship.user._id" @click="openRequestProfile(friendship)">
                    <template v-slot:prepend>
                      <v-icon>mdi-account-arrow-right</v-icon>
                    </template>

                    <v-list-item-title>{{ friendship.user.profile.name }}</v-list-item-title>

                    <template v-slot:append>
                      <v-btn icon="mdi-close" variant="text" @click="cancelFriendProposal(index)"></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <p v-else>No has enviado solicitudes aún</p>
              </v-expansion-panel-text>
            </v-expansion-panel>

          </v-expansion-panels>
        </v-card>
      </v-col>

      <v-col cols="12" md="12" lg="9">
        <v-row v-if="!loading && friendships.established.length">
          <v-col v-for="(friendship) in friendships.established" :key="friendship.user._id" cols="12" md="6" lg="4">
            <FriendCard :user="friendship"></FriendCard>
          </v-col>
        </v-row>

        <v-row v-if="!loading && !friendships.established.length" align="center" justify="center">
          <v-col cols="auto">
            <v-card class="pa-4 mt-8">
              <v-card-title>No tienes amigos aún</v-card-title>
              <v-card-text>Continua explorando tus recomendaciones para formar nuevas amistades</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="loading" align="center" justify="center">
          <v-col cols="auto">
            <v-progress-circular class="mt-8" indeterminate size="64" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showRequestProfileDialog" max-width="50%">
    <ProfileDetailCard :user="requestUser" />
  </v-dialog>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
import type User from '@/types/user.interface'
import FriendCard from '@/components/friends/FriendCard.vue'
import ProfileDetailCard from '@/components/profile/ProfileDetailCard.vue'
import { FriendshipsApiFactory, FriendshipsControllerGetFriendshipsTypeEnum } from 'user-api-sdk/api'
import '@/styles/styles.css';
</script>

<script lang="ts">
enum Priority {
  Compatibility = 'compatibility',
  Nearest = 'nearest',
  Activity = 'activity',
}

let friendsApi: ReturnType<typeof FriendshipsApiFactory>;

export default {
  compononents: {
    FriendCard,
    ProfileDetailCard,
  },

  data: () => ({
    loading: true,
    snackbar: {
      enabled: false,
      text: ''
    },
    friendships: {
      established: [] as User[],
      recieved: [] as User[],
      sent: [] as User[]
    },
    priority: 'compatibility' as Priority,
    showRequestProfileDialog: false,
    requestUser: {} as User,
  }),

  methods: {
    async loadData() {
      this.loading = true;

      let res = await friendsApi.friendshipsControllerGetFriendships(
        ['distance', 'rating'],
        FriendshipsControllerGetFriendshipsTypeEnum.Established
      );
      this.friendships.established = res.data.friends as any as User[];

      res = await friendsApi.friendshipsControllerGetFriendships([], FriendshipsControllerGetFriendshipsTypeEnum.Received);
      this.friendships.recieved = res.data.friends as any as User[];

      res = await friendsApi.friendshipsControllerGetFriendships([], FriendshipsControllerGetFriendshipsTypeEnum.Proposed);
      this.friendships.sent = res.data.friends as any as User[];

      this.loading = false
    },

    async acceptFriendRequest(index: number) {
      const request = this.friendships.recieved[index]
      this.friendships.established.unshift(request)
      this.friendships.recieved.splice(index, 1) 

      try {
        await friendsApi.friendshipsControllerReviewRequest(request.user._id, { 'accept': true })
        // await new Promise((resolve, reject) => setTimeout(reject, 2000))
      } catch (e) {
        this.friendships.established.pop()
        this.friendships.recieved.splice(index, 0, request)

        console.error(e)
        this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
        this.snackbar.enabled = true
      }
    },

    async rejectFriendRequest(index: number) {
      const request = this.friendships.recieved[index]
      this.friendships.recieved.splice(index, 1)

      try {
        await friendsApi.friendshipsControllerReviewRequest(request.user._id, { 'accept': false })
        // await new Promise((resolve, reject) => setTimeout(reject, 2000))
      } catch (e) {
        this.friendships.recieved.splice(index, 0, request)

        console.error(e)
        this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
        this.snackbar.enabled = true
      }
    },

    async cancelFriendProposal(index: number) {
      const proposal = this.friendships.sent[index]
      this.friendships.sent.splice(index, 1)

      try {
        await friendsApi.friendshipsControllerCancelProposal(proposal.user._id)
        // await new Promise((resolve, reject) => setTimeout(reject, 2000))
      } catch (e) {
        this.friendships.sent.splice(index, 0, proposal)

        console.error(e)
        this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
        this.snackbar.enabled = true
      }
    },

    async openRequestProfile(user: User) {
      this.requestUser = user
      this.showRequestProfileDialog = true
    },
  },

  created() {
    const idToken = localStorage.getItem('id_token')!;

    friendsApi = FriendshipsApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })

    this.loadData()
  },
}
</script>user-api-sdk/api