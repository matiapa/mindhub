<template>
  <v-app id="inspire">
    <v-app-bar class="px-3 bg-primary" flat density="compact">
      <v-avatar size="32">
        <v-img src="@/assets/person-light.png" />
      </v-avatar>

      <v-spacer></v-spacer>

      <v-tabs centered>
        <v-tab to="/explore">Explorar</v-tab>
        <v-tab to="/friends">Amigos</v-tab>
        <v-tab to="/data">Datos</v-tab>
        <!-- This hidden tabs are placed to trick the tabs component, because if they are removed, -->
        <!-- when a path that is not on the tabs is navigated, the last active tab remains highlighted -->
        <v-tab to="/profile" v-show="false"></v-tab>
      </v-tabs>

      <v-spacer></v-spacer>

      <v-avatar class="hidden-sm-and-down mr-8" color="grey-darken-1" size="32">
        <v-btn icon="mdi-brightness-6" @click="toggleTheme" />
      </v-avatar>

      <v-avatar class="hidden-sm-and-down mr-2" color="grey-darken-1" size="32">
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
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

import { useTheme } from 'vuetify'

export default {
  setup() {
    const theme = useTheme()

    return {
      theme,
      toggleTheme: () => theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }
  },

  methods: {
    logout() {
      localStorage.removeItem('uuid');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      this.$router.push('/');
    },
  },
}

</script>