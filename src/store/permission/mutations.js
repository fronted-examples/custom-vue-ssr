import { SET_ROUTES, CLEAR_ROUTES } from './constant'
import { constantRoutes } from '@/router'

const mutations = {
  [SET_ROUTES]: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)

    // sessionMemory.setItem({ name: 'permission_routes', value: routes })
  },
  [CLEAR_ROUTES]: (state) => {
    state.addRoutes = []
    state.routes = []
  }
}

export default mutations
