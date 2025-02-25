import api from '@/api'

const initialState = () => {
  return {
    user: null,
    userInfo: null,
    token: null,
    roles: null
  }
}

const getters = {
  firstName (state) {
    if (state.user && state.user.name) {
      return state.user.name.split(' ')[0]
    } else if (state.userInfo) {
      return state.userInfo.name.split(' ')[0]
    } else {
      return ''
    }
  },
  /**
   * Return a safe name for adding to Compliance Logs
   */
  logName (state) {
    if (state.user) {
      if (state.user.name) {
        return state.user.name
      } else if (state.userInfo && state.userInfo.name) {
        return state.userInfo.name
      } else {
        return state.user.email
      }
    } else {
      return 'Unauthenticated user'
    }
  }
}

const mutations = {
  resetState (state) {
    Object.assign(state, initialState())
  },
  authenticate (state, data) {
    state.user = data.user
    state.token = data.token
  },
  userroles (state, data) {
    state.roles = data
  },
  userInfo (state, data) {
    state.userInfo = data
  }
}

const actions = {
  async reset ({commit}) {
    commit('resetState')
  },
  async init ({state, commit}, data) {
    commit('authenticate', data)
    if (!state.userInfo) { // check if info is already cached before fetching
      try {
        let res = await api('admin', {
          action: 'getAuth0UserInfo',
          version: 2
        })
        if (res.success && res.hasOwnProperty('data') && res.data) {
          commit('userInfo', res.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
  },
  async roles ({state, commit}) {
    if (state.roles) {
      return
    } // already cached, so no need to fetch again
    try {
      let res = await api('admin', {
        action: 'getAuth0UserRoles',
        version: 2
      })
      if (res.success && res.hasOwnProperty('data') && res.data) {
        commit('userroles', res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default {
  namespaced: true,
  state: initialState(),
  getters,
  actions,
  mutations
}
