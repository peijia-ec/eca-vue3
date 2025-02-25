const initialState = () => {
  return {
    sub: null,
    email: null,
    name: null,
    photo: null,
    token: null,
    refresh: null,
    roles: null
  }
}

const getters = {
  firstName (state) {
    if (state.name) {
      return state.name.split(' ')[0]
    } else {
      return ''
    }
  },
  /**
   * Return a safe name for adding to Compliance Logs
   */
  logName (state) {
    if (state.name) {
      return state.name
    } else if (state.email) {
      return state.email
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
    state.sub = data.sub
    state.email = data.email
    state.name = data.name
    state.photo = data.photo
    state.roles = data.roles
    state.token = data.token
    state.refresh = data.refresh
  }
}

const actions = {
  async reset ({commit}) {
    commit('resetState')
  },
  async update ({state, commit}, data) {
    commit('authenticate', data)
  }
}

export default {
  namespaced: true,
  state: initialState(),
  getters,
  actions,
  mutations
}
