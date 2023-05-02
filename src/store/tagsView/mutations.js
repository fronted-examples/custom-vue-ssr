import {
  ADD_VISITED_VIEW,
  ADD_CACHED_VIEW,
  DEL_VISITED_VIEW,
  DEL_CACHED_VIEW,
  DEL_LEFT_VIEWS,
  DEL_RIGHT_VIEWS,
  DEL_OTHERS_VISITED_VIEWS,
  DEL_OTHERS_CACHED_VIEWS,
  DEL_ALL_VISITED_VIEWS,
  DEL_ALL_CACHED_VIEWS,
  UPDATE_VISITED_VIEW
} from './constant'

const mutations = {
  /**
   * 添加已访问页面的tagView
   * @param {*} state
   * @param {*} view
   * @returns
   */
  [ADD_VISITED_VIEW]: (state, view) => {
    if (state.visitedViews.some(v => v.path === view.path)) return

    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  },
  /**
   * 添加已访问页面的缓存tagView
   * @param {*} state
   * @param {*} view
   * @returns
   */
  [ADD_CACHED_VIEW]: (state, view) => {
    if (state.cachedViews.includes(view.name)) return
    if (!view.meta.noCache) {
      state.cachedViews.push(view.name)
    }
  },
  /**
   * 删除已访问页面的tagView
   * @param {*} state
   * @param {*} view
   */
  [DEL_VISITED_VIEW]: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  /**
   * 删除已访问页面的缓存tagView
   * @param {*} state
   * @param {*} view
   */
  [DEL_CACHED_VIEW]: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    index > -1 && state.cachedViews.splice(index, 1)
  },
  /**
   * 删除左侧全部tagView
   * @param {Object} state
   * @param {Object} view
   * @returns {boolean}
   */
  [DEL_LEFT_VIEWS]: (state, view) => {
    const index = state.visitedViews.findIndex(v => v.path === view.path)
    if (index === -1) {
      return
    }
    state.visitedViews = state.visitedViews.filter((item, idx) => {
      if (idx >= index || (item.meta && item.meta.affix)) {
        return true
      }
      const i = state.cachedViews.indexOf(item.name)
      if (i > -1) {
        state.cachedViews.splice(i, 1)
      }
      return false
    })
  },
  /**
   * 删除右侧全部tagView
   * @param {Object} state
   * @param {Object} view
   * @returns {boolean}
   */
  [DEL_RIGHT_VIEWS]: (state, view) => {
    const index = state.visitedViews.findIndex(v => v.path === view.path)
    if (index === -1) {
      return
    }
    state.visitedViews = state.visitedViews.filter((item, idx) => {
      if (idx <= index || (item.meta && item.meta.affix)) {
        return true
      }
      const i = state.cachedViews.indexOf(item.name)
      if (i > -1) {
        state.cachedViews.splice(i, 1)
      }
      return false
    })
  },
  /**
   * 删除其它已访问页面的tagView
   * @param {*} state
   * @param {*} view
   */
  [DEL_OTHERS_VISITED_VIEWS]: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path
    })
  },
  /**
   * 删除其它已访问页面的缓存tagView
   * @param {*} state
   * @param {*} view
   */
  [DEL_OTHERS_CACHED_VIEWS]: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)

    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1)
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = []
    }
  },
  /**
   * 删除所有已访问页面的tagView
   * @param {*} state
   */
  [DEL_ALL_VISITED_VIEWS]: state => {
    // keep affix tags
    const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
    state.visitedViews = affixTags
  },
  /**
   * 删除所有已访问页面的缓存tagView
   * @param {*} state
   */
  [DEL_ALL_CACHED_VIEWS]: state => {
    state.cachedViews = []
  },
  /**
   * 更新某个已访问页面的tagView
   * @param {*} state
   * @param {*} view
   */
  [UPDATE_VISITED_VIEW]: (state, view) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }
}

export default mutations
