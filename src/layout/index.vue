<template>
  <div class="flex-row box" :class="classObj">
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <section>
        <navbar />
        <tags-view />
      </section>
      <section class="main-content">
        <app-main />
        <consult v-if="consultVisible" />
      </section>
    </div>
  </div>
</template>

<script>
import { AppMain, Navbar, Sidebar, TagsView } from './components'
import { mapGetters } from 'vuex'

import Consult from '@/components/Consult'

export default {
  name: 'Layout',
  components: {
    Sidebar,
    AppMain,
    Navbar,
    TagsView,
    Consult
  },
  computed: {
    ...mapGetters('app', ['sidebar']),
    ...mapGetters('user', ['userInfo']),
    classObj () {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened
      }
    },
    consultVisible () {
      if (this.userInfo) {
        return this.userInfo.role.indexOf('ROLE_user') !== -1
      }

      return false
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.box {
  height: 100vh;
  overflow: hidden;
}
.side {
  height: 100%;
}
.content {
  min-width: 85vw;
  height: 100%;
  flex: 1;
}
.main-content {
  height: calc(100% - 115px);
  overflow: auto;
}
</style>
