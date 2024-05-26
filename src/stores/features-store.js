import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useFeaturesStore = defineStore('features', {
  state: () => ({
    features: useStorage("featuresStorage", []),
    searchQuery: "",
    map: "",
    featureRef: [],
  }),

  getters: {
    getFeatures: (state) => {
      return state.features
    },
    getFeatureById: (state) => {
      return (id) => state.features.find((feature) => feature.id === id);
    },
  },

  actions: {
    addFeature(feature) {
      this.features.push(feature);
    },

    editFeature(id, newFeature) {
      const featureToEdit = this.features.find((feature) => feature.id === id);
      featureToEdit = newFeature;
    },

    deleteFeature(id) {
      const featureToDelete = this.features.findIndex((feature) => feature.id === id);
      this.features.splice(featureToDelete)
      // this.features = this.features.filter((feature) => {
      //   return feature.id !== id;
      // })
    },
  }
})
