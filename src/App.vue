<script lang="ts">
import { ChainType } from 'everpay'
import { isSmartAccount } from 'everpay/esm/utils/util'
import { computed, defineComponent, ref, onMounted } from 'vue'
import { useStore } from '@/store'
import { disconnectWebsite, getEverpay, initAndHandleEvents, setSmartAccountEverpay } from './libs/everpay'
import { ConnectAppName } from './store/state'
// import { getEverpay, initAndHandleEvents } from './libs/everpay'
// import { ChainType } from 'everpay'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
    const accChainType = computed(() => store.state.accChainType)
    const infoResult = ref('')
    const balanceResult = ref('')

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

    const handleEverIdLogin = async () => {
      const authResult = await getEverpay().smartAccountAuth('https://app-dev.permaswap.network/permalogo.svg')
      console.log('account', authResult.account)
      setSmartAccountEverpay(authResult.account)
      store.commit('updateRegistered', true)
      store.commit('updateAccount', account)
      alert('login_success')
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

    const getBalance = async () => {
      const balance = await getEverpay().balances()
      balanceResult.value = JSON.stringify(balance)
    }

    const transfer = async () => {
      const result = await getEverpay().transfer({
        tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
        amount: '1',
        to: '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM'
      })
      console.log('transfer result', result)
    }

    const bundle = async () => {
      const bundleData = await getEverpay().getBundleData([
        {
          tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
          from: '0x26361130d5d6E798E9319114643AF8c868412859',
          to: '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo',
          amount: '0.001'
        },
        {
          tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
          from: '0x26361130d5d6E798E9319114643AF8c868412859',
          to: '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM',
          amount: '10'
        }
      ])
      const bundleDataWithSigs = await getEverpay().signBundleData(bundleData)
      console.log('bundleDataWithSigs', bundleDataWithSigs)
      if (isSmartAccount(store.state.account)) {
        alert('Not support EverID cross domain bundle yet')
        return
      }
      try {
        const bundleResult = await getEverpay().bundle({
          tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
          to: '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo',
          // bundle 批量转账的 外部转账 amount 可为 0
          amount: '0',
          // 特定 data
          data: {
            bundle: bundleDataWithSigs
          }
        })
        console.log(bundleResult)
      } catch (e) {
        console.log(e)
      }
    }

    const disconnect = async () => {
      disconnectWebsite(store)
    }

    onMounted(() => {
      if (account.value) {
          if (isSmartAccount(account.value)) {
            setSmartAccountEverpay(account.value)
            return
          }
          if (accChainType) {
            initAndHandleEvents({
              accChainType: accChainType.value as ChainType,
              store,
            })
          }
        }
    })

    return {
      account,
      handleCoinbaseConnect,
      handleMetaMaskConnect,
      handleArconnectConnect,
      handleWalletConnectConnect,
      handleEverIdLogin,
      infoResult,
      getInfo,
      balanceResult,
      getBalance,
      transfer,
      bundle,
      disconnect
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
  <button @click="handleEverIdLogin">
    connect with EverID
  </button>

  <!-- <button @click="handleCoinbaseConnect">
    connect with Coinbase
  </button>
  <button @click="handleWalletConnectConnect">
    connect with WalletConnect
  </button> -->
  <div>account: {{ account }}</div>
  <div>
    <button @click="getInfo">
      get info API
    </button>
    <div>{{ infoResult }}</div>
  </div>
  <div>
    <button @click="getBalance">
      get balance API
    </button>
    <div>{{ balanceResult }}</div>
  </div>
  <div>
    <button @click="transfer">
      transfer API
    </button>
  </div>
  <div>
    <button @click="bundle">
      bundle API
    </button>
  </div>
  <div>
    <button @click="disconnect">
      disconnect
    </button>
  </div>
</template>
