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
        <v-row v-if="!loading">
          <v-col v-for="(recommendation, index) in recommendations" :key="recommendation.user._id" cols="4">
            <RecommendationCard :user="recommendation" @accept="acceptRecommendation(index)" @reject="rejectRecommendation(index)"></RecommendationCard>
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
import User from '@/types/user.interface'
import RecommendationCard from '@/components/recommendations/RecommendationCard.vue'
import { RecommendationsApiFactory, RecommendationsControllerGetRecommendationsPriorityEnum } from '@/libs/user-api-sdk/api'
</script>

<script lang="ts">
enum Priority {
  Compatibility = 'compatibility',
  Nearest = 'nearest',
  Activity = 'activity',
}

let recommApi: ReturnType<typeof RecommendationsApiFactory>;

export default {
  compononents: {
    RecommendationCard,
  },

  data: () => ({
    loading: true,
    snackbar: {
      enabled: false,
      text: ''
    },
    recommendations: [] as User[],
    priority: 'compatibility' as Priority,
  }),

  methods: {
    async getProfiles() {
      this.loading = true;

      const priorityMap = {
        compatibility: RecommendationsControllerGetRecommendationsPriorityEnum.Affinity,
        nearest: RecommendationsControllerGetRecommendationsPriorityEnum.Distance,
        activity: RecommendationsControllerGetRecommendationsPriorityEnum.Activity,
      }

      const res = await recommApi.recommendationsControllerGetRecommendations(
        ['distance'],
        priorityMap[this.priority],
        0,
        20
      );

      this.recommendations = res.data.recommendations as any as User[];

      console.log('First recommendation:', this.recommendations[0])

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

  watch: {
    'priority': {
      handler: function () {
        console.log(this.priority)
        this.getProfiles();
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

    this.getProfiles()
  },
}
</script>@/libs/user-api-sdk/api