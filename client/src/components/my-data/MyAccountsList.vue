<template>
  <v-card class="pa-3">
    <v-card-title>Tus cuentas</v-card-title>

    <v-list>
      <TwitterConnectionItem @new-connection="$emit('new-connection')"/>
      <SpotifyConnectionItem @new-connection="$emit('new-connection')"/>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import TwitterConnectionItem from '@/components/my-data/TwitterConnectionItem.vue';
import SpotifyConnectionItem from '@/components/my-data/SpotifyConnectionItem.vue';

export default {
  emits: ['new-connection'],

  components: {
    TwitterConnectionItem,
    SpotifyConnectionItem
  },
}
</script>
