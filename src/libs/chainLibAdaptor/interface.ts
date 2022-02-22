import Everpay, { ChainType, Token } from 'everpay'

export enum ConnectAppName {
  'Metamask' = 'Metamask',
  'imToken' = 'imToken',
  'WalletConnect' = 'Wallet Connect',
  'CoinbaseWallet' = 'Coinbase Wallet',
  'BitKeep' = 'BitKeep',
  'ArConnect' = 'ArConnect',
  'Finnie' = 'Finnie'
}

export type HandleChainEventsCallback = (userOperateCausedNoAccounts: boolean) => unknown
export interface GenEverpayParams {
  connectAppName: ConnectAppName
  account: string
}

export interface GetAccountAsyncParams {
  connectAppName: ConnectAppName
  userOperateCausedNoAccounts: boolean
}

export interface HandleChainEventsParams {
  connectAppName: ConnectAppName
  handleChainEventsCallback: HandleChainEventsCallback
}

export interface GetTokenBalanceAsyncParams {
  connectAppName: ConnectAppName
  account: string
  token: Token
}

export interface GetMinedDepositChainTxHashResult {
  chainTxHash: string
  isReplaced: boolean
}

export interface GetExplorerUrlParams {
  type: 'address' | 'tx'
  value: string
}

export interface ChainLibInterface {
  genEverpay: (params: GenEverpayParams) => Everpay
  getDepositGasFeeAsync: () => Promise<string>
  getAccountAsync: (params: GetAccountAsyncParams) => Promise<string>
  getTokenBalanceAsync: (params: GetTokenBalanceAsyncParams) => Promise<string>
  getExplorerUrl: (params: GetExplorerUrlParams) => string
  handleChainEvents: (params: HandleChainEventsParams) => void
  disconnect: (connectAppName: ConnectAppName) => void
}

// 在 chainLib 所有 API 基础上，增加 chainType 参数
export interface ChainLibAdaptor {
  genEverpay: (accChainType: ChainType, params: GenEverpayParams) => Everpay
  getDepositGasFeeAsync: (accChainType: ChainType) => Promise<string>
  getAccountAsync: (accChainType: ChainType, params: GetAccountAsyncParams) => Promise<string>
  getTokenBalanceAsync: (accChainType: ChainType, params: GetTokenBalanceAsyncParams) => Promise<string>
  getExplorerUrl: (chainType: ChainType, params: GetExplorerUrlParams) => string
  handleChainEvents: (accChainType: ChainType, params: HandleChainEventsParams) => void
  disconnect: (accChainType: ChainType, connectAppName: ConnectAppName) => void
}
