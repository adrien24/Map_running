<script setup>
import { ref, watch } from 'vue'
import { formatDate } from '@/assets/js/dateUtils'
import { sortDistance } from '@/assets/js/distanceUtils'

const infoCity = ref(null)

const props = defineProps({
  geojsonData: {
    type: Object,
    required: true
  },
  sharedSearchCity: {
    type: Array
  }
})

// On récupère les données des villes depuis le composant parent
watch(
  () => props.geojsonData,
  (newGeojsonData) => {
    if (newGeojsonData && newGeojsonData.features && newGeojsonData.features.length > 0) {
      infoCity.value = newGeojsonData
    } else {
      console.log('geojsonData is empty or not formatted correctly')
    }
  },
  { immediate: true, deep: true }
)

// On récupère la position de la ville recherchée pour trier les villes par distance
watch(
  () => props.sharedSearchCity,
  (newsharedSearchCity) => {
    if (newsharedSearchCity) {
      // On récupère les coordonnées de la ville recherchée
      const referenceCoordinates = {
        lat: newsharedSearchCity.latitude,
        lon: newsharedSearchCity.longitude
      }

      // On trie les villes par distance via la fonction sortDistance importer de distanceUtils
      infoCity.value = sortDistance(infoCity.value, referenceCoordinates)
    } else {
      console.log('sharedSearchCity is empty or not formatted correctly')
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <ul v-if="infoCity">
    <li
      v-for="feature in infoCity.features"
      :key="feature.properties.id"
      @click="$emit('flyTo', feature.properties)"
    >
      <h2>{{ feature.properties.title }}</h2>
      <p>{{ formatDate(feature.properties.date) }}</p>
      <p>
        <span v-if="feature.properties.postal_code">{{ feature.properties.postal_code }} - </span>
        {{ feature.properties.ville }}
      </p>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
h2 {
  font-size: 1rem;
}

ul {
  li {
    padding: 10px 10px 10px 10px;
    border: 1px solid #f6f3f2;
    border-radius: 5px;
    font-size: 12px;
    text-decoration: none;
    list-style-type: none;
    margin-bottom: 10px;
  }
}
</style>
@/assets/js/dateUtils
