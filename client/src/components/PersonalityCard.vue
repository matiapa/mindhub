<template>
  <v-card :class="flat ? '' : 'pa-3'" :flat="flat">
    <v-card-title v-if="title">{{ title }}</v-card-title>

    <v-list>
      <v-list-item
        v-for="trait in presentation.personality.bigFive"
        :key="trait.key"
        class="py-3"
      >
        <template v-slot:prepend>
          <v-tooltip location="end">
            <template v-slot:activator="{ props }">
              <v-avatar color="grey-lighten-1" v-bind="props">
                {{ trait.capital }}
              </v-avatar>
            </template>
            <span>{{ trait.name }}</span>
          </v-tooltip>
        </template>

        <template v-slot:title>
          <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                  <v-progress-linear :model-value="personality[trait.key] * 100" v-bind="props"></v-progress-linear>
              </template>
              <span>{{Math.round(personality[trait.key] * 10000) / 100 }}%</span>
          </v-tooltip>
        </template>

        <template v-slot:append>
          <v-tooltip location="end">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props">mdi-information</v-icon>
            </template>
            <span>{{ trait.description }}</span>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>

    <v-card-text v-if="showGenerationDate">
      Actualizada el {{ new Date(personality.generatedAt).toLocaleString("es-ES", {hour12: false}) }}
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  export default {
    props: {
      title: String,
      flat: {
        type: Boolean,
        default: false,
      },
      showGenerationDate: {
        type: Boolean,
        default: false,
      },
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
              { key: 'o', capital: 'O', name: "Apertura a la Experiencia", description: 'Incluye la creatividad y la curiosidad por nuevas experiencias y conocimientos'},
              { key: 'c', capital: 'C', name: "Responsabilidad", description: 'Refleja la organización, la fiabilidad y la disciplina en la consecución de objetivos' },
              { key: 'e', capital: 'E', name: "Extraversión", description: 'Caracteriza a individuos sociables, enérgicos y optimistas frente a quienes prefieren la soledad y la reflexión' },
              { key: 'a', capital: 'A', name: "Amabilidad", description: 'Engloba la empatía, la cooperación y la consideración hacia los demás' },
              { key: 'n', capital: 'N', name: "Neuroticismo", description: 'Mide la tendencia a experimentar emociones negativas como ansiedad, ira o tristeza' },
            ]
          },
        },
      }
    },
  }
</script>