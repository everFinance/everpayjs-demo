/* eslint-disable @typescript-eslint/no-misused-promises */
import Arweave from 'arweave'
import { utils } from 'ethers'
import Everpay, { ChainType } from 'everpay'
import { InstallArweaveWalletLink, isProd } from '@/constants'
import isUndefined from 'lodash/isUndefined'

import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  GetMinedDepositChainTxHashAsyncParams, GetMinedDepositChainTxHashResult, GetExplorerUrlParams, ChainLibInterface
} from './interface'
import { fromDecimalToUnit, getChainDecimalByChainType, getTokenAddrByChainType, isArweaveL2PSTTokenSymbol, toBN } from 'everpay/esm/utils/util'
import { ConnectAppName } from '@/store/state'
import { getPstTokenBalance, isArweaveInteractionConfirmed } from '../api'
import { checkArPermissions } from 'everpay/esm/lib/arweave'
import { sendRequest } from 'everpay/esm/api'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const arweave = Arweave.init(options)

const genEverpay = async (chainType: ChainType, params: GenEverpayParams): Promise<Everpay> => {
  const { account } = params
  return new Everpay({
    account,
    chainType,
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

const isInstalledApp = (connectAppName: ConnectAppName): boolean => {
  if (connectAppName === ConnectAppName.BitKeep) {
    return !isUndefined(window.arweaveWallet) && (window as any).isBitKeep === true
  } else if (connectAppName === ConnectAppName.Finnie) {
    return !isUndefined(window.arweaveWallet) && !isUndefined((window as any).koii)
  } else if (connectAppName === ConnectAppName.MathWallet) {
    return !isUndefined(window.arweaveWallet) && (window.arweaveWallet as any).walletName === 'mathwallet'
  } else {
    return !isUndefined(window.arweaveWallet) && (window.arweaveWallet as any).walletName === 'ArConnect'
  }
}

const getAccountAsync = async (chainType: ChainType, params: GetAccountAsyncParams): Promise<string> => {
  const { userOperateCausedNoAccounts } = params
  await handleChainLoadedWithin1sAsync()
  const isInstalled = isInstalledApp(params.connectAppName)

  if (!isInstalled) {
    setTimeout(() => {
      window.open(InstallArweaveWalletLink[
        params.connectAppName as ConnectAppName.ArConnect | ConnectAppName.BitKeep | ConnectAppName.Finnie | ConnectAppName.MathWallet
      ])
    }, 1000)
    throw new Error('pls_install_arweave_wallet')
  }

  if (userOperateCausedNoAccounts) {
    return ''
  } else {
    try {
      await checkArPermissions([
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
const getDepositGasFeeAsync = async (chainType: ChainType, address: string): Promise<string> => {
  try {
    const result = await sendRequest({
      url: `https://arweave.net/price/0/${address}`,
      method: 'GET'
    })
    return fromDecimalToUnit(result.data, 12)
  } catch {}
  return '0.0001'
}

let handleChainEventsListener: any = null

const handleChainEvents = (chainType: ChainType, params: HandleChainEventsParams): void => {
  const { handleChainEventsCallback } = params
  handleChainEventsListener = (e: any) => {
    const newAddress = e.detail.address
    handleChainEventsCallback(newAddress === null || newAddress === '' || newAddress === undefined)
  }
  window.addEventListener('walletSwitch', handleChainEventsListener)
}

const getTokenBalanceAsync = async (chainType: ChainType, params: GetTokenBalanceAsyncParams): Promise<string> => {
  const { account, token } = params
  const { symbol } = token

  if (token.crossChainInfoList[ChainType.arweave] == null) {
    return '0'
  }
  const decimals = getChainDecimalByChainType(token, ChainType.arweave)
  let balance = '0'

  if (symbol.toLowerCase() === 'ar') {
    const balanceInWei = await arweave.wallets.getBalance(account)
    balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
  } else {
    const contractId = getTokenAddrByChainType(token, ChainType.arweave)
    if (isArweaveL2PSTTokenSymbol(token.symbol)) {
      const balanceInWei = await getPstTokenBalance({
        contractId,
        address: account
      })
      balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
    } else {
      const balanceInWei = await getPstTokenBalance({
        contractId,
        address: account
      })
      balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
    }
  }
  return balance
}

const getMinedDepositChainTxHashAsync = async (chainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams): Promise<GetMinedDepositChainTxHashResult> => {
  const { depositPendingItem } = params
  let minedChainTxHash: any = null
  const isReplaced = false
  const { chainTxHash, symbol } = depositPendingItem

  if (isArweaveL2PSTTokenSymbol(symbol)) {
    const isConfirmed = await isArweaveInteractionConfirmed(chainTxHash)
    if (isConfirmed) {
      minedChainTxHash = chainTxHash
    }
  } else {
    const transactionStatusResponse = await arweave.transactions.getStatus(chainTxHash)
    if (transactionStatusResponse.status === 200 &&
      (transactionStatusResponse.confirmed !== null || (transactionStatusResponse as any).number_of_confirmations >= 15)) {
      minedChainTxHash = chainTxHash
    }
  }
  return {
    chainTxHash: minedChainTxHash,
    isReplaced
  }
}

const getExplorerUrl = (chainType: ChainType, params: GetExplorerUrlParams): string => {
  const { type, value, symbol } = params
  if (isArweaveL2PSTTokenSymbol(symbol as string) && type === 'tx') {
    return `https://sonar.warp.cc/?#/app/interaction/${value}?network=mainnet`
  }
  const prefix = 'https://viewblock.io/arweave'
  const affix = type === 'address' ? `address/${value}` : `tx/${value}`
  return `${prefix}/${affix}`
}

const disconnect = (chainType: ChainType, connectAppName: ConnectAppName): void => {
  if (handleChainEventsListener != null) {
    window.removeEventListener('walletSwitch', handleChainEventsListener)
  }
}

const arweaveLib: ChainLibInterface = {
  genEverpay,
  getDepositGasFeeAsync,
  getAccountAsync,
  getTokenBalanceAsync,
  getMinedDepositChainTxHashAsync,
  getExplorerUrl,
  handleChainEvents,
  disconnect
}

export default arweaveLib
