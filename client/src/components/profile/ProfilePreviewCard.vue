<template>
    <v-card class="mx-auto my-12" max-width="474">
        <div class="media" @click="showDialog = true">
            <v-avatar class="mt-8 mb-8" size="150">
                <v-img :src="getPictureUrl(user.user._id)" contain>
                    <template #error>
                        <v-img :src="avatar" contain />
                    </template>
                </v-img>
            </v-avatar>
        </div>

        <v-card-item>
            <v-card-title>{{ user.user.profile.name }}</v-card-title>

            <div class="mt-2">
                <v-chip>{{ presentation.genderIcons[ user.user.profile.gender as "man" | "woman" | "other"]}}</v-chip>
                <v-chip class="ml-2">{{ user.user.profile.age }} y</v-chip>
                <v-chip class="ml-2">{{ user.user.distance }} km</v-chip>
                <v-chip class="ml-2">Activo hace {{ user.user.inactiveHours }} hs</v-chip>
            </div>
        </v-card-item>

        <v-card-text>
            <div>{{ user.user.profile.biography }}</div>
        </v-card-text>

        <v-divider class="mx-4 mb-1"></v-divider>

        <template v-if="user.score">
            <v-card-title>Afinidad</v-card-title>

            <div class="px-4">
                <v-list>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-star</v-icon>
                                </template>
                                <span>Afinidad general</span>
                            </v-tooltip>
                        </template>

                        <v-progress-linear :model-value="user.score.global * 100" height="6"></v-progress-linear>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-account-multiple</v-icon>
                                </template>
                                <span>Afinidad de amistad</span>
                            </v-tooltip>
                        </template>

                        <v-progress-linear :model-value="user.score.friendship.score * 100" height="6"></v-progress-linear>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props">mdi-music</v-icon>
                                </template>
                                <span>Afinidad de intereses</span>
                            </v-tooltip>
                        </template>
                        
                        <v-progress-linear :model-value="user.score.interests.score * 100" height="6"></v-progress-linear>
                    </v-list-item>
                </v-list>
            </div>
        </template>

        <v-card-actions>
            <slot></slot>
        </v-card-actions>
    </v-card>

    <v-dialog v-model="showDialog" max-width="50%">
        <ProfileDetailCard :user="user" />
    </v-dialog>
</template>

<script lang="ts">
import ProfileDetailCard from '@/components/profile/ProfileDetailCard.vue'
import type User from '@/types/user.interface'
import type { PropType } from 'vue';
import _avatar from "@/assets/avatar.png"

export default {
    components: {
        ProfileDetailCard,
    },

    props: {
        user: {
            type: Object as PropType<User>,
            required: true
        },
    },

    data() {
        return {
            presentation: {
                genderIcons: {
                    'man': '♂',
                    'woman': '♀',
                    'other': '⚲',
                }
            },
            showDialog: false,
            avatar: _avatar
        }
    },

    methods: {
        getPictureUrl(userId: string) {
            return `${import.meta.env.VITE_USER_PICTURES_BUCKET_URL}/${userId}`;
        }
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
</style>