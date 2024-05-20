<template>
  <v-card class="pa-3" flat>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <v-list>
      <v-list-item
        v-for="trait in presentation.personality.bigFive"
        :key="trait.key"
        class="py-3"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1">
            {{ trait.capital }}
          </v-avatar>
        </template>

        <template v-slot:title>
          <v-progress-linear :model-value="personality[trait.key] * 100"></v-progress-linear>
        </template>

        <template v-slot:append>
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props">mdi-information</v-icon>
            </template>
            <span>{{ trait.description }}</span>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
  export default {
    props: {
      title: String,
      personality: {
        type: Object,
        required: true,
      },
    },

    data () {
      return {
        presentation: {
          personality: {
            bigFive: [
              { key: 'o', capital: 'O', description: 'Apertura a la Experiencia: Incluye la creatividad y la curiosidad por nuevas experiencias y conocimientos'},
              { key: 'c', capital: 'C', description: 'Responsabilidad: Refleja la organización, la fiabilidad y la disciplina en la consecución de objetivos' },
              { key: 'e', capital: 'E', description: 'Extraversión: Caracteriza a individuos sociables, enérgicos y optimistas frente a quienes prefieren la soledad y la reflexión' },
              { key: 'a', capital: 'A', description: 'Amabilidad: Engloba la empatía, la cooperación y la consideración hacia los demás' },
              { key: 'n', capital: 'N', description: 'Neuroticismo: Mide la tendencia a experimentar emociones negativas como ansiedad, ira o tristeza' },
            ]
          },
        },
      }
    },
  }
</script>