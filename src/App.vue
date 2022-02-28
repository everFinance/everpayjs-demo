<script lang="ts">
import { ChainType } from 'everpay'
import { computed, defineComponent } from 'vue'
import { useStore } from '@/store'
import { initAndHandleEvents } from './libs/everpay'
import { ConnectAppName } from './store/state'
// import { computed, defineComponent, onMounted, ref } from 'vue'
// import { getEverpay, initAndHandleEvents } from './libs/everpay'
// import { ChainType } from 'everpay'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
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
    return {
      account,
      handleMetaMaskConnect,
      handleArconnectConnect
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
  <div>account: {{ account }}</div>
</template>
