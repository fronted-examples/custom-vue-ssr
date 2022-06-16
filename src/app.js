import Vue from "vue";
import App from "./App.vue";
import VueMeta from 'vue-meta'
import { createRouter } from "./router";
import { createStore } from './store/index'

Vue.use(VueMeta)

Vue.mixin({
  metaInfo:{
    // 混入选项 %s 为用户自定义数据
    titleTemplate:'%s - vue SSR'
  }
})

// 需要返回一个应用程序工厂: 返回Vue实例和Router实例
export function createApp(context) {
  // 处理首屏，就要先处理路由跳转
  const router = createRouter()
  const store = createStore ()
  const app = new Vue({
    router,
    store,
    render: (h) => h(App),
  })
  return { app, router, store }
}