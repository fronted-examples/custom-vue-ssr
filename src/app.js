import Vue from "vue"
import App from "./App.vue"
import VueMeta from 'vue-meta'
import { createRouter } from "./router"
import { createStore } from './store/index'
import { routerGuard } from './router-guard'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/icons'

import plugins from '@/plugins' // plugins

import '@/styles/index.scss' // 全局scss样式

import indexMixins from '@/mixins/index'

Vue.use(plugins)

Vue.use(VueMeta)
Vue.use(ElementUI)


Vue.mixin(indexMixins)

Vue.mixin({
  metaInfo: {
    // 混入选项 %s 为用户自定义数据
    titleTemplate: '%s - 购物天堂'
  }
})


// 需要返回一个应用程序工厂: 返回Vue实例和Router实例
export function createApp (context) {
  // 处理首屏，就要先处理路由跳转
  const router = createRouter()
  const store = createStore()

  routerGuard(router, store)

  const app = new Vue({
    router,
    store,
    render: (h) => h(App),
  })

  return { app, router, store }
}
