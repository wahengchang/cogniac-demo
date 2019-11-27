import axios from 'axios'

export const state = () => ({
  authUser: null
})

export const mutations = {
  SET_USER (state, {user, c = '' /*ccookie*/}) {
    state.authUser = user
    state.c = c
  }
}

export const getters = {
  GET_C: (state, getters) => {
    return state.c
  }
}

export const actions = {
  // nuxtServerInit is called by Nuxt.js before server-rendering every page
  nuxtServerInit ({ commit }, { req }) {
    if (req.session && req.session.authUser) {
      const {authUser: user, c} = req.session
      commit('SET_USER', {user, c})
    }
  },
  async login ({ commit }, { username, password }) {
    try {
      const { data } = await axios.post('/api/login', { username, password })
      const {username: user, c} = data
      commit('SET_USER', {user, c})
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Bad credentials')
      }
      throw error
    }
  },

  async logout ({ commit }) {
    await axios.post('/api/logout')
    commit('SET_USER', null)
  }

}
