<template>
    <v-container>
        <v-card class="mx-auto" max-width="600">
            <v-card-title v-if="mode == 'create'" class="headline">Completá tu perfil</v-card-title>
            <v-card-title v-else class="headline">Editá tu perfil</v-card-title>

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

                    <v-select label="Género" v-model="gender" :items="presentation.genders" item-title="title"
                        item-value="value"></v-select>

                    <v-menu v-model="showDatePicker" :close-on-content-click="false">

                        <template v-slot:activator="{ props }">
                            <v-text-field v-model="formattedBirthday" label="Fecha de nacimiento" readonly
                                v-bind="props"></v-text-field>
                        </template>
                        <v-date-picker v-model="birthday" no-title @input="showDatePicker = false"></v-date-picker>
                    </v-menu>

                    <v-textarea label="Biografía" v-model="biography"></v-textarea>

                    <v-btn v-if="!saving" @click="save" :disabled="!name || !gender || !birthday">Guardar</v-btn>
                    <v-progress-circular v-else indeterminate color="white"></v-progress-circular>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>

    <v-snackbar :timeout="2000" v-model="snackbar.enabled">
        {{ snackbar.text }}
    </v-snackbar>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user';
import _avatar from "@/assets/avatar.png"
import { UsersApiFactory, type GetOwnUserResDto } from 'user-api-sdk'

let userStore = useUserStore();

export default {
    data: () => ({
        mode: 'edit' as 'create' | 'edit',
        saving: false,
        showDatePicker: false,

        name: '',
        gender: '' as 'man' | 'woman' | 'other',
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

        snackbar: {
            enabled: false,
            text: ''
        },
    }),

    computed: {
        formattedBirthday() {
            return this.birthday ? new Date(this.birthday).toLocaleDateString('en-GB') : null;
        },
        ownUser() {
            return userStore.ownUser;
        }
    },

    methods: {
        preloadFields(ownUser: GetOwnUserResDto) {
            if (ownUser.profile.completed) {
                this.mode = 'edit';
                this.name = ownUser.profile.name;
                this.gender = ownUser.profile.gender;
                this.birthday = ownUser.profile.birthday ? new Date(ownUser.profile.birthday) : null;
                this.biography = ownUser.profile.biography ?? "";
            } else {
                this.mode = 'create';
                this.name = ownUser.profile.name;
            }
        },

        async save() {
            this.saving = true;
            const isFirstCompletion = !(this.ownUser!.profile.completed);

            await userStore.updateProfile(this.gender, this.birthday!, this.biography);

            if (this.selectedFile) {
                // Upload the profile picture

                const idToken = localStorage.getItem('id_token')!;
                const usersApi = UsersApiFactory({
                    basePath: import.meta.env.VITE_API_URL,
                    accessToken: () => idToken,
                    isJsonMime: () => true,
                });

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

                const pictureVersion = Math.random().toString(36).substring(7);
                localStorage.setItem('pictureVersion', pictureVersion);
            }
            
            this.saving = false;
            this.snackbar.text = 'Perfil actualizado';
            this.snackbar.enabled = true;

            if (isFirstCompletion) {
                this.$router.push('/explore');
            }
        }
    },

    watch: {
        ownUser(ownUser: GetOwnUserResDto) {
            this.preloadFields(ownUser);
        },

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
        this.preloadFields(this.ownUser!);

        const ownUserId = localStorage.getItem('uuid')!;
        let pictureVersion = localStorage.getItem('pictureVersion');
        if (!pictureVersion) {
            // We use picture version to invalidate cache when the image is updated
            pictureVersion = Math.random().toString(36).substring(7);
            localStorage.setItem('pictureVersion', pictureVersion);
        }
        Math.random().toString(36).substring(7);
        this.pictureUrl = `${import.meta.env.VITE_USER_PICTURES_BUCKET_URL}/${ownUserId}?v=${pictureVersion}`
    },
}
</script>
