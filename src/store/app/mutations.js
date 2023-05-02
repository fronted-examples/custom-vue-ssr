import {
  TOGGLE_SIDEBAR,
  CLOSE_SIDEBAR,
  UPDATE_DEFAULT_OPEN,
  RESET_DEFAULT_OPEN
} from './constant'

const mutations = {
  /**
 * 更新Sidebar信息
 */
  [TOGGLE_SIDEBAR]: (state) => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
  },
  /**
   * 关闭侧边栏
   * @param {*} state
   * @param {*} withoutAnimation
   */
  [CLOSE_SIDEBAR]: (state, withoutAnimation) => {
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  /**
   * 更新侧边栏菜单打开的选项
   * @param {*} state
   * @param {*} defaultOpen
   */
  [UPDATE_DEFAULT_OPEN]: (state, defaultOpen) => {
    state.sidebar.defaultOpen = Object.assign({}, state.sidebar.defaultOpen, defaultOpen)
  },
  /**
   * 重置侧边栏菜单打开的选项
   * @param {*} state
   */
  [RESET_DEFAULT_OPEN]: (state) => {
    state.sidebar.defaultOpen = null
  }
}

export default mutations
