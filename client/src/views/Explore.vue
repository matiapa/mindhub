<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <v-card class="floating-card" rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-2">
              Priorizar
            </h2>

            <v-chip-group v-model="priority" column>
              <v-chip value="compatibility">Similaridad</v-chip>

              <v-chip value="nearest">Cercania</v-chip>

              <v-chip value="activity">Actividad</v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="10">
        <v-row v-if="loading" align="center" justify="center">
          <v-col cols="auto">
            <v-progress-circular class="mt-8" indeterminate size="64" />
          </v-col>
        </v-row>

        <div v-else>
          <v-row v-if="recommendations.length">
            <v-col v-for="(recommendation, index) in recommendations" :key="recommendation.user._id" cols="4">
              <RecommendationCard :user="recommendation" @accept="acceptRecommendation(index)" @reject="rejectRecommendation(index)"></RecommendationCard>
            </v-col>
          </v-row>

          <v-row v-else class="mt-4 justify-center">
            <v-card v-if="!isTwitterConnected">
              <v-card-title>Conectá una cuenta</v-card-title>
              <v-card-text>
                <p class="mt-3">¡Ya casi estás! Para empezar a darte recomendaciones, es necesario que conectes al menos una cuenta</p>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="$router.push('/data')">Conectar</v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else>
              <v-card-title>Generando recomendaciones</v-card-title>
              <v-card-text>
                <p>Tus recomendaciones se están generando, por favor aguarda</p>
                <v-progress-linear class="my-6" indeterminate></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<style scoped>
.floating-card {
  position: fixed;
  top: 20;
  width: 14%;
  box-sizing: border-box;
}
</style>

<script setup lang="ts">
import type User from '@/types/user.interface'
import RecommendationCard from '@/components/recommendations/RecommendationCard.vue'
import { RecommendationsApiFactory, RecommendationsControllerGetRecommendationsPriorityEnum } from '@/libs/user-api-sdk/api'
</script>

<script lang="ts">
import { ProvidersApiFactory } from '@/libs/user-api-sdk';

import type ProviderConnection from '@/types/provider.interface';

let providersApi: ReturnType<typeof ProvidersApiFactory>;

enum Priority {
  Compatibility = 'compatibility',
  Nearest = 'nearest',
  Activity = 'activity',
}

let recommApi: ReturnType<typeof RecommendationsApiFactory>;

let interval: any;

export default {
  compononents: {
    RecommendationCard,
  },

  data: () => ({
    priority: 'compatibility' as Priority,
    loading: true,
    recommendations: [] as User[],
    connectedProviders: [] as ProviderConnection[],
    snackbar: {
      enabled: false,
      text: ''
    },
  }),

  methods: {
    async loadData() {
      this.loading = true;

      const priorityMap = {
        compatibility: RecommendationsControllerGetRecommendationsPriorityEnum.Affinity,
        nearest: RecommendationsControllerGetRecommendationsPriorityEnum.Distance,
        activity: RecommendationsControllerGetRecommendationsPriorityEnum.Activity,
      }

      const res1 = await recommApi.recommendationsControllerGetRecommendations(
        ['distance'],
        priorityMap[this.priority],
        0,
        20
      );
      this.recommendations = res1.data.recommendations as any as User[];

      const res2 = await providersApi.connectionsControllerGetConnections();
      this.connectedProviders = res2.data.connections;

      if (this.recommendations.length === 0 && this.isTwitterConnected) {
        // Recommendations are being generated, check them every 5 seconds
        interval = setInterval(async () => {
          console.log('Checking for recommendations')

          const res = await recommApi.recommendationsControllerGetRecommendations(
            ['distance'],
            priorityMap[this.priority],
            0,
            20
          );
          this.recommendations = res.data.recommendations as any as User[];

          if (this.recommendations.length > 0) {
            clearInterval(interval)
          }
        }, 5000)
      }

      this.loading = false
    },

    async acceptRecommendation(index: number) {
      const recomm = this.recommendations[index]
      this.recommendations.splice(index, 1)

      try {
        await recommApi.recommendationsControllerReviewRecommendation(recomm.user._id, { 'accept': true })
        // await new Promise((resolve, reject) => setTimeout(reject, 2000))
      } catch (e) {
        this.recommendations.splice(index, 0, recomm)

        console.error(e)
        this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
        this.snackbar.enabled = true
      }
    },

    async rejectRecommendation(index: number) {
      const recomm = this.recommendations[index]
      this.recommendations.splice(index, 1)

      try {
        await recommApi.recommendationsControllerReviewRecommendation(recomm.user._id, { 'accept': false })
        // await new Promise((resolve, reject) => setTimeout(reject, 2000))
      } catch (e) {
        this.recommendations.splice(index, 0, recomm)

        console.error(e)
        this.snackbar.text = 'Ups! Ocurrio un error, por favor intentalo nuevamente'
        this.snackbar.enabled = true
      }
    },
  },

  computed: {
    isTwitterConnected() {
      const conn = this.connectedProviders.find(c => c.provider === 'twitter')
      return conn && conn.lastProcessed && conn.lastProcessed.success
    }
  },

  watch: {
    'priority': {
      handler: function () {
        console.log(this.priority)
        this.loadData();
      }
    }
  },

  created() {
    const idToken = localStorage.getItem('id_token')!;

    recommApi = RecommendationsApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })

    providersApi = ProvidersApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    })

    this.loadData()
  },

  unmounted() {
    clearInterval(interval)
  }
}
</script>@/libs/user-api-sdk/api