<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo"
          :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu :default-active="activeMenu"
               :collapse="isCollapse"
               background-color="#304156"
               text-color="#bfcbd9"
               :unique-opened="false"
               active-text-color="#409EFF"
               :collapse-transition="false"
               mode="vertical">
        <sidebar-item v-for="route in sidebarRoutes"
                      :key="route.path"
                      :item="route"
                      :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters('app', ['sidebar']),
    ...mapGetters('app', ['sidebarLogo']),
    ...mapGetters('permission', ['permission_routes']),
    activeMenu () {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    sidebarRoutes () {
      return this.filterMenus(this.permission_routes)
    },
    showLogo () {
      return this.sidebarLogo
    },
    isCollapse () {
      return !this.sidebar.opened
    }
  },
  methods: {
    filterMenus (sourceMenus, basePath = '') {
      for (let i = sourceMenus.length - 1; i >= 0; i--) {
        if (sourceMenus[i] && sourceMenus[i].meta && sourceMenus[i].meta.exclude) {
          sourceMenus.splice(i, 1)
        }
        if (sourceMenus[i] && sourceMenus[i].path === '*') {
          sourceMenus.splice(i, 1)
        }
        if (sourceMenus[i] && sourceMenus[i].children) {
          this.filterMenus(sourceMenus[i].children, sourceMenus[i].path)
        }
      }
      return sourceMenus
    }
  }
}
</script>
