import { ChainType } from 'everpay'

export enum ConnectAppName {
  'Metamask' = 'Metamask',
  'imToken' = 'imToken',
  'WalletConnect' = 'Wallet Connect',
  'CoinbaseWallet' = 'Coinbase Wallet',
  'BitKeep' = 'BitKeep',
  'ArConnect' = 'ArConnect',
  'Finnie' = 'Finnie'
}

export interface State {
  account: string
  connectAppName: ConnectAppName
  accChainType: ChainType
}
export interface Auction {
  isStart: Boolean
  isEnd: Boolean
}

export const defaultState: State = {
  account: '',

  accChainType: ChainType.ethereum,

  connectAppName: ConnectAppName.Metamask

}
