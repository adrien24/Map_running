<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { MapboxMap, MapboxImage, MapboxCluster, MapboxPopup } from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'redaxios'
import Runner from '../assets/img/runner.png'
import 'flexboxgrid'
import GeocoderView from './GeocoderView.vue'
import ListCityView from './ListCityView.vue'

const tokenMapBox = import.meta.env.VITE_MAPBOX_API_KEY
const tokenNocodb = import.meta.env.VITE_XC_API_TOKEN

const mapCenter = ref([3, 47])
const isOpen = ref(false)
const position = ref([0, 0])
const content = ref()
const map = ref(null)

// Variable qui permet de partager les coordonnées de la ville recherchée
const sharedSearchCity = ref(null)

// Fonction pour mettre à jour sharedSearchCity depuis ChildA
const updateSharedData = (newData) => {
  sharedSearchCity.value = newData
}

onMounted(() => {
  getConcess()
})

const geojsonData = ref({
  type: 'FeatureCollection',
  features: []
})

// Fonction qui récupère les concession de l'API nocodb
const getConcess = async () => {
  const response = await axios.get('https://proxy.hyundai.media', {
    headers: {
      'xc-api-token': tokenNocodb,
      'X-Table-Id': 'mtv49f2tbqpwmkz'
    }
  })

  let data = response.data.list

  // On boucle sur les données pour les ajouter dans le geojson
  data.forEach((item) => {
    geojsonData.value.features.push({
      type: 'Feature',
      properties: {
        id: item.Id,
        title: item.titre,
        date: item.date_start,
        ville: item.ville,
        lat: item.latitude,
        lon: item.longitude,
        postal_code: item.postal_code
      },
      geometry: { type: 'Point', coordinates: [item.longitude, item.latitude] }
    })
  })
}

// Fonction qui permet de se déplacer sur la carte
const flyto = (features) => {
  const { lat, lon, title, date, ville } = features
  map.value.flyTo({ center: [lon, lat], zoom: 14 })
  isOpen.value = false
  openPopup({
    geometry: { coordinates: [lon, lat] },
    properties: { title: title, date: date, ville: ville }
  })
}

// Pop up qui récupère les données de la feature cliquée
const openPopup = async ({ geometry, properties }) => {
  await nextTick()
  console.log(geometry, properties)
  position.value = [...geometry.coordinates]
  isOpen.value = true

  content.value = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      try {
        return [key, JSON.parse(value)]
      } catch (err) {
        // Silence is golden.
      }
      return [key, value]
    })
  )
}
</script>

<template>
  <div class="row">
    <div class="col-md-3 col-xs-12 desktop list">
      <ListCityView :geojsonData @flyTo="flyto" :sharedSearchCity />
    </div>
    <div class="col-md-9 col-xs-12 map">
      <MapboxMap
        style="height: 400px"
        :access-token="tokenMapBox"
        map-style="mapbox://styles/mapbox/streets-v11"
        :center="mapCenter"
        :zoom="4"
        @mb-created="(mapInstance) => (map = mapInstance)"
      >
        <MapboxPopup
          v-if="isOpen"
          :key="position.join('-')"
          :lng-lat="position"
          anchor="bottom"
          @mb-close="() => (isOpen = false)"
        >
          <h2>{{ content.title }}</h2>
          <p>{{ content.date }}</p>
          <p>{{ content.ville }}</p>
        </MapboxPopup>
        <MapboxImage id="runner" :src="Runner">
          <MapboxCluster
            :data="geojsonData"
            unclustered-point-layer-type="symbol"
            :unclustered-point-layout="{
              'icon-image': 'runner',
              'icon-size': 0.15
            }"
            :unclustered-point-paint="null"
            @mb-feature-click="openPopup"
            :clustersPaint="{
              'circle-color': '#002c5f',
              'circle-radius': 30
            }"
          />
        </MapboxImage>
      </MapboxMap>
      <GeocoderView :map class="map__list desktop" @updateData="updateSharedData" />
    </div>
    <div class="col-md-3 col-xs-12 mobile list">
      <ListCityView :geojsonData @flyTo="flyto" :sharedSearchCity />
    </div>
  </div>
</template>

<style scoped lang="scss">
.desktop {
  display: block;
  @media (max-width: 768px) {
    display: none;
  }
}

.mobile {
  display: none;
  @media (max-width: 768px) {
    display: block;
    padding: 10px 15px;
  }
}

.list {
  height: 400px;
  overflow-y: scroll;
  cursor: pointer;
}
.mapboxgl-popup-close-button {
  right: 3px;
  top: -1px;
  font-size: 21px;
}
.mapboxgl-popup-content {
  padding: 15px 14px 15px;
}

.map {
  position: relative;
  padding: 0;

  &__list {
    position: absolute;
    top: 10px;
    right: 20px;
  }
}
</style>
