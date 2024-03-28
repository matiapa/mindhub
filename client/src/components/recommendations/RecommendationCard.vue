<template>
    <ProfilePreviewCard :user="user">
        <v-btn icon="mdi-account-plus" @click="accept"/>
        <v-btn icon="mdi-close" @click="reject"/>
    </ProfilePreviewCard>
</template>

<script>
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'

export default {
    components: {
        ProfilePreviewCard,
    },

    props: {
        user: Object,
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