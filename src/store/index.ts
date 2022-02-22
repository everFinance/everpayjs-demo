import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { defaultState, State } from './state'

// define injection key
// eslint-disable-next-line symbol-description
export const vuexStoreKey: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
  state: defaultState,

  mutations: {
    updateAccount (state, account) {
      state.account = account
    },
    updateAccChainType (state, accChainType) {
      state.accChainType = accChainType
    },
    updateConnectAppName (state, connectAppName) {
      state.connectAppName = connectAppName
    }
  },

  getters: {

  },

  actions: {

    resetAccount ({ state, commit }) {
      commit('updateAccount', '')
      commit('updateConnectAppName', '')
    }
  },

  modules: {},

  plugins: [createPersistedState()]
})

// define your own `useStore` composition function
export const useStore = function (): Store<State> {
  return baseUseStore(vuexStoreKey)
}
