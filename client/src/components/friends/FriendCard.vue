<template>
    <ProfilePreviewCard :user="user" :isFriend="true" @open-chat="(interest) => openChatWithSuggestion(interest)">
        <v-badge color="error" dot offset-x="10" offset-y="10" :model-value="messageStore.newMessages.some(m => m.sender == user.user._id)">
            <v-btn icon="mdi-chat" @click="showChatDialog = true"/>
        </v-badge>

        <v-btn icon="mdi-star" @click="showRateDialog = true"/>
    </ProfilePreviewCard>

    <v-dialog v-model="showRateDialog" class="dialog-responsive" persistent>
        <v-card>
            <v-card-title>Calificá a {{ user.user.profile.name }}</v-card-title>

            <v-card-text v-if="!saving">
                <p>Por favor, calificá a esta persona para mejorar tus recomendaciones</p>
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

    <v-dialog v-model="showChatDialog" class="dialog-responsive">
        <ChatCard :user="user" :suggestedTopic="suggestedChatTopic"/>
    </v-dialog>

    <v-snackbar :timeout="2000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script lang="ts">
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'
import ChatCard from '@/components/friends/ChatCard.vue'
import { RatesApiFactory } from 'user-api-sdk';
import type User from '@/types/user.interface';
import type { PropType } from 'vue';
import { useMessageStore } from '@/stores/messages';
import { type SharedInterestDto } from 'user-api-sdk';

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
            suggestedChatTopic: "",
            saving: false,
            rating: this.user.user.rating,
            snackbar: {
                enabled: false,
                text: '',
            },
            messageStore: useMessageStore()
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

        async openChatWithSuggestion(interest: SharedInterestDto) {
            this.suggestedChatTopic = interest.resource.name;
            console.log("Opening chat with", this.user.user._id, interest);
            this.showChatDialog = true;
        },
    },

    created() {
        const idToken = localStorage.getItem('id_token')!;

        ratesApi = RatesApiFactory({
            basePath: import.meta.env.VITE_API_URL,
            accessToken: () => idToken,
            isJsonMime: () => true,
        });

        if (this.$route.path.includes('chat') && this.$route.params.userId == this.user.user._id) {
            // console.log('showing chat dialog');
            this.showChatDialog = true;
        } else {
            this.showChatDialog = false;
        }

        if (this.$route.path.includes('rate') && this.$route.params.userId == this.user.user._id) {
            this.showRateDialog = true;
        } else {
            this.showRateDialog = false;
        }
    },

    watch: {
        $route(to, from) {
            if (to.path.includes('chat') && to.params.userId == this.user.user._id) {
                this.showChatDialog = true;
            } else {
                this.showChatDialog = false;
            }

            if (to.path.includes('rate') && to.params.userId == this.user.user._id) {
                this.showRateDialog = true;
            } else {
                this.showRateDialog = false;
            }
        },
        showChatDialog(val) {
            if (val) {
                this.$router.push(`/friends/${this.user.user._id}/chat`)
            } else {
                this.$router.push('/friends');
                this.suggestedChatTopic = "";
            }
        },
        showRateDialog(val) {
            if (val) {
                this.$router.push(`/friends/${this.user.user._id}/rate`)
            } else {
                this.$router.push('/friends');
            }
        }
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
</style>user-api-sdk