<template>
    <v-card :loading="loading">
        <div class="media">
            <v-avatar class="mt-8 mb-8" size="150">
                <v-img :src="profile.pictureUrl" contain></v-img>
            </v-avatar>
        </div>

        <v-card-item>
            <v-card-title>{{ profile.name }}</v-card-title>
        </v-card-item>

        <v-card-text>
            <v-form ref="form" v-model="valid">
                <v-textarea
                    v-model="biography"
                    label="Biografia"
                    auto-grow
                    ></v-textarea>

                <v-select
                    v-model="gender"
                    :items="['Male', 'Female', 'Other']"
                    label="Genero"
                    ></v-select>

                <v-menu v-model="menu" :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                        v-model="birthday"
                        label="Birthday"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-model="birthday" @input="menu = false"></v-date-picker>
                </v-menu>

                <v-btn :disabled="!valid" @click="submit">Submit</v-btn>
            </v-form>
        </v-card-text>

        <v-card-actions>
            <v-btn prepend-icon="mdi-account-plus" @click="send" class="mx-3 my-3">Enviar solicitud</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    components: {},

    props: {
        profile: Object,
    },

    data() {
        return {
            presentation: {
                genderIcons: {
                    'man': '♂',
                    'woman': '♀',
                    'other': '⚲',
                },
                interestCategories: [
                    { key: 'artist', title: 'Artistas' },
                    { key: 'track', title: 'Canciones' },
                ]
            }
        }
    },

    methods: {
        send() {
            this.$emit('send')
        },
        discard() {
            this.$emit('discard')
        },
        sharedInterests(category) {
            return this.recommendation.user.sharedInterests.filter(i => i.resource.type === category)
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