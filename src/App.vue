<script lang="ts">
import { ChainType } from 'everpay'
import { defineComponent, ref } from 'vue'
import { ConnectAppName } from './libs/chainLibAdaptor/interface'
import { getEverpay, initAndHandleEvents } from './libs/everpay'
// import { computed, defineComponent, onMounted, ref } from 'vue'
// import { getEverpay, initAndHandleEvents } from './libs/everpay'
// import { ChainType } from 'everpay'

export default defineComponent({
  setup () {
    let everpay = getEverpay()
    const account = ref('')
    const handleMetaMaskConnect = async () => {
      await initAndHandleEvents({
        connectAppName: ConnectAppName.Metamask,
        accChainType: ChainType.ethereum
      })
      everpay = getEverpay()
      account.value = (everpay as any)._config.account
    }
    return {
      account,
      handleMetaMaskConnect
    }
  }
})

</script>

<template>
  <button @click="handleMetaMaskConnect">
    connect with metamask
  </button>
  <div>account: {{ account }}</div>
</template>
