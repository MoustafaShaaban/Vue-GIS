<template>
  <q-page class="">
    <div class="q-pa-md">
      <q-table flat bordered title="Features" :rows="rows" :columns="columns" separator="vertical" row-key="id"
        binary-state-sort>
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="featuresStore.searchQuery" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
              <q-popup-edit v-model="props.row.name" buttons persistent v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
              <q-popup-edit v-model="props.row.description" title="Update Description" buttons persistent
                v-slot="scope">
                <q-input type="textarea" v-model="scope.value" dense autofocus />
              </q-popup-edit>
            </q-td>
            <q-td key="lng" :props="props">
              {{ props.row.coordinates.lat }}
              <q-popup-edit v-model="props.row.coordinates.lat" title="Update Longitude" buttons persistent
                v-slot="scope">
                <q-input type="number" v-model="scope.value" dense autofocus hint="Use buttons to close" />
              </q-popup-edit>
            </q-td>
            <q-td key="lng" :props="props">
              {{ props.row.coordinates.lng }}
              <q-popup-edit v-model="props.row.coordinates.lng" title="Update Longitude" buttons persistent
                v-slot="scope">
                <q-input type="number" v-model="scope.value" dense autofocus hint="Use buttons to close" />
              </q-popup-edit>
            </q-td>

            <q-td key="lng" :props="props">
              <q-btn size="sm" color="negative" @click="confirm">Delete</q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="card">
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
              hint="Shop 1 Description" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="latitude" label="Feature Latitude *" hint="51.555555" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="longitude" label="Feature Longitude *" hint="51.555555" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']" />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>


          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="card = !card" />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Dialog, Notify } from 'quasar';
import { nanoid } from 'nanoid';

import { useFeaturesStore } from 'src/stores/features-store';



const featuresStore = useFeaturesStore();

const { features, searchQuery, map } = storeToRefs(featuresStore);

const card = ref(false)

const columns = [
  {
    name: 'name',
    label: "Name",
    required: true,
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'description', align: 'center', label: 'Description', field: row => row.description, sortable: true },
  { name: 'lat', label: 'Latitude', field: row => row.coordinates.lat },
  { name: 'lng', label: 'Longitude', field: row => row.coordinates.lng },
  { name: 'delete', label: 'Actions' },
]

const filterdFeatures = computed(() => {
  if (searchQuery.value) {
    return features.value.filter(feature =>
      feature.name.includes(searchQuery.value) ||
      feature.description.includes(searchQuery.value)
    )
  }

  return features.value
})

const rows = filterdFeatures


function confirm(id) {
  Dialog.create({
    dark: true,
    title: 'Confirm',
    color: 'primary',
    message: 'Are you sure you want to delete this feature?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    try {
      featuresStore.deleteFeature(id)
      Notify.create({
        message: 'Feature Deleted Successfully',
        type: "positive",
        actions: [
          { icon: 'close', color: 'white', round: true, }
        ]
      })
    } catch (error) {
      Notify.create({
        message: error.message,
        type: "negative",
        actions: [
          { icon: 'close', color: 'white', round: true, }
        ]
      })
    }
  })
};

const name = ref('');
const description = ref('');
const latitude = ref('');
const longitude = ref('');

function handleSubmit() {
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
</style>
