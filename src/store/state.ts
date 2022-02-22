import { ChainType, EverpayInfo, SwapInfo } from 'everpay'

export enum ConnectAppName {
  'Metamask' = 'Metamask',
  'imToken' = 'imToken',
  'WalletConnect' = 'Wallet Connect',
  'CoinbaseWallet' = 'Coinbase Wallet',
  'BitKeep' = 'BitKeep',
  'ArConnect' = 'ArConnect',
  'Finnie' = 'Finnie'
}

export interface StateBalanceItem {
  chainType: string
  symbol: string
  balance: string
}

export interface DepositPendingItem {
  tokenTag: string
  chainType: ChainType
  amount: string
  chainTxHash: string
  time: number
  // AR 没有 nonce
  nonce?: number
  step: number
  everHash?: string
}

export interface DepositPending {
  [account: string]: DepositPendingItem[]
}

export interface WithdrawPendingItem {
  tokenTag: string
  chainType: ChainType
  amount: string
  everHash: string
  time: number
  step: number
  quickWithdrawErr?: string
  quickMode?: boolean
}

export interface WithdrawPending {
  [account: string]: WithdrawPendingItem[]
}

export interface Contact {
  name: string
  account: string
}

export interface EditContactParams {
  index: number
  contact: Contact
}

export interface ContactStack {
  [account: string]: Contact[]
}

export interface CurrencyPriceItem {
  symbol: string
  price: string
}

export interface State {
  account: string
  currency: string
  connectModalVisible: boolean
  connectAppName: ConnectAppName
  quickWithdrawMode: boolean
  accChainType: ChainType
  everpayInfo: EverpayInfo
  swapInfo: SwapInfo
  everpayBalances: StateBalanceItem[]
  chainBalances: StateBalanceItem[]
  depositPending: DepositPending
  withdrawPending: WithdrawPending
  currencyPrices: CurrencyPriceItem[]
  nftauction: Auction
  // 已经弃用
  contacts?: string[]
  contactStack: ContactStack
}
export interface Auction {
  isStart: Boolean
  isEnd: Boolean
}

export const defaultState: State = {
  account: '',
  currency: 'USD',
  accChainType: ChainType.ethereum,
  connectModalVisible: false,
  connectAppName: ConnectAppName.Metamask,
  quickWithdrawMode: false,
  everpayInfo: {
    ethChainID: '',
    ethLocker: '',
    arLocker: '',
    feeRecipient: '',
    owner: '',
    tokenList: [],
    everRootHash: '',
    rootHash: ''
  },
  everpayBalances: [],
  chainBalances: [],
  depositPending: {},
  withdrawPending: {},
  swapInfo: {
    fee: '',
    address: '',
    tokenList: []
  },
  currencyPrices: [],
  contactStack: {},
  nftauction: {
    isStart: false,
    isEnd: false
  }
}
