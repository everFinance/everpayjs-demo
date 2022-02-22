import Everpay, { ChainType } from 'everpay'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  ConnectAppName, GetExplorerUrlParams,
  ChainLibAdaptor, ChainLibInterface
} from './interface'

const getChainLib = (chainType: ChainType): ChainLibInterface => {
  return chainType === ChainType.ethereum ? ethereumLib : arweaveLib
}

const chainLibAdaptor: ChainLibAdaptor = {
  genEverpay (chainType: ChainType, params: GenEverpayParams): Everpay {
    return getChainLib(chainType).genEverpay(params)
  },
  async getDepositGasFeeAsync (chainType: ChainType): Promise<string> {
    return await getChainLib(chainType).getDepositGasFeeAsync()
  },
  async getAccountAsync (chainType: ChainType, params: GetAccountAsyncParams): Promise<string> {
    return await getChainLib(chainType).getAccountAsync(params)
  },
  async getTokenBalanceAsync (chainType: ChainType, params: GetTokenBalanceAsyncParams): Promise<string> {
    return await getChainLib(chainType).getTokenBalanceAsync(params)
  },
  handleChainEvents (chainType: ChainType, params: HandleChainEventsParams): void {
    return getChainLib(chainType).handleChainEvents(params)
  },
  getExplorerUrl (chainType: ChainType, params: GetExplorerUrlParams): string {
    return getChainLib(chainType).getExplorerUrl(params)
  },
  disconnect (chainType: ChainType, connectAppName: ConnectAppName): void {
    return getChainLib(chainType).disconnect(connectAppName)
  }
}

export default chainLibAdaptor
