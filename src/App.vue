<template>
  <router-view />
</template>

<script>
import "leaflet"
import "leaflet/dist/leaflet.css"
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet.locatecontrol' // Import plugin
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css' // Import styles
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>
