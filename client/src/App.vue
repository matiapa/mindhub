<template>
    <v-layout class="rounded rounded-md">
      
      <v-app-bar class="px-3 bg-primary" flat density="compact">
        <template v-if="$route.path != '/'">
          <v-avatar class="hidden-sm-and-down" size="32">
            <v-img :src="image" />
          </v-avatar>

          <v-spacer></v-spacer>

          <v-tabs centered>
            <v-tab to="/explore">Explorar</v-tab>

            <v-badge color="red" dot offset-x="10" offset-y="10" :model-value="messageStore.newMessages.length > 0">
              <v-tab to="/friends">Amigos</v-tab>
            </v-badge>

            <v-tab to="/data">Datos</v-tab>

            <!-- This hidden tabs are placed to trick the tabs component, because if they are removed, -->
            <!-- when a path that is not on the tabs is navigated, the last active tab remains highlighted -->

            <v-tab to="/profile" v-show="false"></v-tab>

            <v-tab to="/unconfirmed_account" v-show="false"></v-tab>

          </v-tabs>

          <v-spacer></v-spacer>

          <v-avatar class="mr-8" color="grey-darken-1" size="32">
            <v-btn icon="mdi-brightness-6" @click="toggleTheme" />
          </v-avatar>

          <v-avatar class="mr-8" color="grey-darken-1" size="32">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-badge color="red" dot offset-x="14" offset-y="14" :model-value="notificationsStore.notifications.some(n => !n.seen)">
                  <v-btn icon="mdi-bell" v-bind="props"/>
                </v-badge>
              </template>
              <AppNotificationsList/>
            </v-menu>
          </v-avatar>

          <v-avatar class="mr-2" color="grey-darken-1" size="32">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-account" label="Perfil" v-bind="props" />
              </template>
              <v-list>
                <v-list-item link to="/profile">
                  <template v-slot:prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Mi perfil</v-list-item-title>
                </v-list-item>

                <!-- <v-list-item link to="/data">
                  <template v-slot:prepend>
                    <v-icon>mdi-web</v-icon>
                  </template>
                  <v-list-item-title>Mis datos</v-list-item-title>
                </v-list-item> -->

                <v-list-item link @click="logout">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>Cerrar sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-avatar>
        </template>
      </v-app-bar>

      <v-main>
        <router-view></router-view>

        <BrowserNotificationManager v-if="$route.path != '/'"/>

        <PWAPrompt v-if="$route.path != '/'"/>
      </v-main>
    </v-layout>
</template>

<style scoped>

</style>

<script lang="ts">

import { useTheme } from 'vuetify'
import _image from "@/assets/person-light.png"
import { useMessageStore } from '@/stores/messages';
import { useNotificationsStore } from '@/stores/notifications';
import '@/styles/styles.css';
import AppNotificationsList from '@/components/notifications/AppNotificationsList.vue';
import BrowserNotificationManager from '@/components/notifications/BrowserNotificationManager.vue';
import PWAPrompt from '@/components/PWAPrompt.vue';

export default {
  components: {
    AppNotificationsList,
    BrowserNotificationManager,
    PWAPrompt,
  },

  setup() {
    const theme = useTheme()

    const useWebPush = localStorage.getItem("useWebPush") === "true";
    useMessageStore().setup(useWebPush);
    useNotificationsStore().setup(useWebPush);

    return {
      theme,
      toggleTheme: () => theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }
  },

  data: () => ({
    image: _image,
    messageStore: useMessageStore(),
    notificationsStore: useNotificationsStore()
  }),

  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/');
    },
  },
}

</script>