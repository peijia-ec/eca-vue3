import Vuex from 'vuex'
import goauth from './goauth'
import info from './info'
import coins from './coins'
import orders from './orders'
import VuexPersist from 'vuex-persist'
import { getAge } from './helpers.js'
import packageJson from '../../package.json'
import api from '@/api'
import moment from 'dayjs'

const vuexPersist = new VuexPersist({
  key: 'eca',
  storage: localStorage,
  reducer: (state) => ({
    version: state.version,
    requireRefetchFRC: state.requireRefetchFRC,
    updated: state.updated,
    goauth: state.goauth,
    info: state.info,
    orders: {
      orders: state.orders.orders,
      stuck: state.orders.stuck,
      snoozed: state.orders.snoozed
    },
  })
})

const debug = process.env.NODE_ENV !== 'production'

const initialState = () => {
  return {
    updated: null,
    requireRefetchFRC: false,
    banReasons: []
  }
}

const mutations = {
  setValue (state, payload) {
    for (let key of Object.keys(payload)) {
      state[key] = payload[key]
    }
  },
  updated (state) {
    state.updated = moment().format()
  },
  resetState (state) {
    Object.assign(state, initialState())
  }
}

const actions = {
  async updateAll ({ state, rootState, commit, dispatch }, force = false) {
    const age = getAge(state.updated)
    const age2 = getAge(rootState.info.infoUpdated)
    if (rootState.goauth.token !== null && (force || !age || age.asMinutes() >= 3 || !age2 || age2.asMinutes() >= 3)) {
      console.log('Updating all store')
      commit('updated')
      dispatch('info/update')
      dispatch('coins/update')
      dispatch('orders/fetchDashboard')
    } else {
      console.log('Using cached store')
    }
  },
  async init ({ dispatch, commit, rootState }) {
    dispatch('refetchFRC')
    if (rootState.goauth.token !== null) {
      commit('orders/init')
      dispatch('coins/init')
      dispatch('getBanReasons')
    }
  },
  resetStore ({ commit, dispatch }) {
    commit('resetState')
    dispatch('goauth/reset')
    dispatch('info/reset')
    dispatch('orders/reset')
    dispatch('coins/reset')
    localStorage.removeItem('eca')
  },
  refetchFRC ({ rootState, commit }) {
    if (packageJson.version !== rootState.version) {
      commit('setValue', {
        requireRefetchFRC: true,
        version: packageJson.version
      })
    }
  },
  async getBanReasons ({ commit }) {
    try {
      let data = await api('admin', {
        action: 'getBanReason',
        version: 2
      })
      if (data.success) {
        commit('setValue', { banReasons: data.data && data.data.reason })
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default new Vuex.createStore({
  state: initialState(),
  actions,
  mutations,
  modules: {
    goauth,
    info,
    coins,
    orders
  },
  strict: debug,
  plugins: [vuexPersist.plugin]
})
