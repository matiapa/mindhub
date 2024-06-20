<template>
    <ProfilePreviewCard :user="user">
        <v-btn icon="mdi-chat" @click="chat"/>
        <v-btn icon="mdi-star" @click="showRateDialog = true"/>
    </ProfilePreviewCard>

    <v-dialog v-model="showRateDialog" max-width="50%" persistent>
        <v-card>
            <v-card-title>Califica a {{ user.user.profile.name }}</v-card-title>

            <v-card-text v-if="!saving">
                <p>Por favor, califica a esta persona para mejorar nuestras recomendaciones</p>
                <v-rating v-model="rating" color="amber" class="mt-4"></v-rating>
            </v-card-text>

            <v-card-text v-else>
                <v-progress-circular indeterminate color="amber"></v-progress-circular>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="rate" :disabled="saving">Calificar</v-btn>
                <v-btn @click="cancel" :disabled="saving">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showChatDialog" max-width="50%">
        <ChatCard :user="user"/>
    </v-dialog>

    <v-snackbar :timeout="2000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script lang="ts">
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'
import ChatCard from '@/components/friends/ChatCard.vue'
import { RatesApiFactory } from '@/libs/user-api-sdk';
import type User from '@/types/user.interface';
import type { PropType } from 'vue';

let ratesApi: ReturnType<typeof RatesApiFactory>;

export default {
    components: {
        ProfilePreviewCard,
        ChatCard,
    },

    props: {
        user: {
            type: Object as PropType<User>,
            required: true
        },
    },

    data() {
        return {
            showRateDialog: false,
            showChatDialog: false,
            saving: false,
            rating: this.user.user.rating,
            snackbar: {
                enabled: false,
                text: '',
            },
        }
    },

    methods: {
        async rate() {
            this.saving = true;

            try {
                if (!this.rating) return;

                await ratesApi.ratesControllerPostRate({
                    rating: this.rating,
                    rateeId: this.user.user._id,
                });

                this.saving = false;
                this.showRateDialog = false;

                this.snackbar.text = 'Calificación exitosa';
                this.snackbar.enabled = true;
            } catch (e) {
                this.rating = this.user.user.rating;
                this.saving = false;

                console.error(e);
                this.snackbar.text = 'Ups! Ocurrió un error, por favor intentalo nuevamente';
                this.snackbar.enabled = true;
            }
        },

        cancel() {
            this.rating = this.user.user.rating;
            this.showRateDialog = false;
        },

        chat () {
            this.showChatDialog = true;
        }
    },

    created() {
        const idToken = localStorage.getItem('id_token')!;

        ratesApi = RatesApiFactory({
            basePath: import.meta.env.VITE_API_URL,
            accessToken: () => idToken,
            isJsonMime: () => true,
        });
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
</style>@/libs/user-api-sdk