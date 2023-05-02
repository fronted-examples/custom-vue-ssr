import { UPDATE_USER_INFO, UPDATE_TOKEN, UPDATE_ROLES } from './constant'

import { sessionMemory } from '@/utils/Storage.js'

const mutations = {
  /**
 * 更新用户信息
 */
  [UPDATE_USER_INFO]: (state, userInfo) => {
    // state.userInfo = userInfo
    sessionMemory.removeItem('userInfo')
  },

  /**
 * 更新token的信息
 * tokens存储token，refreshToken(刷新token)，expiredTime(过期时间)
 */
  [UPDATE_TOKEN]: (state, token) => {
    // state.token = token
    sessionMemory.removeItem('token')
  },

  /**
   * @description 更新roles
   * @param {*} state
   * @param {*} roles
   */
  [UPDATE_ROLES]: (state, roles) => {
    // state.roles = roles
    sessionMemory.removeItem('roles')
  }
}

export default mutations
