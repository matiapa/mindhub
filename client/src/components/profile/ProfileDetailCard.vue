<template>
    <v-card>
        <!------------------------------- Perfil ----------------------------->

        <div>
            <div class="media">
                <v-avatar class="mt-8 mb-8" size="150">
                    <v-img :src="getPictureUrl(userData.user._id)" contain>
                        <template #error>
                            <v-img src="@/assets/avatar.png" contain />
                        </template>
                    </v-img>
                </v-avatar>
            </div>

            <v-card-item>
                <v-card-title>{{ userData.user.profile.name }}</v-card-title>

                <div class="mt-2">
                    <v-chip>{{ presentation.genderIcons[userData.user.profile.gender] }}</v-chip>
                    <v-chip class="ml-2">{{ userData.user.profile.age }} y</v-chip>
                    <v-chip class="ml-2">{{ userData.user.distance }} km</v-chip>
                    <v-chip class="ml-2">Activo hace {{ userData.user.inactiveHours }} hs</v-chip>
                </div>
            </v-card-item>

            <v-card-text>
                <div>{{ userData.user.profile.biography }}</div>
            </v-card-text>
        </div>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!------------------------------- Afinidad ----------------------------->

        <v-card-title>Afinidad</v-card-title>

        <div>
            <div class="px-4" v-if="userData.score">
                <v-list>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-account</v-icon>
                                </template>
                                <span>Afinidad general</span>
                            </v-tooltip>
                        </template>

                        <v-progress-linear :model-value="userData.score.global * 100" height="6"></v-progress-linear>

                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                <v-icon v-bind="props">mdi-information</v-icon>
                                </template>
                                <span>Nivel de afinidad general con {{ userData.user.profile.name }}</span>
                            </v-tooltip>
                        </template>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-emoticon-happy</v-icon>
                                </template>
                                <span>Afinidad de amistad</span>
                            </v-tooltip>
                        </template>

                        <v-progress-linear :model-value="userData.score.friendship.score * 100" height="6"></v-progress-linear>

                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                <v-icon v-bind="props">mdi-information</v-icon>
                                </template>
                                <span>Nivel de afinidad de amistad con {{ userData.user.profile.name }}</span>
                            </v-tooltip>
                        </template>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-multimedia</v-icon>
                                </template>
                                <span>Afinidad de intereses</span>
                            </v-tooltip>
                        </template>

                        <v-progress-linear :model-value="userData.score.interests.score * 100" height="6"></v-progress-linear>

                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                <v-icon v-bind="props">mdi-information</v-icon>
                                </template>
                                <span>Nivel de afinidad de intereses con {{ userData.user.profile.name }}</span>
                            </v-tooltip>
                        </template>
                    </v-list-item>
                </v-list>
            </div>
            <div class="center-container mb-4" v-else>
                <v-progress-circular indeterminate />
            </div>
        </div>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!------------------------------- Personalidad ----------------------------->

        <v-card-title>Personalidad</v-card-title>

        <div>
            <div class="px-4" v-if="userData.user.personality">
                <PersonalityCard :personality="userData.user.personality" />
            </div>
            <div class="center-container mb-4" v-else>
                <v-progress-circular indeterminate />
            </div>
        </div>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!------------------------------- Intereses comunes ----------------------------->

        <v-card-title>Intereses comunes</v-card-title>

        <div>
            <div class="px-4" v-if="userData.user.sharedInterests">
                <v-expansion-panels>
                    <v-expansion-panel v-for="category in presentation.interestCategories" :key="category.key">
                        <v-expansion-panel-title>{{ category.title }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-list v-if="sharedInterests(category.key).length">
                                <v-list-item v-for="interest in sharedInterests(category.key)" :key="interest.id">
                                    <template v-slot:prepend>
                                        <v-avatar>
                                            <img v-if="interest.resource.pictureUrl" :src="interest.resource.pictureUrl">
                                        </v-avatar>
                                    </template>
                                    <template v-slot:title>
                                        {{ interest.resource.name }}
                                    </template>
                                    <template v-slot:append>
                                        <v-btn flat icon="mdi-open-in-new" :href="getResourceUrl(interest.resource.id, category.key)" target="_blank"/>
                                    </template>
                                </v-list-item>
                            </v-list>
                            <p v-else>No tienen intereses en común en esta categoría</p>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
            <div class="center-container mb-4" v-else>
                <v-progress-circular indeterminate />
            </div>
        </div>
    </v-card>
</template>

<script lang="ts">
import PersonalityCard from '@/components/PersonalityCard.vue'
import { UsersApiFactory } from '@/libs/user-api-sdk';

let usersApi: ReturnType<typeof UsersApiFactory>;

export default {
    components: {
        PersonalityCard
    },

    props: {
        user: Object,
    },

    data() {
        return {
            presentation: {
                genderIcons: {
                    'man': '♂',
                    'woman': '♀',
                    'other': '⚲',
                },
                interestCategories: [
                    { key: 'artist', title: 'Artistas' },
                    { key: 'track', title: 'Canciones' },
                ]
            },
            userData: {} as any,
        }
    },

    methods: {
        async getUserSharedData() {
            const missingFields = [];

            if (!this.userData.user.distance) missingFields.push('distance');
            if (!this.userData.user.sharedInterests) missingFields.push('sharedInterests');
            if (!this.userData.user.personality) missingFields.push('personality');
            // if (!this.userData.user.rating) missingFields.push('rating');

            if (!missingFields.length) return;
            console.log('Completing the following fields', missingFields)

            try {
                const res = await usersApi.usersControllerGetById(this.userData.user._id, missingFields);

                this.userData.user.distance = res.data.distance;
                this.userData.user.sharedInterests = res.data.sharedInterests;
                this.userData.user.personality = res.data.personality;
                // this.userData.user.rating = res.data.rating;
            } catch (error) {
                console.error('Error fetching user shared data', error);
            }
        },

        sharedInterests(category: string) {
            return this.userData.user.sharedInterests.filter((i: any) => i.resource.type === category)
        },
        getPictureUrl(userId: string) {
            return `${import.meta.env.VITE_USER_PICTURES_BUCKET_URL}/${userId}`;
        },
        getResourceUrl(resourceId: string, resourceType: string) {
            if (resourceType === 'artist') {
                return `https://open.spotify.com/artist/${resourceId}`;
            } else if (resourceType === 'track') {
                return `https://open.spotify.com/track/${resourceId}`;
            }
        }
    },

    created() {
      const idToken = localStorage.getItem('id_token')!;

      usersApi = UsersApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
      })

      // NOTE: This deep copy is necessary to avoid reactivity issues
      this.userData = JSON.parse(JSON.stringify(this.user))

      this.getUserSharedData()
    },
}
</script>

<style scoped>
.media {
  background-image: url('@/assets/banner.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* adjust as needed */
}
</style>
@/libs/user-api-sdk