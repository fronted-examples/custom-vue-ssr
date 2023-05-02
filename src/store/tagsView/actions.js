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

const actions = {
  [ADD_VISITED_VIEW]: ({ commit }, view) => {
    commit(ADD_VISITED_VIEW, view)
  },

  [ADD_CACHED_VIEW]: ({ commit }, view) => {
    commit(ADD_CACHED_VIEW, view)
  },

  addView: ({ dispatch }, view) => {
    dispatch(ADD_VISITED_VIEW, view)
    dispatch(ADD_CACHED_VIEW, view)
  },

  [DEL_VISITED_VIEW]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_VISITED_VIEW, view)
      resolve([...state.visitedViews])
    })
  },

  [DEL_CACHED_VIEW]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_CACHED_VIEW, view)
      resolve([...state.cachedViews])
    })
  },

  delView: ({ dispatch, state }, view) => {
    return new Promise(resolve => {
      dispatch(DEL_VISITED_VIEW, view)
      dispatch(DEL_CACHED_VIEW, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  [DEL_LEFT_VIEWS]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_LEFT_VIEWS, view)
      resolve([...state.visitedViews])
    })
  },

  [DEL_RIGHT_VIEWS]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_RIGHT_VIEWS, view)
      resolve([...state.visitedViews])
    })
  },
  [DEL_OTHERS_VISITED_VIEWS]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_OTHERS_VISITED_VIEWS, view)
      resolve([...state.visitedViews])
    })
  },

  [DEL_OTHERS_CACHED_VIEWS]: ({ commit, state }, view) => {
    return new Promise(resolve => {
      commit(DEL_OTHERS_CACHED_VIEWS, view)
      resolve([...state.cachedViews])
    })
  },

  delOthersViews ({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch(DEL_OTHERS_VISITED_VIEWS, view)
      dispatch(DEL_OTHERS_CACHED_VIEWS, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },

  [DEL_ALL_VISITED_VIEWS]: ({ commit, state }) => {
    return new Promise(resolve => {
      commit(DEL_ALL_VISITED_VIEWS)
      resolve([...state.visitedViews])
    })
  },
  [DEL_ALL_CACHED_VIEWS]: ({ commit, state }) => {
    return new Promise(resolve => {
      commit(DEL_ALL_CACHED_VIEWS)
      resolve([...state.cachedViews])
    })
  },

  delAllViews ({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch(DEL_ALL_VISITED_VIEWS, view)
      dispatch(DEL_ALL_CACHED_VIEWS, view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },

  [UPDATE_VISITED_VIEW]: ({ commit }, view) => {
    commit(UPDATE_VISITED_VIEW, view)
  }

}

export default actions
