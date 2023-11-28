import { ChainType } from 'everpay'

export enum ConnectAppName {
  'Metamask' = 'Metamask',
  'imToken' = 'imToken',
  'WalletConnect' = 'Wallet Connect',
  'CoinbaseWallet' = 'Coinbase Wallet',
  'BitKeep' = 'Bitget',
  'iToken' = 'iToken',
  'ArConnect' = 'ArConnect',
  'Finnie' = 'Finnie',
  'MathWallet' = 'Math Wallet',
  'Safeheron' = 'Safeheron'
}

export interface State {
  account: string
  connectAppName: ConnectAppName
  accChainType: ChainType
  registered: boolean
}
export interface Auction {
  isStart: Boolean
  isEnd: Boolean
}

export interface DepositPendingItem {
  tokenTag: string
  chainType: ChainType
  amount: string
  chainTxHash: string
  time: number
  symbol: string
  // AR 没有 nonce
  nonce?: number
  step: number
  everHash?: string
}

export const defaultState: State = {
  account: '',

  accChainType: ChainType.ethereum,

  connectAppName: ConnectAppName.Metamask,
  
  registered: false,

}
