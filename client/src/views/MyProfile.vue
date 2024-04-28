<template>
    <v-container>
        <v-card v-if="state == 'loading'" class="mx-auto" max-width="600">
            <v-card-title class="headline">Cargando</v-card-title>

            <v-card-text>
                <v-progress-linear indeterminate></v-progress-linear>
            </v-card-text>
        </v-card>

        <v-card v-else-if="state == 'create'" class="mx-auto" max-width="600">
            <v-card-title class="headline">Crea tu perfil</v-card-title>

            <v-card-subtitle>Por favor, completa tus datos para finalizar la creacion de tu cuenta</v-card-subtitle>

            <v-card-text>
                <v-form ref="form">
                    <v-select label="Genero" v-model="gender" :items="presentation.genders" item-title="title"
                        item-value="value"></v-select>

                    <v-menu v-model="showDatePicker" :close-on-content-click="false">
                        <template v-slot:activator="{ props }">
                            <v-text-field v-model="formattedBirthday" label="Fecha de nacimiento" readonly
                                v-bind="props"></v-text-field>
                        </template>
                        <v-date-picker v-model="birthday" no-title @input="showDatePicker = false"></v-date-picker>
                    </v-menu>

                    <v-textarea label="Biografia" v-model="biography"></v-textarea>

                    <v-btn v-if="!saving" @click="save">Continuar</v-btn>
                    <v-progress-circular v-else indeterminate color="white"></v-progress-circular>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card v-else-if="state == 'edit'" class="mx-auto" max-width="600">
            <v-card-title class="headline">Edita tu perfil</v-card-title>

            <v-card-text>
                <v-form ref="form">
                    <v-text-field label="Nombre" :model-value="name" readonly></v-text-field>

                    <v-select label="Genero" v-model="gender" :items="presentation.genders" item-title="title"
                        item-value="value"></v-select>

                    <v-menu v-model="showDatePicker" :close-on-content-click="false">

                        <template v-slot:activator="{ props }">
                            <v-text-field v-model="formattedBirthday" label="Fecha de nacimiento" readonly
                                v-bind="props"></v-text-field>
                        </template>
                        <v-date-picker v-model="birthday" no-title @input="showDatePicker = false"></v-date-picker>
                    </v-menu>

                    <v-textarea label="Biografia" v-model="biography"></v-textarea>

                    <v-btn v-if="!saving" @click="save">Guardar</v-btn>
                    <v-progress-circular v-else indeterminate color="white"></v-progress-circular>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card v-else class="mx-auto" max-width="600">
            <v-card-title class="headline">Lo sentimos</v-card-title>

            <v-card-text>
                Ha ocurrido un error
            </v-card-text>
        </v-card>
    </v-container>

    <v-snackbar :timeout="2000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script>
import { UsersApiFactory } from '@/libs/user-api-sdk/api';
import axios from 'axios';

let userApi;

export default {
    data: () => ({
        state: 'loading',
        saving: false,
        showDatePicker: null,

        name: null,
        gender: null,
        birthday: null,
        biography: null,

        presentation: {
            genders: [
                { title: 'Hombre', value: 'man' },
                { title: 'Mujer', value: 'woman' },
                { title: 'Otro', value: 'other' }
            ]
        },

        snackbar: {
            enabled: false,
            text: ''
        },
    }),

    computed: {
        formattedBirthday() {
            return this.birthday ? new Date(this.birthday).toLocaleDateString('en-GB') : null;
        }
    },

    methods: {
        async save() {
            this.saving = true;

            await userApi.usersControllerUpdateProfile({
                gender: this.gender,
                birthday: this.birthday,
                biography: this.biography
            });
            
            localStorage.setItem('completed_profile', true);

            this.saving = false;
            this.snackbar.text = 'Perfil actualizado';
            this.snackbar.enabled = true;
        }
    },

    async created() {
        const idToken = localStorage.getItem('id_token');
        userApi = UsersApiFactory({
            basePath: 'http://localhost:3000',
            accessToken: () => idToken,
            isJsonMime: () => true,
        });
    },

    async mounted() {
        this.state = 'loading';

        try {
            const res = await userApi.usersControllerGetOwnUser();

            this.name = res.data.profile.name;
            this.gender = res.data.profile.gender;
            this.birthday = new Date(res.data.profile.birthday);
            this.biography = res.data.profile.biography;

            this.state = 'edit';
        } catch (error) {
            if (axios.isAxiosError(error) && error.response.status === 404) {
                this.state = 'create';
            } else {
                console.error(error);
                this.snackbar.text = 'Ha ocurrido un error.'
                this.snackbar.enabled = true
                this.state = 'error';
            }
        }
    }
}
</script>
@/libs/user-api-sdk/api