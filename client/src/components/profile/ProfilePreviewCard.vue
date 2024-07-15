<template>
    <v-card class="mx-auto">
        <div @click="showDialog = true">
            <div class="media" @click="showDialog = true">
                <v-avatar class="mt-8 mb-8" size="150">
                    <v-img :src="getPictureUrl(user.user._id)" contain>
                        <template #error>
                            <v-img :src="avatar" contain />
                        </template>
                    </v-img>
                </v-avatar>
            </div>

            <v-card-item @click="showDialog = true">
                <v-card-title>{{ user.user.profile.name }}</v-card-title>

                <div class="mt-2">          
                    <v-tooltip location="end">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props">{{ presentation.genderIcons[ user.user.profile.gender as "man" | "woman" | "other"]}}</v-chip>
                        </template>
                        <span>Género</span>
                    </v-tooltip>

                    <v-tooltip location="end">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" class="ml-2">{{ user.user.profile.age }} años</v-chip>
                        </template>
                        <span>Edad</span>
                    </v-tooltip>

                    <v-tooltip location="end">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" class="ml-2" v-if="user.user.distance">{{ user.user.distance }} km</v-chip>
                        </template>
                        <span>Distancia</span>
                    </v-tooltip>
                    
                    <v-tooltip location="end">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" class="ml-2">{{ inactiveHoursText(user.user.inactiveHours) }}</v-chip>
                        </template>
                        <span>Activo hace</span>
                    </v-tooltip>

                    <v-tooltip location="end">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" v-if="user.user.isFake" class="ml-2">🤖</v-chip>
                        </template>
                        <span>El usuario es un bot</span>
                    </v-tooltip>                
                </div>
            </v-card-item>

            <v-card-text @click="showDialog = true">
                <div>{{ user.user.profile.biography }}</div>
            </v-card-text>

            <v-divider class="mx-4 mb-1" @click="showDialog = true"></v-divider>

            <template v-if="user.score">
                <v-card-title>Afinidad</v-card-title>

                <div class="px-4">
                    <v-list>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-tooltip location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-icon v-bind="props">mdi-star</v-icon>
                                    </template>
                                    <span>Afinidad general</span>
                                </v-tooltip>
                            </template>

                            <v-tooltip location="top">
                                <template v-slot:activator="{ props }">
                                    <v-progress-linear :model-value="user.score.global * 100" height="6" v-bind="props"></v-progress-linear>
                                </template>
                                <span>{{Math.round(user.score.global * 10000) / 100 }}%</span>
                            </v-tooltip>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-tooltip location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-icon v-bind="props">mdi-account-multiple</v-icon>
                                    </template>
                                    <span>Afinidad de amistad</span>
                                </v-tooltip>
                            </template>

                            <v-tooltip location="top">
                                <template v-slot:activator="{ props }">
                                    <v-progress-linear :model-value="user.score.friendship.score * 100" height="6" v-bind="props"></v-progress-linear>
                                </template>
                                <span>{{Math.round(user.score.friendship.score * 10000) / 100 }}%</span>
                            </v-tooltip>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-tooltip location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-icon v-bind="props">mdi-music</v-icon>
                                    </template>
                                    <span>Afinidad de intereses</span>
                                </v-tooltip>
                            </template>
                            
                            <v-tooltip location="top">
                                <template v-slot:activator="{ props }">
                                    <v-progress-linear :model-value="user.score.interests.score * 100" height="6" v-bind="props"></v-progress-linear>
                                </template>
                                <span>{{Math.round(user.score.interests.score * 10000) / 100 }}%</span>
                            </v-tooltip>
                        </v-list-item>
                    </v-list>
                </div>
            </template>
        </div>

        <v-card-actions>
            <slot></slot>
        </v-card-actions>
    </v-card>

    <v-dialog v-model="showDialog" class="dialog-responsive">
        <ProfileDetailCard :user="user" :isFriend="isFriend"  @open-chat="openChatWithSuggestion"/>
    </v-dialog>
</template>

<script lang="ts">
import ProfileDetailCard from '@/components/profile/ProfileDetailCard.vue'
import type User from '@/types/user.interface'
import type { PropType } from 'vue';
import _avatar from "@/assets/avatar.png"
import '@/styles/styles.css';

export default {
    components: {
        ProfileDetailCard,
    },

    props: {
        user: {
            type: Object as PropType<User>,
            required: true
        },
        isFriend: {
            type: Boolean,
            required: false,
            default: false
        },
    },

    emits: ['open-chat'],

    data() {
        return {
            presentation: {
                genderIcons: {
                    'man': '👨🏻',
                    'woman': '👩🏻',
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
        },

        inactiveHoursText(inactiveHours: number) {
            if (inactiveHours < 1) {
                const minutes = Math.floor(inactiveHours * 60);
                return `${minutes} ${minutes != 1 ? "minutos" : "minuto"}`;
            } else if (inactiveHours < 24) {
                return `${inactiveHours} hs`;
            } else {
                const days = Math.floor(inactiveHours / 24);
                return `${days} ${days != 1 ? "días" : "día"}`;
            }
        },

        async openChatWithSuggestion(interest: any) {
            this.showDialog=false;
            // TODO: This is a workaround to avoid the chat dialog to be opened before the profile dialog is closed,
            // otherwise it will fail, but this solution should be improved.
            await new Promise(resolve => setTimeout(resolve, 500));
            this.$emit('open-chat', interest)
        }
    },

    created() {
        if (this.$route.path.includes('profile') && this.$route.params.userId == this.user.user._id) {
            this.showDialog = true;
        }
    },

    watch: {
        $route(to, from) {
            if (to.path.includes('profile') && to.params.userId == this.user.user._id) {
                this.showDialog = true;
            } else {
                this.showDialog = false;
            }
        },
        showDialog(val) {
            const currBasePath = this.$route.path.split('/')[1];
            if (val) {
                this.$router.push(`/${currBasePath}/${this.user.user._id}/profile`)
            } else {
                this.$router.push(`/${currBasePath}`);
            }
        },
    }
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