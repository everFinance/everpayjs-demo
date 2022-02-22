/* eslint-disable @typescript-eslint/no-misused-promises */
import Arweave from 'arweave'
import { utils } from 'ethers'
import Everpay, { ChainType } from 'everpay'
import { isProd } from '@/constants'
import { isUndefined } from 'lodash-es'
import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  GetExplorerUrlParams, ChainLibInterface
} from './interface'
import { getChainDecimalByChainType, getTokenAddrByChainType, toBN } from 'everpay/esm/utils/util'
import { ConnectAppName } from '@/store/state'
import { getPstTokenBalance } from '../api'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const arweave = Arweave.init(options)

const genEverpay = (params: GenEverpayParams): Everpay => {
  const { account } = params
  return new Everpay({
    account,
    arJWK: 'use_wallet',
    debug: !isProd
  })
}

const handleChainLoadedWithin1sAsync = async (): Promise<void> => {
  let loaded = false
  return await new Promise((resolve) => {
    window.addEventListener('arweaveWalletLoaded', () => {
      loaded = true
      resolve()
    })
    setTimeout(() => {
      if (!loaded) {
        resolve()
      }
    }, 1000)
  })
}

const getAccountAsync = async (params: GetAccountAsyncParams): Promise<string> => {
  const { userOperateCausedNoAccounts } = params
  await handleChainLoadedWithin1sAsync()
  const isInstalled = !isUndefined(window.arweaveWallet)

  if (!isInstalled) {
    setTimeout(() => {
      window.open('https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap?utm_source=chrome-ntp-icon')
    }, 1000)
    throw new Error('pls_install_arconnect')
  }

  if (userOperateCausedNoAccounts) {
    return ''
  } else {
    try {
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'ACCESS_ALL_ADDRESSES',
        'ACCESS_PUBLIC_KEY',
        'SIGN_TRANSACTION',
        'SIGNATURE'
      ])
      const activeArAddr = await window.arweaveWallet.getActiveAddress()
      return activeArAddr ?? ''
    } catch (e) {
      // TODO: arConnect 缺乏用户取消的详细报错信息
      throw new Error('error.deny_connect')
    }
  }
}

// TODO:
const getDepositGasFeeAsync = async (): Promise<string> => {
  return '0'
}

let handleChainEventsListener: any = null

const handleChainEvents = (params: HandleChainEventsParams): void => {
  const { handleChainEventsCallback } = params
  handleChainEventsListener = (e: any) => {
    const newAddress = e.detail.address
    handleChainEventsCallback(newAddress === null || newAddress === '' || newAddress === undefined)
  }
  window.addEventListener('walletSwitch', handleChainEventsListener)
}

const getTokenBalanceAsync = async (params: GetTokenBalanceAsyncParams): Promise<string> => {
  const { account, token } = params
  const { symbol } = token
  const decimals = getChainDecimalByChainType(token, ChainType.arweave)
  let balance = '0'

  if (!token.chainType.includes(ChainType.arweave)) {
    return '0'
  }

  if (symbol.toLowerCase() === 'ar') {
    const balanceInWei = await arweave.wallets.getBalance(account)
    balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
  } else {
    const contractId = getTokenAddrByChainType(token, ChainType.arweave)
    balance = await getPstTokenBalance({
      contractId,
      address: account
    })
  }
  return balance
}

const getExplorerUrl = (params: GetExplorerUrlParams): string => {
  const { type, value } = params
  const prefix = 'https://viewblock.io/arweave'
  const affix = type === 'address' ? `address/${value}` : `tx/${value}`
  return `${prefix}/${affix}`
}

const disconnect = (connectAppName: ConnectAppName): void => {
  if (handleChainEventsListener != null) {
    window.removeEventListener('walletSwitch', handleChainEventsListener)
  }
}

const arweaveLib: ChainLibInterface = {
  genEverpay,
  getDepositGasFeeAsync,
  getAccountAsync,
  getTokenBalanceAsync,
  getExplorerUrl,
  handleChainEvents,
  disconnect
}

export default arweaveLib
