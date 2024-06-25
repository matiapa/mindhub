<template>
  <v-card class="pa-3" flat>
    <v-card-title>Tus cuentas</v-card-title>

    <v-list>
      <TwitterConnectionItem @new-connection="$emit('new-connection')"/>
      <!-- <SpotifyConnectionItem/> -->
    </v-list>
  </v-card>
</template>

<script lang="ts">
import TwitterConnectionItem from '@/components/my-data/TwitterConnectionItem.vue';
// import SpotifyConnectionItem from '@/components/my-data/SpotifyConnectionItem.vue';

export default {
  components: {
    TwitterConnectionItem,
    // SpotifyConnectionItem
  },
}
</script>
