/* eslint-disable @typescript-eslint/no-misused-promises */
import { Web3Provider } from '@ethersproject/providers'
import Everpay, { ChainType } from 'everpay'
import { utils, Contract } from 'ethers'
import { INFURA_ID, isProd, InstallEthereumWalletLink } from '@/constants'
import isUndefined from 'lodash/isUndefined'
import { ConnectAppName } from '@/store/state'
import WalletLink from 'walletlink'
import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  GetMinedDepositChainTxHashAsyncParams, GetMinedDepositChainTxHashResult, GetExplorerUrlParams, ChainLibInterface
} from './interface'

import { getChainDecimalByChainType, getTokenAddrByChainType, toBN } from 'everpay/esm/utils/util'
import erc20Abi from 'everpay/esm/constants/abi/erc20'
import Provider from '@walletconnect/ethereum-provider'
import { NATIVE_CHAIN_TOKENS } from 'everpay/esm/constants'

//  Create WalletConnect Provider
let savedWalletConnectProvider: any
let disconnectHandler = (): void => {}
let savedWeb3Provider: Web3Provider

const walletConnectOption = {
  projectId: '84f8f9073d8d846d93077ee50b38ad5a', // required
  chains: [1], // required
  showQrModal: true // requires @walletconnect/modal
}

// export only for uniswap v3 mining
export const getConnectProvider = async (connectAppName: ConnectAppName): Promise<any> => {
  if (
    connectAppName === ConnectAppName.imToken ||
    connectAppName === ConnectAppName.Metamask ||
    connectAppName === ConnectAppName.iToken
  ) {
    return window.ethereum
  }
  if (connectAppName === ConnectAppName.BitKeep) {
    return (window as any).bitkeep?.ethereum
  }
  if (connectAppName === ConnectAppName.Safeheron) {
    return (window as any).safeheron
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
    savedWalletConnectProvider = await Provider.init(walletConnectOption as any)
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

const genEverpay = async (chainType: ChainType, params: GenEverpayParams): Promise<Everpay> => {
  const { connectAppName, account } = params
  const connectProvider = await getConnectProvider(connectAppName)
  savedWeb3Provider = new Web3Provider(connectProvider)
  await savedWeb3Provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
  const ethConnectedSigner = savedWeb3Provider.getSigner()

  if (ethConnectedSigner === null || ethConnectedSigner === undefined) {
    throw new Error('ETH_SIGNER_UNDEFINED')
  }

  return new Everpay({
    chainType,
    account,
    ethConnectedSigner,
    debug: !isProd
  })
}

// const checkNetwork = (networkId: number, chainType: ChainType): void => {
//   const isMainnet = networkId === 1
//   const isGoerli = networkId === 5
//   const isMoonbeam = networkId === 1284
//   const isMoonbase = networkId === 1287
//   const isConfluxTestnet = networkId === 71
//   const isConfluxMainnet = networkId === 1030
//   const isBSCMainnet = networkId === 56
//   const isBSCTestnet = networkId === 97
//   const isPlatonMainnet = networkId === 210425
//   const isPlatonTestnet = networkId === 2206132

//   if (chainType === ChainType.ethereum) {
//     if (isProd && !isMainnet) {
//       throw new Error('pls_change_to_mainnet')
//     }

//     if (!isProd && !isGoerli) {
//       throw new Error('pls_change_to_goerli')
//     }
//   }

//   if (chainType === ChainType.moon) {
//     if (!isProd && !isMoonbase) {
//       throw new Error('pls_change_to_moonbase')
//     }
//     if (isProd && !isMoonbeam) {
//       throw new Error('pls_change_to_moonbeam')
//     }
//   }

//   if (chainType === ChainType.conflux) {
//     if (!isProd && !isConfluxTestnet) {
//       throw new Error('pls_change_to_conflux_testnet')
//     }
//     if (isProd && !isConfluxMainnet) {
//       throw new Error('pls_change_to_conflux_mainnet')
//     }
//   }

//   if (chainType === ChainType.bsc) {
//     if (!isProd && !isBSCTestnet) {
//       throw new Error('pls_change_to_bsc_testnet')
//     }
//     if (isProd && !isBSCMainnet) {
//       throw new Error('pls_change_to_bsc_mainnet')
//     }
//   }

//   if (chainType === ChainType.platon) {
//     if (!isProd && !isPlatonTestnet) {
//       throw new Error('pls_change_to_platon_testnet')
//     }
//     if (isProd && !isPlatonMainnet) {
//       throw new Error('pls_change_to_platon_mainnet')
//     }
//   }
// }

// const connectAfterAddAsync = async (connectProvider: any, chainId: string, params: any): Promise<void> => {
//   try {
//     await connectProvider.request({
//       method: 'wallet_switchEthereumChain',
//       params: [{ chainId }]
//     })
//   } catch (switchError: any) {
//     // This error code indicates that the chain has not been added to MetaMask.
//     if (switchError.code === 4902) {
//       await connectProvider.request({
//         method: 'wallet_addEthereumChain',
//         params: [params]
//       })
//     } else {
//       // handle other "switch" errors
//       throw switchError
//     }
//   }
// }
const formatConnectProvider = (connectProvider: any, connectAppName: string): any => {
  const appName = connectAppName.replace(/\s*/g, '').toLocaleLowerCase()
  let provider = null
  if (connectProvider !== undefined && Reflect.has(connectProvider, 'providerMap')) {
    connectProvider.providerMap.forEach((item: any, key: string) => {
      if (appName === key.replace(/\s*/g, '').toLocaleLowerCase()) {
        provider = item
      }
    })
  }
  if (provider !== null) {
    return provider
  }
  return connectProvider
}
const getAccountByWindowEthereumAsync = async (params: GetAccountAsyncParams): Promise<string> => {
  const { connectAppName, userOperateCausedNoAccounts, chainType } = params
  let connectProvider = await getConnectProvider(connectAppName)
  connectProvider = formatConnectProvider(connectProvider, connectAppName)
  const isInstalled = !isUndefined(connectProvider)
  const isConnected = isInstalled && getSelectedAddress(connectProvider) !== ''

  if (!isInstalled) {
    setTimeout(() => {
      if ((InstallEthereumWalletLink as any)[connectAppName] !== undefined) {
        window.open((InstallEthereumWalletLink as any)[connectAppName])
      }
    }, 1000)
    throw new Error('pls_use_ethereum_wallet')
  }

  // metamask 一开始就有 window.ethereum 可以获取 网络 network，所以要做前置检查
  const provider = new Web3Provider(connectProvider)
  // const network = await provider.getNetwork()
  // try {
  //   checkNetwork(network.chainId, chainType)
  // } catch (e) {
  //   if (connectAppName === ConnectAppName.Metamask) {
  //     if (chainType === ChainType.ethereum && !isProd) {
  //       const chainId = '0x' + toBN(5).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'Görli',
  //         nativeCurrency: {
  //           name: 'ETH',
  //           symbol: 'ETH',
  //           decimals: 18
  //         },
  //         rpcUrls: [
  //           'https://rpc.ankr.com/eth_goerli',
  //           'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  //           'https://eth-goerli.public.blastapi.io'
  //         ],
  //         blockExplorerUrls: ['https://goerli.etherscan.io/']
  //       })
  //     } else if (chainType === ChainType.ethereum && isProd) {
  //       const chainId = '0x' + toBN(1).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {})
  //     } else if (chainType === ChainType.moon && !isProd) {
  //       const chainId = '0x' + toBN(1287).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'Moonbase Alpha',
  //         nativeCurrency: {
  //           name: 'DEV',
  //           symbol: 'DEV',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
  //         blockExplorerUrls: ['https://moonbase.moonscan.io/']
  //       })
  //     } else if (chainType === ChainType.moon && isProd) {
  //       const chainId = '0x' + toBN(1284).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'Moonbeam',
  //         nativeCurrency: {
  //           name: 'GLMR',
  //           symbol: 'GLMR',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://rpc.api.moonbeam.network'],
  //         blockExplorerUrls: ['https://moonscan.io/']
  //       })
  //     } else if (chainType === ChainType.conflux && !isProd) {
  //       const chainId = '0x' + toBN(71).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'Conflux eSpace (Testnet)',
  //         nativeCurrency: {
  //           name: 'CFX',
  //           symbol: 'CFX',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://evmtestnet.confluxrpc.com'],
  //         blockExplorerUrls: ['https://evmtestnet.confluxscan.net/']
  //       })
  //     } else if (chainType === ChainType.conflux && isProd) {
  //       const chainId = '0x' + toBN(1030).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'Conflux eSpace',
  //         nativeCurrency: {
  //           name: 'CFX',
  //           symbol: 'CFX',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://evm.confluxrpc.com'],
  //         blockExplorerUrls: ['https://evm.confluxscan.net/']
  //       })
  //     } else if (chainType === ChainType.bsc && !isProd) {
  //       const chainId = '0x' + toBN(97).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'BSC Testnet',
  //         nativeCurrency: {
  //           name: 'BNB',
  //           symbol: 'BNB',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  //         blockExplorerUrls: ['https://testnet.bscscan.com/']
  //       })
  //     } else if (chainType === ChainType.bsc && isProd) {
  //       const chainId = '0x' + toBN(56).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'BSC Mainnet',
  //         nativeCurrency: {
  //           name: 'BNB',
  //           symbol: 'BNB',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://bsc-dataseed1.ninicoin.io'],
  //         blockExplorerUrls: ['https://bscscan.com/']
  //       })
  //     } else if (chainType === ChainType.platon && !isProd) {
  //       const chainId = '0x' + toBN(2206132).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'PlatON Dev2Network',
  //         nativeCurrency: {
  //           name: 'LAT',
  //           symbol: 'LAT',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://devnet2openapi.platon.network/rpc'],
  //         blockExplorerUrls: ['https://devnet2scan.platon.network/']
  //       })
  //     } else if (chainType === ChainType.platon && isProd) {
  //       const chainId = '0x' + toBN(210425).toString(16)
  //       await connectAfterAddAsync(connectProvider, chainId, {
  //         chainId: chainId,
  //         chainName: 'PlatON MainNetwork',
  //         nativeCurrency: {
  //           name: 'LAT',
  //           symbol: 'LAT',
  //           decimals: 18
  //         },
  //         rpcUrls: ['https://openapi2.platon.network/rpc'],
  //         blockExplorerUrls: ['https://scan.platon.network/']
  //       })
  //     } else {
  //       throw e
  //     }
  //   } else {
  //     throw e
  //   }
  // }

  if (!isConnected) {
    // 用户锁定 metamask 或 取消所有地址连接
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
  const { userOperateCausedNoAccounts, chainType, connectAppName } = params
  if (savedWalletConnectProvider != null) {
    await savedWalletConnectProvider.disconnect()
  }
  savedWalletConnectProvider = await Provider.init(walletConnectOption as any)

  // wallet connect connected 为 true 即使没有连接，需要用 session 来判断
  const isConnected: boolean = connectAppName === ConnectAppName.WalletConnect ? !!savedWalletConnectProvider.session : savedWalletConnectProvider.connected

  if (!isConnected) {
    // 用户锁定 metamask 或 取消所有地址连接
    if (userOperateCausedNoAccounts) {
      return ''
    }
    try {
      await savedWalletConnectProvider.enable()
    } catch (e: any) {
      if (e.message !== 'User closed modal') {
        throw e
      } else {
        return ''
      }
    }
  }
  const provider = new Web3Provider(savedWalletConnectProvider)
  // walletConnect 需要做后置检查
  // try {
  //   const network = await provider.getNetwork()
  //   checkNetwork(network.chainId, chainType)
  // } catch (e) {
  //   await savedWalletConnectProvider.disconnect()
  //   throw e
  // }
  const accounts = await provider.listAccounts()
  const account = accounts[0] ?? ''

  // wallet connect 每次都创建了新的实例，事件需要重新指定
  if (!isConnected) {
    disconnectHandler()
  }

  return account
}

const getAccountAsync = async (chainType: ChainType, params: GetAccountAsyncParams): Promise<string> => {
  const { connectAppName } = params
  if (connectAppName === ConnectAppName.WalletConnect) {
    return await getAccountByWalletConnectAsync(params)
  } else {
    return await getAccountByWindowEthereumAsync(params)
  }
}

const getDepositGasFeeAsync = async (chainType: ChainType, address: string): Promise<string> => {
  const gasPrice = await savedWeb3Provider.getGasPrice()
  // TODO: 写死
  const gasLimit = 22650
  return utils.formatEther(gasPrice.mul(gasLimit))
}

let accountsChangeListener: any = null
let chainChangeListener: any = null
let disconnectListener: any = null

const handleChainEvents = async (chainType: ChainType, params: HandleChainEventsParams): Promise<void> => {
  const { store, handleChainEventsCallback } = params
  const connectAppName = store.state.connectAppName
  const connectProvider = await getConnectProvider(connectAppName)
  if (connectProvider !== undefined) {
    // wallet connect 不需要监听，wallet connect 不支持切换 address/网络（只有在最开始的情况下会发生 address/网络变化的情况）
    if (connectAppName !== ConnectAppName.WalletConnect) {
      accountsChangeListener = (accounts: string[]) => {
        handleChainEventsCallback(accounts.length <= 0)
      }
      chainChangeListener = async (network: string | number) => {
        // coinbase 在初始化时如果是其他网络，居然会调用这个  callback
        // Metamask 返回 0x1 这类16进制；而 coinbase 返回 42 等number
        // const networkId = toBN(network).toNumber()
        // try {
        //   checkNetwork(networkId, chainType)
        // } catch {
        //   await store.dispatch('resetAccount')
        //   window.location.reload()
        // }
      }

      connectProvider.on('accountsChanged', accountsChangeListener)
      connectProvider.on('chainChanged', chainChangeListener)
    }

    disconnectHandler = async () => {
      // walletConnect 的 disconnect 事件需要每次创建实例后，再重新指定
      const connectProvider = await getConnectProvider(connectAppName)
      disconnectListener = async () => {
        await store.dispatch('resetAccount')
        window.location.reload()
      }
      connectProvider.on('disconnect', disconnectListener)
    }

    disconnectHandler()
  }
}

const getTokenBalanceAsync = async (chainType: ChainType, params: GetTokenBalanceAsyncParams): Promise<string> => {
  const { connectAppName, account, token } = params

  if (token.crossChainInfoList[chainType] == null) {
    return '0'
  }

  const connectProvider = await getConnectProvider(connectAppName)
  const provider = new Web3Provider(connectProvider)
  const { symbol } = token
  const decimals = getChainDecimalByChainType(token, chainType)
  const tokenAddr = getTokenAddrByChainType(token, chainType)
  let balance = '0'
  const foundNative = NATIVE_CHAIN_TOKENS.find(t => {
    return t.chainType === chainType && t.nativeSymbol === symbol.toLowerCase()
  })
  if (foundNative != null) {
    const balanceInWei = await provider.getBalance(account)
    balance = toBN(utils.formatEther(balanceInWei)).toString()
  } else {
    const erc20R = new Contract(tokenAddr.toLowerCase(), erc20Abi, provider)
    const balanceInWei = await erc20R.balanceOf(account)
    balance = toBN(utils.formatUnits(balanceInWei, decimals)).toString()
  }
  return balance
}

const getMinedDepositChainTxHashAsync = async (chainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams): Promise<GetMinedDepositChainTxHashResult> => {
  const { account, depositPendingItem } = params
  let minedChainTxHash: any = null
  let isReplaced = false
  const { nonce, chainTxHash } = depositPendingItem
  if (savedWeb3Provider != null) {
    const transactionRecipt = await savedWeb3Provider.getTransactionReceipt(chainTxHash)
    if (transactionRecipt?.transactionHash !== undefined) {
      // 已经打包
      minedChainTxHash = transactionRecipt.transactionHash
    } else {
      const currentNonce = await savedWeb3Provider.getTransactionCount(account)
      // 被替换、或者加速了
      if (currentNonce > (nonce as number)) {
        isReplaced = true
      }
    }
  }
  return {
    chainTxHash: minedChainTxHash,
    isReplaced
  }
}

const getExplorerUrl = (chainType: ChainType, params: GetExplorerUrlParams): string => {
  const { type, value } = params
  let prefix = ''
  let affix = ''
  if (chainType === ChainType.ethereum) {
    prefix = isProd ? 'https://etherscan.io' : 'https://goerli.etherscan.io'
  } else if (chainType === ChainType.moon) {
    prefix = isProd ? 'https://moonscan.io' : 'https://moonbase.moonscan.io'
  } else if (chainType === ChainType.conflux) {
    prefix = isProd ? 'https://evm.confluxscan.net' : 'https://evmtestnet.confluxscan.net'
  } else if (chainType === ChainType.bsc) {
    prefix = isProd ? 'https://bscscan.com' : 'https://testnet.bscscan.com'
  } else if (chainType === ChainType.platon) {
    prefix = isProd ? 'https://scan.platon.network' : 'https://devnet2scan.platon.network'
  }
  affix = type === 'tx' ? `tx/${value}` : `address/${value}`
  return `${prefix}/${affix}`
}

const disconnect = async (chainType: ChainType, connectAppName: ConnectAppName): Promise<void> => {
  const connectProvider = await getConnectProvider(connectAppName)
  const chainChangeListener: any = null
  const disconnectListener: any = null
  if (accountsChangeListener != null) {
    connectProvider.removeListener('accountsChanged', accountsChangeListener)
  }
  if (chainChangeListener != null) {
    connectProvider.removeListener('chainChanged', chainChangeListener)
  }

  // wallet connect 取消连接
  // 因为 wallet connect 会一直连接着。除非自行取消，无法切换到其他 wallet connect 的应用和钱包
  // 其他像 metamask 不需要取消
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
  getMinedDepositChainTxHashAsync,
  getExplorerUrl,
  handleChainEvents,
  disconnect
}

export default ethereumLib
