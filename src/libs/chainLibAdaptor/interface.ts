import { Store } from 'vuex'
import { ConnectAppName, DepositPendingItem, State } from '@/store/state'
import Everpay, { ChainType, Token } from 'everpay'

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
  store: Store<State>
  handleChainEventsCallback: HandleChainEventsCallback
}

export interface GetTokenBalanceAsyncParams {
  connectAppName: ConnectAppName
  account: string
  token: Token
}

export interface GetMinedDepositChainTxHashAsyncParams {
  account: string
  depositPendingItem: DepositPendingItem
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
  getMinedDepositChainTxHashAsync: (params: GetMinedDepositChainTxHashAsyncParams) => Promise<GetMinedDepositChainTxHashResult>
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
  getMinedDepositChainTxHashAsync: (accChainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams) => Promise<GetMinedDepositChainTxHashResult>
  getExplorerUrl: (chainType: ChainType, params: GetExplorerUrlParams) => string
  handleChainEvents: (accChainType: ChainType, params: HandleChainEventsParams) => void
  disconnect: (accChainType: ChainType, connectAppName: ConnectAppName) => void
}
