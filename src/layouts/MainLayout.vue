<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" class="shadow-2 rounded-borders">
      <q-header elevated>
        <q-toolbar>
          <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

          <q-toolbar-title>
            <q-btn flat to="/">V-GIS</q-btn>
          </q-toolbar-title>

          <q-btn flat @click="rightDrawerOpen = !rightDrawerOpen" round dense icon="menu" />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" overlay bordered :width="300" :breakpoint="500" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
        <q-list class="q-py-md">
          <q-item exact clickable v-ripple to="/">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section>
              Home
            </q-item-section>
          </q-item>

          <q-item exact clickable v-ripple to="/data">
            <q-item-section avatar>
              <q-icon name="menu" />
            </q-item-section>

            <q-item-section>
              Data
            </q-item-section>
          </q-item>

          <q-item exact clickable v-ripple to="/about">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>

            <q-item-section>
              About
            </q-item-section>
          </q-item>

          <q-item v-if="!Dark.isActive" clickable v-ripple @click="toggleDarkMode">
            <q-item-section avatar>
              <q-icon name="dark_mode" />
            </q-item-section>

            <q-item-section>
              Dark Mode
            </q-item-section>
          </q-item>

          <q-item v-else clickable v-ripple @click="toggleDarkMode">
            <q-item-section avatar>
              <q-icon name="light_mode" />
            </q-item-section>

            <q-item-section>
              Light Mode
            </q-item-section>
          </q-item>
        </q-list>

        <div class="q-mini-drawer-hide absolute" style="top: 200px; left: 280px">
          <q-btn
            dense
            round
            unelevated
            color="primary"
            icon="chevron_left"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />
        </div>
      </q-drawer>

      <q-drawer side="right" v-model="rightDrawerOpen" bordered :width="300" :breakpoint="500"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'" overlay>
        <q-scroll-area class="fit">
          <div class="q-pa-lg q-gutter-md">
            <div class="h4">
              Data
            </div>
            <q-input bottom-slots v-model="searchQuery" label="Search" counter maxlength="12" dense>
              <template v-slot:append>
                <q-icon v-if="searchQuery !== ''" name="close" @click="searchQuery = ''" class="cursor-pointer" />
                <q-icon name="search" />
              </template>

              <template v-slot:hint>
                Search By Feature Name or Description
              </template>

            </q-input>
            <q-list bordered padding class="rounded-borders" style="max-width: 450px">
              <q-item v-for="feature in filterdFeatures" :key="feature.id">
                <q-item-section>
                  <q-item-label lines="1">{{ feature.name }}</q-item-label>
                  <q-item-label caption>{{ date.formatDate(feature.dateAdded, 'DD MMMM YYYY') }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn size="sm" icon="flight" color="green" @click="flyToMarker(feature.coordinates)" />
                </q-item-section>
                <q-item-section side>
                  <q-btn size="sm" icon="info" color="green" @click="togglePopup(feature.id)" />
                </q-item-section>
              </q-item>
              <q-item v-if="features.length == 0">No Data Found</q-item>
            </q-list>
          </div>
        </q-scroll-area>
        <q-page-sticky position="bottom-right" :offset="[30, 30]">
          <q-btn fab icon="add" color="primary" @click="card = !card" />
        </q-page-sticky>

        <q-dialog v-model="card" position="right" persistent seamless>
          <q-card flat bordered class="form-card">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Add Feature</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>


            <q-card-section>
              <q-form @submit="handleSubmit" @reset="onReset" class="q-gutter-md">
                <q-input filled v-model="name" label="Feature name *" hint="Shop 1" lazy-rules
                  :rules="[val => val && val.length > 0 || 'Please type something']" />

                <q-input filled type="textarea" v-model="description" label="Feature description *"
                  hint="Shop 1 Description" lazy-rules
                  :rules="[val => val && val.length > 0 || 'Please type something']" />
                <q-input filled v-model="latitude" label="Feature Latitude *" hint="Click on the map to populate"
                  lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
                <q-input filled v-model="longitude" label="Feature Longitude *" hint="Click on the map to populate"
                  lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
                <div>
                  <q-btn label="Submit" type="submit" color="primary" />
                  <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
        <div class="q-mini-drawer-hide absolute" style="top: 280px; right: 280px">
          <q-btn
            dense
            round
            unelevated
            color="primary"
            icon="chevron_right"
            @click="rightDrawerOpen = !rightDrawerOpen"
          />
        </div>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw, computed } from 'vue'
import { Dark, Notify, date } from 'quasar';
import { storeToRefs } from 'pinia';
import { useFeaturesStore } from 'src/stores/features-store';
import { nanoid } from 'nanoid';

defineOptions({
  name: 'MainLayout'
})

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

const darkQuery = '(prefers-color-scheme: dark)';
const queryList = window.matchMedia(darkQuery);
Dark.set(queryList.matches);
queryList.addEventListener('change', (event) => {
  Dark.set(event.matches);
});

function toggleDarkMode() {
  Dark.toggle();
};




onMounted(() => {
  map.value.addEventListener('click', function (e) {
    latitude.value = e.latlng.lat.toFixed(6);
    longitude.value = e.latlng.lng.toFixed(6);
  })
});

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


const featuresStore = useFeaturesStore();

const { searchQuery, features, map, featureRef } = storeToRefs(featuresStore);

const filterdFeatures = computed(() => {
  if (searchQuery.value) {
    return features.value.filter(feature =>
      feature.name.includes(searchQuery.value) ||
      feature.description.includes(searchQuery.value)
    )
  }

  return features.value
})

const card = ref(false);

const name = ref('');
const description = ref('');
const latitude = ref('');
const longitude = ref('');


function flyToMarker(coordinates) {
  map.value.flyTo(coordinates, 8);
};

function togglePopup(id) {
  const featureIndex = features.value.findIndex((marker) => marker.id === id)
  featureRef.value[featureIndex].togglePopup();
}

function handleSubmit() {
  try {
    featuresStore.addFeature(
      {
        id: nanoid(),
        name: name.value,
        description: description.value,
        coordinates: {
          lat: latitude.value,
          lng: longitude.value
        },
        dateAdded: Date.now()
      }
    )
    map.value.flyTo([latitude.value, longitude.value], 4)
    name.value = '';
    description.value = '';
    latitude.value = '';
    longitude.value = '';
    loadFeatures()
    Notify.create({
      message: 'Feature Added Successfully',
      type: "positive",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })
    card.value = false;
  } catch (error) {
    Notify.create({
      message: error.message,
      type: "negative",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })
  }
}

function onReset() {
  name.value = '';
  description.value = '';
  latitude.value = '';
  longitude.value = '';
}
</script>

<style lang="sass" scoped>
.form-card
  width: 350px
  max-width: 80vw
  margin-right: 50px
</style>
