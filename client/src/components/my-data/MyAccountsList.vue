<template>
  <v-card class="pa-3">
    <v-card-title>Tus cuentas</v-card-title>

    <v-list>
      <TwitterConnectionItem @new-connection="twitterConnected" @removed-connection="$emit('removed-connection')"/>
      <SpotifyConnectionItem @new-connection="$emit('new-connection')" @removed-connection="$emit('removed-connection')" ref="spotify"/>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import TwitterConnectionItem from '@/components/my-data/TwitterConnectionItem.vue';
import SpotifyConnectionItem from '@/components/my-data/SpotifyConnectionItem.vue';

export default {
  emits: ['new-connection', 'removed-connection'],

  components: {
    TwitterConnectionItem,
    SpotifyConnectionItem
  },

  methods: {
    twitterConnected() {
      this.$emit('new-connection');
      (this.$refs.spotify as InstanceType<typeof SpotifyConnectionItem>).loadData();
    }
  }
}
</script>
