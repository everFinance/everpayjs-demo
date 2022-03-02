<script lang="ts">
import { ChainType } from 'everpay'
import { computed, defineComponent, ref } from 'vue'
import { useStore } from '@/store'
import { getEverpay, initAndHandleEvents } from './libs/everpay'
import { ConnectAppName } from './store/state'
// import { getEverpay, initAndHandleEvents } from './libs/everpay'
// import { ChainType } from 'everpay'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
    const infoResult = ref('')

    const handleMetaMaskConnect = async () => {
      // update first
      store.commit('updateConnectAppName', ConnectAppName.Metamask)
      await initAndHandleEvents({
        store,
        accChainType: ChainType.ethereum
      })
      if (store.state.account) {
        alert('connect_success')
      }
    }
    const handleArconnectConnect = async () => {
      // update first
      store.commit('updateConnectAppName', ConnectAppName.ArConnect)
      await initAndHandleEvents({
        store,
        accChainType: ChainType.arweave
      })
      if (store.state.account) {
        alert('connect_success')
      }
    }

    // need set isProd to true
    const handleCoinbaseConnect = async () => {
      // update first
      store.commit('updateConnectAppName', ConnectAppName.CoinbaseWallet)
      await initAndHandleEvents({
        store,
        accChainType: ChainType.ethereum
      })
      if (store.state.account) {
        alert('connect_success')
      }
    }

    const handleWalletConnectConnect = async () => {
      // update first
      store.commit('updateConnectAppName', ConnectAppName.WalletConnect)
      await initAndHandleEvents({
        store,
        accChainType: ChainType.ethereum
      })
      if (store.state.account) {
        alert('connect_success')
      }
    }

    const getInfo = async () => {
      const info = await getEverpay().info()
      infoResult.value = JSON.stringify(info)
    }

    return {
      account,
      handleCoinbaseConnect,
      handleMetaMaskConnect,
      handleArconnectConnect,
      handleWalletConnectConnect,
      infoResult,
      getInfo
    }
  }
})

</script>

<template>
  <button @click="handleMetaMaskConnect">
    connect with metamask
  </button>
  <button @click="handleArconnectConnect">
    connect with ArConnect
  </button>
  <button @click="handleCoinbaseConnect">
    connect with Coinbase
  </button>
  <button @click="handleWalletConnectConnect">
    connect with WalletConnect
  </button>
  <div>account: {{ account }}</div>
  <div>
    <button @click="getInfo">
      get info API
    </button>
    <div>{{ infoResult }}</div>
  </div>
</template>
