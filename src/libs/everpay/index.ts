/* eslint-disable @typescript-eslint/no-misused-promises */
import { isProd } from '@/constants'
import Everpay, { ChainType } from 'everpay'
import { GenEverpayParams } from '@/libs/chainLibAdaptor/interface'
import chainLibAdaptor from '@/libs/chainLibAdaptor'
import { InitAccountAndEverpayAsyncParams, InitAndHandleEventsParams } from './interface'
import { ConnectAppName, State } from '@/store/state'
import { Store } from 'vuex'

let everpay = new Everpay({ debug: !isProd })

const setEverpay = (chainType: ChainType, params: GenEverpayParams): void => {
  const { account } = params
  if (account === '') {
    everpay = new Everpay({
      account,
      debug: !isProd
    })
  } else {
    everpay = chainLibAdaptor.genEverpay(chainType, params)
  }
}

export const getEverpay = (): Everpay => everpay

const initAccountAndEverpayAsync = async (params: InitAccountAndEverpayAsyncParams): Promise<void> => {
  const { userOperateCausedNoAccounts, store, accChainType } = params
  const connectAppName = store.state.connectAppName
  let account = ''
  try {
    // 先更新 accChainType，来标识 充值、提现页面的 Token 筛选
    store.commit('updateAccChainType', accChainType) // 钱包类型
    account = await chainLibAdaptor.getAccountAsync(accChainType, { connectAppName, userOperateCausedNoAccounts })
    setEverpay(accChainType, { connectAppName, account })
    store.commit('updateAccount', account)
    store.commit('updateConnectAppName', connectAppName)
  } catch (e) {
    await store.dispatch('resetAccount')
    alert((e as any).message)
  }
}

// 连接、更新余额、绑定 chain 相关事件
export const initAndHandleEvents = async (params: InitAndHandleEventsParams): Promise<void> => {
  const { store, accChainType } = params
  await initAccountAndEverpayAsync({
    accChainType,
    userOperateCausedNoAccounts: false,
    store
  })
  chainLibAdaptor.handleChainEvents(accChainType, {
    store,
    handleChainEventsCallback: async (userOperateCausedNoAccounts) => {
      await initAccountAndEverpayAsync({
        accChainType,
        userOperateCausedNoAccounts,
        store
      })
    }
  })
}

export const disconnectWebsite = async (store: Store<State>): Promise<void> => {
  const { accChainType, connectAppName } = store.state
  chainLibAdaptor.disconnect(accChainType, connectAppName)
  setEverpay(ChainType.ethereum, {
    account: '',
    connectAppName: ConnectAppName.Metamask
  })
  await store.dispatch('resetAccount')
}
