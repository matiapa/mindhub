<template>
    <div class="background">
        <v-row justify="center" align="center" class="fill-height text-center">
            <template v-if="state === 'signed_out'">
                <v-col cols="12" class="text-center">  
                    <v-img src="@/assets/person-light.png" max-height="100px" class="mb-4"></v-img>

                    <p class="text-h5 font-weight-bold my-16" style="color: white; font-family: monospace">
                        ¡Bienvenido a MindHub!
                    </p>

                    <v-btn color="white" dark large style="width: 200px" @click="login">
                        Iniciar sesión
                    </v-btn>
                </v-col>
            </template>

            <template v-else-if="state === 'exchanging_code'">
                <v-progress-circular indeterminate color="white" size="64" />
            </template>
        </v-row>
    </div>

    <v-snackbar :timeout="2000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script>
import { signInWithCode } from '@/libs/cognito';

export default {
    data: () => ({
        state: 'signed_out',
        snackbar: {
            enabled: false,
            text: ''
        },
    }),

    methods: {
        login() {
            window.location.href = `${import.meta.env.VITE_COGNITO_URL}/login`
             + `?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}`
             + `&redirect_uri=${import.meta.env.VITE_APP_URL}`
             + `&response_type=code`
        }
    },

    async mounted() {
        const code = new URL(window.location.href).searchParams.get('code');
        if (code) {
            this.state = 'exchanging_code'

            try {
                await signInWithCode(code);
                this.$router.push('/explore');
            } catch (error) {
                console.error(error);

                this.state = 'signed_out';
                this.snackbar.text = 'Error logging in. Please try again.'
                this.snackbar.enabled = true
            }
        }
    },
}
</script>

<style scoped>
@keyframes animateBanner {
    0% {
        background-position: 0% 0%;
    }

    100% {
        background-position: 100% 100%;
    }
}

.background {
    /* animation: animateBanner 30s linear infinite; */
    background: url('@/assets/banner.png') no-repeat;
    background-size: cover;
    width: 100vw;
    height: 100vh;
}
</style>