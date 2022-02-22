import { getEverpay } from '@/libs/everpay'
import chainLibAdaptor from '@/libs/chainLibAdaptor'
import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { Contact, ContactStack, defaultState, DepositPendingItem, EditContactParams, State, StateBalanceItem, WithdrawPendingItem } from './state'
interface SimpleTokenParam {
  chainType: string
  symbol: string
}

// define injection key
// eslint-disable-next-line symbol-description
export const vuexStoreKey: InjectionKey<Store<State>> = Symbol()

export const getBalanceItemHelper = (balances: StateBalanceItem[], balanceItem: SimpleTokenParam): StateBalanceItem | undefined => {
  const found = balances.find((item: StateBalanceItem) => {
    const keys = ['chainType', 'symbol'] as const
    return keys.every(key => {
      return item[key].toUpperCase() === balanceItem[key].toUpperCase()
    })
  })
  return found
}

const getUpdatedBalancesHelper = (balances: StateBalanceItem[], balanceItem: StateBalanceItem): StateBalanceItem[] => {
  const found = getBalanceItemHelper(balances, balanceItem)
  if (found !== undefined && found !== null) {
    found.balance = balanceItem.balance
  } else {
    balances.push(balanceItem)
  }
  return balances
}

const getAccountKeyFromContactStack = (contactStack: ContactStack, account: string): string => {
  const existsAccountsInContactStack = Object.keys(contactStack)
  const found = existsAccountsInContactStack.find(acc => acc.toLowerCase() === account.toLowerCase())
  return found !== undefined ? found : account
}

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
    },
    updateConnectModalVisible (state, visible) {
      state.connectModalVisible = visible
    },
    updateCurrency (state, currency) {
      state.currency = currency
    },
    updateCurrencyPrices (state, currencyPrices) {
      state.currencyPrices = currencyPrices
    },
    updateQuickWithdrawMode (state, enable) {
      state.quickWithdrawMode = enable
    },
    updateEverpayInfo (state, everpayInfo) {
      state.everpayInfo = everpayInfo
    },
    updateEverpayBalances (state, balances) {
      state.everpayBalances = balances
    },
    updateChainBalance (state, balanceItem) {
      state.chainBalances = getUpdatedBalancesHelper(state.chainBalances, balanceItem)
    },
    updateSwapInfo (state, swapInfo) {
      state.swapInfo = swapInfo
    },
    addDepositPending (state, depositPendingItem: DepositPendingItem) {
      if (state.depositPending[state.account] === undefined) {
        state.depositPending[state.account] = []
      }
      state.depositPending[state.account] = [...state.depositPending[state.account], {
        ...depositPendingItem,
        time: Date.now()
      }]
    },
    deleteDepositPending (state, depositPendingItem: DepositPendingItem) {
      if (state.depositPending[state.account] !== undefined && state.depositPending[state.account].length !== 0) {
        const foundIndex = state.depositPending[state.account].findIndex(item => {
          return depositPendingItem.chainTxHash === item.chainTxHash
        })
        if (foundIndex !== -1) {
          state.depositPending[state.account].splice(foundIndex, 1)
        }
      }
    },
    updateDepositPending (state, depositPendingItem: DepositPendingItem) {
      if (state.depositPending[state.account] !== undefined && state.depositPending[state.account].length !== 0) {
        const foundIndex = state.depositPending[state.account].findIndex(item => {
          return depositPendingItem.chainTxHash === item.chainTxHash
        })
        if (foundIndex !== -1) {
          state.depositPending[state.account][foundIndex] = depositPendingItem
        }
      }
    },
    addWithdrawPending (state, withdrawPendingItem: WithdrawPendingItem) {
      if (state.withdrawPending[state.account] === undefined) {
        state.withdrawPending[state.account] = []
      }
      state.withdrawPending[state.account] = [...state.withdrawPending[state.account], {
        ...withdrawPendingItem,
        time: Date.now()
      }]
    },
    deleteWithdrawPending (state, withdrawPendingItem: WithdrawPendingItem) {
      if (state.withdrawPending[state.account] !== undefined && state.withdrawPending[state.account].length !== 0) {
        const foundIndex = state.withdrawPending[state.account].findIndex(item => {
          return withdrawPendingItem.everHash === item.everHash
        })
        if (foundIndex !== -1) {
          state.withdrawPending[state.account].splice(foundIndex, 1)
        }
      }
    },
    updateWithdrawPending (state, withdrawPendingItem: WithdrawPendingItem) {
      if (state.withdrawPending[state.account] !== undefined && state.withdrawPending[state.account].length !== 0) {
        const foundIndex = state.withdrawPending[state.account].findIndex(item => {
          return withdrawPendingItem.everHash === item.everHash
        })
        if (foundIndex !== -1) {
          state.withdrawPending[state.account][foundIndex] = withdrawPendingItem
        }
      }
    },
    resetOriContacts (state) {
      delete state.contacts
    },
    addContact (state, contact: Contact) {
      const { contactStack, account } = state
      const correctAccount = getAccountKeyFromContactStack(contactStack, account)
      if (contactStack[correctAccount] === undefined) {
        contactStack[correctAccount] = []
      }
      contactStack[correctAccount].push(contact)
    },
    editContact (state, params: EditContactParams) {
      const { contactStack, account } = state
      const { index, contact } = params
      const correctAccount = getAccountKeyFromContactStack(contactStack, account)
      if (contactStack[correctAccount] !== undefined && contactStack[correctAccount].length > 0) {
        contactStack[correctAccount][index] = contact
      }
    },
    deleteContact (state, contactIndex: number) {
      const { contactStack, account } = state
      const correctAccount = getAccountKeyFromContactStack(contactStack, account)
      if (contactStack[correctAccount] !== undefined && contactStack[correctAccount].length > 0) {
        contactStack[correctAccount].splice(contactIndex, 1)
      }
    },
    updateisStart (state, start: Boolean) {
      state.nftauction.isStart = start
    },
    updateisEnd (state, end: Boolean) {
      state.nftauction.isEnd = end
    }
  },

  getters: {
    shortAccount: (state) => (count: number): string => {
      if (state.account !== '' && state.account !== undefined && state.account !== null) {
        return `${state.account.slice(0, count)}...${state.account.slice(-count)}`
      }
      return ''
    },

    tokens: (state) => {
      return state.everpayInfo !== undefined ? state.everpayInfo.tokenList : []
    },

    everpayBalance: (state) => (token: SimpleTokenParam): string => {
      const balanceItem = getBalanceItemHelper(state.everpayBalances, token)
      return balanceItem !== undefined ? balanceItem.balance : '0'
    },

    chainBalance: (state) => (token: SimpleTokenParam): string => {
      const balanceItem = getBalanceItemHelper(state.chainBalances, token)
      return balanceItem !== undefined ? balanceItem.balance : '0'
    },

    contacts: (state) => {
      const { contactStack, account } = state
      const correctAccount = getAccountKeyFromContactStack(contactStack, account)
      return contactStack[correctAccount] !== undefined ? contactStack[correctAccount] : []
    }

  },

  actions: {
    async updateEverpayInfoAsync ({ commit }) {
      const everpayInfo = await getEverpay().info()
      commit('updateEverpayInfo', everpayInfo)
    },

    async updateEverpayBalancesAsync ({ state, commit }) {
      const { account } = state
      if (account !== '' && account !== undefined && account !== null) {
        const balances = await getEverpay().balances({ account })
        commit('updateEverpayBalances', balances)
      }
    },

    async updateChainBalanceAsync ({ state, commit }, token) {
      const { account, accChainType, connectAppName } = state
      const { symbol } = token
      let balance = '0'
      if (account !== '' && account !== undefined && account !== null) {
        balance = await chainLibAdaptor.getTokenBalanceAsync(accChainType, { account, connectAppName, token })
      }

      commit('updateChainBalance', {
        chainType: token.chainType,
        symbol,
        balance
      })
    },

    async updateChainBalancesAsync ({ getters, dispatch }) {
      const { tokens } = getters
      for (const token of tokens) {
        await dispatch('updateChainBalanceAsync', token)
      }
    },

    resetAccount ({ state, commit }) {
      commit('updateAccount', '')
      commit('updateEverpayBalances', [])
      commit('resetOriContacts')
      commit('updateConnectAppName', '')
      state.everpayInfo.tokenList.forEach(token => {
        commit('updateChainBalance', {
          chainType: token.chainType,
          symbol: token.symbol,
          balance: '0'
        })
      })
    },

    async updateSwapInfoAsync ({ commit }) {
      const swapInfo = await getEverpay().swapInfo()
      commit('updateSwapInfo', swapInfo)
    }
  },

  modules: {},

  plugins: [createPersistedState()]
})

// define your own `useStore` composition function
export const useStore = function (): Store<State> {
  return baseUseStore(vuexStoreKey)
}
