<template>
  <q-page :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
    <div class="row">
      <div id="map" style="height:100vh; width: 100vw;"></div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, toRaw, onUpdated } from 'vue';
import { storeToRefs } from 'pinia';
import "leaflet/dist/leaflet.css"
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useFeaturesStore } from 'src/stores/features-store';

const featuresStore = useFeaturesStore();

const { features, map, featureRef } = storeToRefs(featuresStore);

function loadFeatures() {
  let allFeatures = []

  features.value.forEach((marker) => {
    allFeatures.push(
      L.marker([marker.coordinates.lat, marker.coordinates.lng])
        .bindTooltip(marker.name)
        .bindPopup(marker.description, { autoClose: false, closeOnClick: false, closeButton: true, closeOnEscapeKey: true })
        .addTo(toRaw(map.value)) // https://stackoverflow.com/a/66693709
    )
  })
  featureRef.value = allFeatures
}

onMounted(() => {

  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  })

  const cartoDBDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  })

  map.value = L.map(
    'map',
    { maxZoom: 12, minZoom: 2, zoomControl: true, zoom: 1, layers: [osm, cartoDBDarkMatter], markerZoomAnimation: true }
  ).setView([0, 0], 2)

  const baseMaps = {
    "OpenStreetMap": osm,
    "CartoDB.DarkMatter": cartoDBDarkMatter,
  };

  const layerControl = L.control.layers(baseMaps).addTo(map.value);



  loadFeatures()

  const searchControl = new GeoSearchControl({
    provider: new OpenStreetMapProvider(),
    style: 'button',
  });

  map.value.addControl(searchControl);
  L.control.locate().addTo(map.value);
  L.control.fullscreen({ position: 'topright' }).addTo(map.value);
})


</script>


<style lang="sass">
.leaflet-control-geosearch .results.active
  color: black
</style>
