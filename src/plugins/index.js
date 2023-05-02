import tab from './tab'
import stomp from './stomp'
import file from './file'
import sort from './sort'

export default {
  install (Vue) {
    // 页签操作
    Vue.prototype.$tab = tab
    // stomp客户端
    Vue.prototype.$stomp = stomp
    // 文件操作
    Vue.prototype.$file = file
    // 排序
    Vue.prototype.$sort = sort
  }
}
