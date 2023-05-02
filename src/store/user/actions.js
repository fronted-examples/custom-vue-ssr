import { UPDATE_USER_INFO, UPDATE_TOKEN, UPDATE_ROLES, LOGOUT } from './constant'
import { userLogout } from '@/api/v1/user'
import { resetRouter } from '@/router'

const actions = {
  [UPDATE_USER_INFO]: (context, data) => {
    context.commit(UPDATE_USER_INFO, data)
  },

  [UPDATE_TOKEN]: (context, data) => {
    context.commit(UPDATE_TOKEN, data)
  },

  [UPDATE_ROLES]: (context, roles) => {
    context.commit(UPDATE_ROLES, roles)
  },
  [LOGOUT]: (context) => {
    return new Promise((resolve, reject) => {
      userLogout().then(() => {
        context.commit(UPDATE_USER_INFO, null)
        context.commit(UPDATE_TOKEN, '')
        context.commit(UPDATE_ROLES, [])

        resetRouter()

        context.dispatch('tagsView/delAllViews', {}, { root: true })
        context.dispatch('app/resetDefaultOpen', {}, { root: true })
        context.dispatch('permission/clearRoutes', {}, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  clearUserInfoAndTokens: ({ commit, dispatch }) => {
    commit(UPDATE_USER_INFO, null)
    commit(UPDATE_TOKEN, '')
    commit(UPDATE_ROLES, [])

    dispatch('tagsView/delAllViews', {}, { root: true })
    dispatch('app/resetDefaultOpen', {}, { root: true })
    dispatch('permission/clearRoutes', {}, { root: true })
  }
}

export default actions
