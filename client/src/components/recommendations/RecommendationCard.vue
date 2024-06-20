<template>
    <ProfilePreviewCard :user="user">
        <v-btn icon="mdi-account-plus" @click="accept"/>
        <v-btn icon="mdi-close" @click="reject"/>
    </ProfilePreviewCard>
</template>

<script lang="ts">
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'
import type User from '@/types/user.interface';
import type { PropType } from 'vue';

export default {
    components: {
        ProfilePreviewCard,
    },

    props: {
        user: {
            type: Object as PropType<User>,
            required: true
        },
    },

    emits: ['accept', 'reject'],

    data() {
        return { }
    },

    methods: {
        accept() {
            this.$emit('accept')
        },
        reject() {
            this.$emit('reject')
        },
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