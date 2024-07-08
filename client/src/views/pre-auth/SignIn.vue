<template>
    <div class="background">
        <v-row justify="center" align="center" class="fill-height text-center">
            <template v-if="state === 'signed_out'">
                <v-col cols="12" class="text-center">  
                    <v-img :src="image" max-height="100px" class="mb-4"></v-img>

                    <p class="text-h5 font-weight-bold my-16" style="color: white; font-family: monospace">
                        ¡Bienvenido a MindHub!
                    </p>

                    <v-btn color="white" dark large style="width: 200px" @click="startLogin">
                        Iniciar sesión
                    </v-btn>
                </v-col>
            </template>

            <template v-else-if="state === 'exchanging_code'">
                <v-progress-circular indeterminate color="white" size="64" />
            </template>
        </v-row>
    </div>

    <v-snackbar :timeout="5000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script lang="ts">
import { signInWithCode } from '@/libs/cognito';
import _image from "@/assets/person-light.png"
import { useMessageStore } from '@/stores/messages';
import { useNotificationsStore } from '@/stores/notifications';
import { NotificationsApiFactory } from 'user-api-sdk';

const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default {
    data: () => ({
        state: 'signed_out',
        snackbar: {
            enabled: false,
            text: ''
        },
        image: _image
    }),

    methods: {
        startLogin() {
            window.location.href = `${import.meta.env.VITE_COGNITO_URL}/login`
                + `?client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}`
                + `&redirect_uri=${window.location.origin}`
                + `&response_type=code`
        },

        async postLogin() {
            // This is to remove the code query param from the URL, since it came as a query param
            // and we are using hash history mode, it wont be removed when moving to another route
            window.history.replaceState({}, document.title, window.location.pathname);

            let useWebPush = false;
            try {
                await this.subscribeClientToWebpush();
                useWebPush = true;
                // console.log("Webpush subscription successful")
            } catch (error) {
                console.error('Failed to subscribe client to webpush', error);
            }
            localStorage.setItem('useWebPush', useWebPush.toString());

            // These methods are called on App creation, but if user was not
            // logged in, they do nothing, so we must call them here too.

            useMessageStore().setup(useWebPush);
            useNotificationsStore().setup(useWebPush);

            this.$router.push('/explore');
        },

        async subscribeClientToWebpush() {
            const idToken = localStorage.getItem('id_token')!;

            const notificationsApi = NotificationsApiFactory({
                basePath: import.meta.env.VITE_API_URL,
                accessToken: () => idToken,
                isJsonMime: () => true,
            });

            // console.log('Initialized notifications API')

            const register = await navigator.serviceWorker.register('/notifications-worker.js', {
                scope: '/'
            });

            // console.log('Registered notifications worker', register);

            const applicationServerKey = urlB64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)

            const res = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });
            const subscription = res.toJSON();

            // console.log('Suscribed client to webpush API', subscription)

            await notificationsApi.notificationsControllerSaveWebPushSubscription({
                webPushSubscription: {
                endpoint: subscription.endpoint!,
                keys: {
                    p256dh: subscription.keys!.p256dh,
                    auth: subscription.keys!.auth
                }
                }
            });

            // console.log('Sent subscription information to server')
        },
    },

    async mounted() {
        const error = new URL(window.location.href).searchParams.get('error');
        if (error) {
            const error_desc = new URL(window.location.href).searchParams.get('error_description');
            console.error('Cognito redirected with an error', {
                error, error_desc
            });

            this.state = 'signed_out';
            this.snackbar.text = 'Ups! Algo salió mal, por favor volvé a intentarlo'
            this.snackbar.enabled = true
        }

        const code = new URL(window.location.href).searchParams.get('code');
        if (code) {
            this.state = 'exchanging_code'

            try {
                // console.log('Exchanging code for token')

                await signInWithCode(code);

                await this.postLogin();
            } catch (error) {
                console.error('Failed to exchange code for token',error);

                this.state = 'signed_out';
                this.snackbar.text = 'Ups! Algo salió mal, por favor volvé a intentarlo'
                this.snackbar.enabled = true
            }
            return;
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