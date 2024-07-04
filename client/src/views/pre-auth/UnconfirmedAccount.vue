<template>
    <v-container>
        <v-card class="my-12 mx-auto" max-width="600">
            <v-card-title class="headline">Confirma tu cuenta</v-card-title>

            <v-card-text>
                <p class="mt-3">Por favor, confirmá tu cuenta para continuar. Si ya lo has hecho, aguardá unos segundos.</p>

                <v-progress-linear indeterminate class="mt-6 mb-3"></v-progress-linear>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user';
import { AxiosError } from 'axios';

let userStore: any;

export default {
    data: () => ({
        interval: null as any,
    }),

    methods: {
        async checkConfirmation() {
            try {
                console.debug('Checking confirmation');
                
                await userStore.fetchOwnUser()

                clearInterval(this.interval);

                this.$router.push({ name: '/explore' });
            } catch (e) {
                if (e instanceof AxiosError && e.response?.status === 404) {
                    console.debug('User not confirmed yet');
                } else {
                    console.error(e);
                }
            }
        },
    },

    async created() {
        userStore = useUserStore()
        
        this.interval = setInterval(() => {
            this.checkConfirmation();
        }, 5000);
    },
}
</script>
