<template>
  <transition name="fade-transform" mode="out-in">
    <keep-alive :include="cachedViews">
      <router-view :key="key" />
    </keep-alive>
  </transition>
</template>

<script>
import { createStore } from '@/store'
const store = createStore()
export default {
  name: 'AppMain',
  computed: {
    cachedViews () {
      return store.state.tagsView.cachedViews
    },
    key () {
      return this.$route.path
    }
  }
}
</script>
