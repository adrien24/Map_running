<script setup>
import { ref, watch } from 'vue'
import axios from 'redaxios'
import searchIcon from '@/assets/img/search.vue'

const tokenMapBox = import.meta.env.VITE_MAPBOX_API_KEY

const city = ref('')
const listCity = ref(null)
const mapInstance = ref(null)

// Permet de récupérer l'instance de la map depuis le composant parent
const props = defineProps({
  map: Object
})

// Permet de partager les coordonnées de la ville recherchée au composant parent via un emit (on retrouvera la fonction updateData dans le composant parent)
defineEmits(['updateData'])

// Watch for changes in the map prop
watch(
  () => props.map,
  (newMap) => {
    if (newMap) {
      mapInstance.value = newMap
    }
  },
  { immediate: true }
)

const flyTo = (city) => {
  const { latitude, longitude } = city
  mapInstance.value.flyTo({ center: [longitude, latitude], zoom: 10 })
  listCity.value = null
}

const searchCity = () => {
  if (city.value) {
    axios
      .get(
        `https://api.mapbox.com/search/geocode/v6/forward?q=${city.value}&country=fr&limit=5&language=fr&access_token=${tokenMapBox}`
      )
      .then((res) => {
        listCity.value = res.data.features.length !== 0 ? res.data.features : null
      })
  }
}
</script>

<template>
  <div class="search row">
    <searchIcon class="search__icon" />
    <input type="text" v-model="city" @input="searchCity" @click="searchCity" />

    <ul class="search__list" v-if="listCity">
      <li
        v-for="item in listCity"
        :key="item.id"
        @click="
          flyTo(item.properties.coordinates), $emit('updateData', item.properties.coordinates)
        "
        class="search__list__city"
      >
        <h3>{{ item.properties.name }}</h3>
        <p>{{ item.properties.place_formatted }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.search {
  max-width: 300px;

  &__icon {
    position: absolute;
    width: 25px;
    height: 25px;
    top: 10px;
    left: 10px;
  }

  input {
    width: 300px;
    padding: 10px;
    padding-left: 40px;
    border: 1px solid #f0f0f0;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  &__list {
    border: 1px solid #f0f0f0;
    min-width: 300px;
    border-radius: 5px;
    background-color: #fff;
    &__city {
      list-style-type: none;
      padding: 10px;
      cursor: pointer;
      &:hover {
        background-color: #f0f0f0;
      }
      h3 {
        font-size: 16px;
      }
      p {
        font-size: 13px;
      }
    }
    &__city:not(:last-child) {
      margin-bottom: 5px;
    }
  }
}
</style>
