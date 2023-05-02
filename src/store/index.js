import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate'

import app from './app/index'
import user from './user/index'
import permission from './permission/index'
import tagsView from './tagsView'

Vue.use(Vuex)

export const createStore = () => {
    return new Vuex.Store({
        modules: {
            app,
            user,
            permission,
            tagsView
        }
    })
}