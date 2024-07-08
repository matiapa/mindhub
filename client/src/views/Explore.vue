<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="2" class="floating-card">
        <v-card rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-2">
              Ordernar por
            </h2>

            <v-chip-group v-model="sortBy" column>
              <v-chip value="compatibility">Similaridad</v-chip>

              <v-chip value="nearest">Cercanía</v-chip>

              <v-chip value="activity">Actividad</v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" v-if="generationDate" class="mt-6">
          <v-card-text>
            Actualizadas el {{ generationDate.toLocaleString("es-ES", {hour12: false}) }}
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="12" lg="10">
          <v-row v-if="recommendations.length">
            <v-col v-for="(recommendation, index) in recommendations" :key="recommendation.user._id" cols="12" md="6" lg="4">
              <RecommendationCard :user="recommendation" @accept="acceptRecommendation(index)" @reject="rejectRecommendation(index)"></RecommendationCard>
            </v-col>
          </v-row>

          <div ref="loadMore"></div>

          <v-row v-if="loading" align="center" justify="center">
            <v-col cols="auto">
              <v-progress-circular class="mt-8" indeterminate size="64" />
            </v-col>
          </v-row>

          <v-row v-if="!loading && !recommendations.length" class="mt-4 justify-center">
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
      </v-col>
    </v-row>
  </v-container>

  <v-snackbar :timeout="2000" v-model="snackbar.enabled">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
import type User from '@/types/user.interface'
import RecommendationCard from '@/components/recommendations/RecommendationCard.vue'
import { RecommendationsApiFactory, RecommendationsControllerGetRecommendationsPriorityEnum, UsersApiFactory, ProvidersApiFactory } from 'user-api-sdk/api'
import type ProviderConnection from '@/types/provider.interface';
import '@/styles/styles.css';
</script>

<script lang="ts">
let providersApi: ReturnType<typeof ProvidersApiFactory>;

enum SortBy {
  Compatibility = 'compatibility',
  Nearest = 'nearest',
  Activity = 'activity',
}

let recommApi: ReturnType<typeof RecommendationsApiFactory>;

let interval: any;

const recommendationsPerScroll = 12;

const sortMap = {
  compatibility: RecommendationsControllerGetRecommendationsPriorityEnum.Affinity,
  nearest: RecommendationsControllerGetRecommendationsPriorityEnum.Distance,
  activity: RecommendationsControllerGetRecommendationsPriorityEnum.Activity,
}

let usersApi: ReturnType<typeof UsersApiFactory>;

export default {
  compononents: {
    RecommendationCard,
  },

  data: () => ({
    sortBy: 'compatibility' as SortBy,
    loading: true,
    recommendations: [] as User[],
    generationDate: null as Date | null,
    page: 0,
    connectedProviders: [] as ProviderConnection[],
    observer: null as IntersectionObserver | null,
    snackbar: {
      enabled: false,
      text: ''
    },
  }),

  methods: {
    async loadRecommendations() {
      this.loading = true;

      // console.log('Getting recommendations', this.page * recommendationsPerScroll, recommendationsPerScroll)

      const res = await recommApi.recommendationsControllerGetRecommendations(
        ['distance'],
        sortMap[this.sortBy],
        this.page * recommendationsPerScroll,
        recommendationsPerScroll
      );

      if (res.data.recommendations.length > 0) {
        this.recommendations.push(...res.data.recommendations as any as User[]);
        this.generationDate = new Date(res.data.recommendations[0].generatedAt);
      }

      this.page += 1;

      this.loading = false
    },

    async loadData() {
      await this.loadRecommendations();

      if (this.recommendations.length === 0 && this.isTwitterConnected) {
        // Recommendations are being generated, check them every 5 seconds
        interval = setInterval(async () => {
          console.log('Checking for recommendations')

          const res = await recommApi.recommendationsControllerGetRecommendations(
            ['distance'],
            sortMap[this.sortBy],
            this.page * recommendationsPerScroll,
            recommendationsPerScroll
          );
          this.recommendations = res.data.recommendations as any as User[];

          if (this.recommendations.length > 0) {
            clearInterval(interval)
          }
        }, 5000)
      }

      const res = await providersApi.connectionsControllerGetConnections();
      this.connectedProviders = res.data.connections;
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

    handleIntersect(entries: any) {
      const entry = entries[0];
      if (entry.isIntersecting && !this.loading) {
        this.loadRecommendations();
      }
    },

    async updateLastConnection() {
      // In some browsers the getCurrentPosition method doesn't trigger the error callback
      // so we need to update the connection first and then if location is available
      // update it again with that information

      await usersApi.usersControllerUpdateLastConnection({})

      if (navigator.geolocation) {
        // console.log('Getting location')

        navigator.geolocation.getCurrentPosition(this.handleLocationSuccess, this.handleLocationError);
      } else {
        console.log('Geolocation is not supported by this browser.');
        this.snackbar.text = "No pudimos obtener tu ubicación, no se mostrarán usuarios cercanos.";
        this.snackbar.enabled = true;

        await usersApi.usersControllerUpdateLastConnection({})
      }
    },

    async handleLocationSuccess(position: GeolocationPosition) {
      // console.log('Got location', position);

      await usersApi.usersControllerUpdateLastConnection({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    },

    async handleLocationError(error: GeolocationPositionError) {
      console.log('Error getting location', error.code, error.message)

      switch(error.code) {
        case error.PERMISSION_DENIED:
          this.snackbar.text = "No podremos mostrarte usuarios cercanos si no nos das permiso para acceder a tu ubicación.";
          this.snackbar.enabled = true;
          break;
        case error.POSITION_UNAVAILABLE:
        case error.TIMEOUT:
          this.snackbar.text = "No pudimos obtener tu ubicación, no se mostrarán usuarios cercanos.";
          this.snackbar.enabled = true;
          break;
      }
    }
  },

  computed: {
    isTwitterConnected() {
      const conn = this.connectedProviders.find(c => c.provider === 'twitter')
      return conn && conn.lastProcessed && conn.lastProcessed.success
    }
  },

  watch: {
    'sortBy': {
      handler: function () {
        this.recommendations = [];
        this.page = 0;
        this.loadRecommendations();
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

    usersApi = UsersApiFactory({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: () => idToken,
      isJsonMime: () => true,
    });

    this.loadData()
  },

  mounted() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      };
    this.observer = new IntersectionObserver(this.handleIntersect, options);
    this.observer.observe(this.$refs.loadMore as any);

    this.updateLastConnection();
  },

  unmounted() {
    clearInterval(interval)
  }
}
</script>
