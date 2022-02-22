/* eslint-disable @typescript-eslint/no-misused-promises */
import { isProd } from '@/constants'
import Everpay, { ChainType } from 'everpay'
import { GenEverpayParams } from '@/libs/chainLibAdaptor/interface'
import chainLibAdaptor from '@/libs/chainLibAdaptor'
import { InitAccountAndEverpayAsyncParams, InitAndHandleEventsParams } from './interface'

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
  const { userOperateCausedNoAccounts, accChainType, connectAppName } = params
  let account = ''
  try {
    account = await chainLibAdaptor.getAccountAsync(accChainType, { connectAppName, userOperateCausedNoAccounts })
    setEverpay(accChainType, { connectAppName, account })
  } catch (e) {
    alert((e as any).message)
  }
}

// 连接、更新余额、绑定 chain 相关事件
export const initAndHandleEvents = async (params: InitAndHandleEventsParams): Promise<void> => {
  const { accChainType, connectAppName } = params
  await initAccountAndEverpayAsync({
    accChainType,
    connectAppName,
    userOperateCausedNoAccounts: false
  })
  chainLibAdaptor.handleChainEvents(accChainType, {
    connectAppName,
    handleChainEventsCallback: async (userOperateCausedNoAccounts) => {
      await initAccountAndEverpayAsync({
        accChainType,
        connectAppName,
        userOperateCausedNoAccounts
      })
    }
  })
}
