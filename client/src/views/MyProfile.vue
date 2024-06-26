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
            <v-card-title v-if="firstCompletion" class="headline">Completa tu perfil</v-card-title>
            <v-card-title v-else class="headline">Edita tu perfil</v-card-title>

            <v-card-text>
                <v-form ref="form">
                    <v-row class="my-3">
                        <v-col cols="12" md="6">
                            <v-img :src="pictureUrl" aspect-ratio="1" height="150px" contain>
                                <template #error>
                                    <v-img :src="avatar" contain />
                                </template>
                            </v-img>
                        </v-col>
                        <v-col cols="12" md="6" class="align-self-center">
                            <v-file-input v-model="selectedFile" label="Foto de perfil" accept="image/*"></v-file-input>
                        </v-col>
                    </v-row>

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

<script lang="ts">
import { UsersApiFactory } from '@/libs/user-api-sdk/api';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import _avatar from "@/assets/avatar.png"
import { jwtDecode } from 'jwt-decode';

let usersApi: ReturnType<typeof UsersApiFactory>;

export default {
    data: () => ({
        state: 'loading',
        saving: false,
        showDatePicker: false,

        name: '',
        gender: 'man' as 'man' | 'woman' | 'other',
        birthday: null as Date | null,
        biography: '',
        avatar: _avatar,
        pictureUrl: _avatar,
        selectedFile: null as any,

        presentation: {
            genders: [
                { title: 'Hombre', value: 'man' },
                { title: 'Mujer', value: 'woman' },
                { title: 'Otro', value: 'other' }
            ]
        },

        firstCompletion: false,

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
        async loadData() {
            this.state = 'loading';

            try {
                const ownUser = await useUserStore().fetchOwnUser();

                this.name = ownUser.profile.name;
                this.gender = ownUser.profile.gender;
                this.birthday = ownUser.profile.birthday ? new Date(ownUser.profile.birthday) : null;
                this.biography = ownUser.profile.biography ?? "";

                const idToken = localStorage.getItem('id_token')!;
                const ownUserId = jwtDecode(idToken).sub;
                this.pictureUrl = `${import.meta.env.VITE_USER_PICTURES_BUCKET_URL}/${ownUserId}`

                this.state = 'edit';
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    this.state = 'create';
                } else {
                    console.error(error);
                    this.snackbar.text = 'Ha ocurrido un error.'
                    this.snackbar.enabled = true
                    this.state = 'error';
                }
            }
        },

        async save() {
            this.saving = true;

            if(!this.name) {
                this.snackbar.text = 'Por favor, selecciona tu nombre';
                this.snackbar.enabled = true;
                this.saving = false;
                return;
            }

            if(!this.birthday) {
                this.snackbar.text = 'Por favor, selecciona tu fecha de nacimiento';
                this.snackbar.enabled = true;
                this.saving = false;
                return;
            }

            await usersApi.usersControllerUpdateProfile({
                gender: this.gender,
                birthday: this.birthday.toISOString(),
                biography: this.biography
            });

            if (this.selectedFile) {
                // Upload the profile picture

                const res = await usersApi.usersControllerGetPictureUploadUrl(this.selectedFile.type);
                const uploadUrl = res.data;

                const response = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': this.selectedFile.type,
                    },
                    body: this.selectedFile,
                });
                if (!response.ok) {
                    throw new Error('Failed to upload file');
                }

                console.log('File uploaded succesfully')
            }
            
            localStorage.setItem('profile_completed', "true");

            this.saving = false;
            this.snackbar.text = 'Perfil actualizado';
            this.snackbar.enabled = true;

            if (this.firstCompletion) {
                this.$router.push('/explore');
            }
        }
    },

    watch: {
        selectedFile () {
            if (this.selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.pictureUrl = (e?.target?.result ?? '') as string;
                };
                reader.readAsDataURL(this.selectedFile);
            } else {
                this.pictureUrl = _avatar;
            }
        },
    },

    async created() {
        const idToken = localStorage.getItem('id_token')!;

        usersApi = UsersApiFactory({
            basePath: import.meta.env.VITE_API_URL,
            accessToken: () => idToken,
            isJsonMime: () => true,
        });

        this.firstCompletion = this.$route.query.firstCompletion === 'true';

        this.loadData();
    },
}
</script>
