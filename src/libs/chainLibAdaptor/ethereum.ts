/* eslint-disable @typescript-eslint/no-misused-promises */
import { Web3Provider } from '@ethersproject/providers'
import Everpay, { ChainType } from 'everpay'
import { utils, Contract } from 'ethers'
import { INFURA_ID, isProd } from '@/constants'
import { isUndefined } from 'lodash-es'
import { ConnectAppName } from '@/store/state'
import WalletLink from 'walletlink'
import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  GetExplorerUrlParams, ChainLibInterface
} from './interface'

import { getChainDecimalByChainType, getTokenAddrByChainType, toBN } from 'everpay/esm/utils/util'
import erc20Abi from 'everpay/esm/constants/abi/erc20'
import WalletConnectProvider from '@walletconnect/web3-provider'

//  Create WalletConnect Provider
let savedWalletConnectProvider: WalletConnectProvider
let disconnectHandler = (): void => {}
let savedWeb3Provider: Web3Provider

// export only for uniswap v3 mining
export const getConnectProvider = (connectAppName: ConnectAppName): any => {
  if (
    connectAppName === ConnectAppName.imToken ||
    connectAppName === ConnectAppName.Metamask ||
    connectAppName === ConnectAppName.BitKeep
  ) {
    return window.ethereum
  }
  if (connectAppName === ConnectAppName.CoinbaseWallet) {
    const walletLink = new WalletLink({
      appName: 'everPay',
      darkMode: false
    })
    const ETH_JSONRPC_URL = `https://mainnet.infura.io/v3/${INFURA_ID}`

    // Initialize a Web3 Provider object
    const ethereum = walletLink.makeWeb3Provider(ETH_JSONRPC_URL, 1)
    return ethereum
  }

  if (savedWalletConnectProvider == null) {
    savedWalletConnectProvider = new WalletConnectProvider({
      infuraId: INFURA_ID
    })
  }
  return savedWalletConnectProvider
}

const getSelectedAddress = (connectProvider: any): string => {
  const selectedAddress: string | null = connectProvider.selectedAddress
  if (selectedAddress !== '' && selectedAddress !== null && selectedAddress !== undefined) {
    return connectProvider.selectedAddress
  } else {
    return ''
  }
}

const genEverpay = (params: GenEverpayParams): Everpay => {
  const { connectAppName, account } = params
  const connectProvider = getConnectProvider(connectAppName)
  savedWeb3Provider = new Web3Provider(connectProvider)
  const ethConnectedSigner = savedWeb3Provider.getSigner()
  return new Everpay({
    account,
    ethConnectedSigner,
    debug: !isProd
  })
}

const checkNetworkAsync = async (provider: Web3Provider): Promise<void> => {
  const network = await provider.getNetwork()
  const isMainnet = network.chainId === 1
  const isKovan = network.chainId === 42

  if (isProd && !isMainnet) {
    throw new Error('pls_change_to_mainnet')
  }

  if (!isProd && !isKovan) {
    throw new Error('pls_change_to_kovan')
  }
}

const getAccountByWindowEthereumAsync = async (params: GetAccountAsyncParams): Promise<string> => {
  const { connectAppName, userOperateCausedNoAccounts } = params
  const connectProvider = getConnectProvider(connectAppName)
  const isInstalled = !isUndefined(connectProvider)
  const isConnected = isInstalled && getSelectedAddress(connectProvider) !== ''

  if (!isInstalled) {
    throw new Error('pls_use_ethereum_wallet')
  }

  // metamask ??????????????? window.ethereum ???????????? ?????? network???????????????????????????
  const provider = new Web3Provider(connectProvider)
  await checkNetworkAsync(provider)

  if (!isConnected) {
    // ???????????? metamask ??? ????????????????????????
    if (userOperateCausedNoAccounts) {
      return ''
    }
    await connectProvider.request({ method: 'eth_requestAccounts' })
  }
  const accounts = await provider.listAccounts()
  const account = accounts[0] ?? ''
  return account
}

const getAccountByWalletConnectAsync = async (params: GetAccountAsyncParams): Promise<string> => {
  const { userOperateCausedNoAccounts } = params
  if (savedWalletConnectProvider != null) {
    await savedWalletConnectProvider.disconnect()
  }
  savedWalletConnectProvider = new WalletConnectProvider({
    infuraId: INFURA_ID
  })

  const isConnected = savedWalletConnectProvider.connected

  if (!isConnected) {
    // ???????????? metamask ??? ????????????????????????
    if (userOperateCausedNoAccounts) {
      return ''
    }
    try {
      await savedWalletConnectProvider.enable()
    } catch (e) {
      if ((e as any).message !== 'User closed modal') {
        throw e
      } else {
        return ''
      }
    }
  }
  const provider = new Web3Provider(savedWalletConnectProvider)
  // walletConnect ?????????????????????
  try {
    await checkNetworkAsync(provider)
  } catch (e) {
    await savedWalletConnectProvider.disconnect()
    throw e
  }
  const accounts = await provider.listAccounts()
  const account = accounts[0] ?? ''

  // wallet connect ?????????????????????????????????????????????????????????
  if (!isConnected) {
    disconnectHandler()
  }

  return account
}

const getAccountAsync = async (params: GetAccountAsyncParams): Promise<string> => {
  const { connectAppName } = params
  if (connectAppName === ConnectAppName.WalletConnect) {
    return await getAccountByWalletConnectAsync(params)
  } else {
    return await getAccountByWindowEthereumAsync(params)
  }
}

const getDepositGasFeeAsync = async (): Promise<string> => {
  const gasPrice = await savedWeb3Provider.getGasPrice()
  // TODO: ??????
  const gasLimit = 22650
  return utils.formatEther(gasPrice.mul(gasLimit))
}

let accountsChangeListener: any = null
let chainChangeListener: any = null
let disconnectListener: any = null

const handleChainEvents = (params: HandleChainEventsParams): void => {
  const { store, handleChainEventsCallback } = params
  const connectAppName = store.state.connectAppName
  const connectProvider = getConnectProvider(connectAppName)
  if (connectProvider !== undefined) {
    // wallet connect ??????????????????wallet connect ??????????????? address/???????????????????????????????????????????????? address/????????????????????????
    if (connectAppName !== ConnectAppName.WalletConnect) {
      accountsChangeListener = (accounts: string[]) => {
        handleChainEventsCallback(accounts.length <= 0)
      }
      chainChangeListener = async (network: string | number) => {
        // coinbase ????????????????????????????????????????????????????????????  callback
        // Metamask ?????? 0x1 ??????16???????????? coinbase ?????? 42 ???number
        const networkId = toBN(network).toNumber()
        const isMainnet = networkId === 1
        const isKovan = networkId === 42
        if ((isProd && !isMainnet) ||
        (!isProd && !isKovan)
        ) {
          await store.dispatch('resetAccount')
          window.location.reload()
        }
      }

      connectProvider.on('accountsChanged', accountsChangeListener)
      connectProvider.on('chainChanged', chainChangeListener)
    }

    disconnectHandler = () => {
      // walletConnect ??? disconnect ???????????????????????????????????????????????????
      const connectProvider = getConnectProvider(connectAppName)
      disconnectListener = async () => {
        await store.dispatch('resetAccount')
        window.location.reload()
      }
      connectProvider.on('disconnect', disconnectListener)
    }

    disconnectHandler()
  }
}

const getTokenBalanceAsync = async (params: GetTokenBalanceAsyncParams): Promise<string> => {
  const { connectAppName, account, token } = params

  if (!token.chainType.includes(ChainType.ethereum)) {
    return '0'
  }

  const connectProvider = getConnectProvider(connectAppName)
  const provider = new Web3Provider(connectProvider)
  const { symbol } = token
  const decimals = getChainDecimalByChainType(token, ChainType.ethereum)
  const tokenAddr = getTokenAddrByChainType(token, ChainType.ethereum)
  let balance = '0'

  if (symbol.toLowerCase() === 'eth') {
    const balanceInWei = await provider.getBalance(account)
    balance = toBN(utils.formatEther(balanceInWei)).toString()
  } else {
    const erc20R = new Contract(tokenAddr.toLowerCase(), erc20Abi, provider)
    const balanceInWei = await erc20R.balanceOf(account)
    balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
  }
  return balance
}

const getExplorerUrl = (params: GetExplorerUrlParams): string => {
  const { type, value } = params
  const prefix = isProd ? 'https://etherscan.io' : 'https://kovan.etherscan.io'
  const affix = type === 'tx' ? `tx/${value}` : `address/${value}`
  return `${prefix}/${affix}`
}

const disconnect = (connectAppName: ConnectAppName): void => {
  const connectProvider = getConnectProvider(connectAppName)
  const chainChangeListener: any = null
  const disconnectListener: any = null
  if (accountsChangeListener != null) {
    connectProvider.removeListener('accountsChanged', accountsChangeListener)
  }
  if (chainChangeListener != null) {
    connectProvider.removeListener('chainChanged', chainChangeListener)
  }

  // wallet connect ????????????
  // ?????? wallet connect ??????????????????????????????????????????????????????????????? wallet connect ??????????????????
  // ????????? metamask ???????????????
  if (connectAppName === ConnectAppName.WalletConnect) {
    connectProvider.disconnect()
  } else if (chainChangeListener != null) {
    connectProvider.removeListener('disconnect', disconnectListener)
  }
}

const ethereumLib: ChainLibInterface = {
  genEverpay,
  getDepositGasFeeAsync,
  getAccountAsync,
  getTokenBalanceAsync,
  getExplorerUrl,
  handleChainEvents,
  disconnect
}

export default ethereumLib
