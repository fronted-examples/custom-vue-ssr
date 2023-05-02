<template>
  <div id="tags-view-container"
       class="tags-view-container">
    <scroll-pane ref="scrollPane"
                 class="tags-view-wrapper"
                 @scroll="handleScroll">
      <router-link v-for="tag in visitedViews"
                   ref="tag" :key="tag.path"
                   :class="isActive(tag)?'active':''"
                   :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
                   tag="span"
                   class="tags-view-item flex-inline secondary-center"
                   @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
                   @contextmenu.prevent.native="openMenu(tag,$event)">
        {{ tag.title }}
        <span v-if="!isAffix(tag)"
              class="el-icon-close"
              @click.prevent.stop="closeSelectedTag(tag)" />
      </router-link>
    </scroll-pane>
    <!-- 气泡操作框 -->
    <ul v-show="visible"
        :style="{left:left+'px',top:top+'px'}"
        class="contextmenu">
      <li
          @click="refreshSelectedTag(selectedTag)">
        <i class="el-icon-refresh-right"></i> 刷新页面
      </li>
      <li v-if="!isAffix(selectedTag)"
          @click="closeSelectedTag(selectedTag)">
        <i class="el-icon-close"></i> 关闭当前
      </li>
      <li @click="closeOthersTags"><i
           class="el-icon-circle-close"></i> 关闭其他
      </li>
      <li v-if="!isFirstView()"
          @click="closeLeftTags"><i
           class="el-icon-back"></i> 关闭左侧</li>
      <li v-if="!isLastView()"
          @click="closeRightTags"><i
           class="el-icon-right"></i> 关闭右侧</li>
      <li @click="closeAllTags(selectedTag)"><i
           class="el-icon-circle-close"></i> 全部关闭
      </li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane.vue'
import path from 'path'
import { createStore } from '@/store'

const store = createStore()

export default {
  components: {
    ScrollPane
  },
  data () {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    }
  },
  computed: {
    visitedViews () {
      return store.state.tagsView.visitedViews
    },
    routes () {
      return store.state.permission.addRoutes
    }
  },
  watch: {
    $route (newValue) {
      this.addTags()
      this.moveToCurrentTag()
      // 更新侧边栏选中项
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title).map((item) => item.name)

      store.dispatch('app/updateDefaultOpen', {
        name: newValue.name,
        query: newValue.query,
        matched: matched
      })
    },
    visible (value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted () {
    this.initTags()
    this.addTags()
  },
  methods: {
    isActive (route) {
      return route.path === this.$route.path
    },
    isAffix (tag) {
      return tag.meta && tag.meta.affix
    },
    isFirstView () {
      try {
        return this.selectedTag.fullPath === this.visitedViews[1].fullPath || this.selectedTag.fullPath === '/index'
      } catch (err) {
        return false
      }
    },
    isLastView () {
      try {
        return this.selectedTag.fullPath === this.visitedViews[this.visitedViews.length - 1].fullPath
      } catch (err) {
        return false
      }
    },
    filterAffixTags (routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags () {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)

      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags () {
      const { name } = this.$route

      if (name) {
        // 这里将路由持续化缓存，会报深拷贝错误，目前还没解决
        // 当hiddenTagView为true时，不显示对应的tagView
        if (this.$route.meta && !this.$route.meta.hiddenTagView) {
          store.dispatch('tagsView/addView', this.$route)
        }
      }
      return false
    },
    moveToCurrentTag () {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag (view) {
      store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag (view) {
      store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    closeRightTags () {
      this.$tab.closeRightPage(this.selectedTag).then(visitedViews => {
        if (!visitedViews.find(i => i.fullPath === this.$route.fullPath)) {
          this.toLastView(visitedViews)
        }
      })
    },
    closeLeftTags () {
      this.$tab.closeLeftPage(this.selectedTag).then(visitedViews => {
        if (!visitedViews.find(i => i.fullPath === this.$route.fullPath)) {
          this.toLastView(visitedViews)
        }
      })
    },
    closeOthersTags () {
      this.$router.push(this.selectedTag).catch(() => { })
      this.$tab.closeOtherPage(this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags (view) {
      this.$tab.closeAllPage().then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === this.$route.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView (visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]

      if (latestView) {
        store.dispatch('app/resetDefaultOpen')
        this.$router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu (tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY - 65
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu () {
      this.visible = false
    },
    handleScroll () {
      this.closeMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  position: relative;
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  padding-top: 5px;
  padding-bottom: 5px;
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-flex;
      position: relative;
      cursor: pointer;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 5px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      position: relative;
      margin-left: 5px;
      &:before {
        display: inline-block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.6);
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
