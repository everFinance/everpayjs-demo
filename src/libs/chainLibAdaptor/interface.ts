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
  chainType: ChainType
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
  symbol?: string
}

export interface ChainLibInterface {
  genEverpay: (chainType: ChainType, params: GenEverpayParams) => Promise<Everpay>
  getDepositGasFeeAsync: (chainType: ChainType, address: string) => Promise<string>
  getAccountAsync: (chainType: ChainType, params: GetAccountAsyncParams) => Promise<string>
  getTokenBalanceAsync: (chainType: ChainType, params: GetTokenBalanceAsyncParams) => Promise<string>
  getMinedDepositChainTxHashAsync: (chainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams) => Promise<GetMinedDepositChainTxHashResult>
  getExplorerUrl: (chainType: ChainType, params: GetExplorerUrlParams) => string
  handleChainEvents: (chainType: ChainType, params: HandleChainEventsParams) => void
  disconnect: (chainType: ChainType, connectAppName: ConnectAppName) => void
}

// 在 chainLib 所有 API 基础上，增加 chainType 参数
export interface ChainLibAdaptor {
  genEverpay: (accChainType: ChainType, params: GenEverpayParams) => Promise<Everpay>
  getDepositGasFeeAsync: (accChainType: ChainType, address: string) => Promise<string>
  getAccountAsync: (accChainType: ChainType, params: GetAccountAsyncParams) => Promise<string>
  getTokenBalanceAsync: (accChainType: ChainType, params: GetTokenBalanceAsyncParams) => Promise<string>
  getMinedDepositChainTxHashAsync: (accChainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams) => Promise<GetMinedDepositChainTxHashResult>
  getExplorerUrl: (chainType: ChainType, params: GetExplorerUrlParams) => string
  handleChainEvents: (accChainType: ChainType, params: HandleChainEventsParams) => void
  disconnect: (accChainType: ChainType, connectAppName: ConnectAppName) => void
}
