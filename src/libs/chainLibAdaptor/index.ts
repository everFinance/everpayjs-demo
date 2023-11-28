import Everpay, { ChainType } from 'everpay'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import {
  GenEverpayParams, GetAccountAsyncParams, HandleChainEventsParams, GetTokenBalanceAsyncParams,
  GetMinedDepositChainTxHashAsyncParams, GetMinedDepositChainTxHashResult, GetExplorerUrlParams,
  ChainLibAdaptor, ChainLibInterface
} from './interface'
import { ConnectAppName } from '@/store/state'

const getChainLib = (chainType: ChainType): ChainLibInterface => {
  return chainType === ChainType.arweave ? arweaveLib : ethereumLib
}

const chainLibAdaptor: ChainLibAdaptor = {
  async genEverpay (chainType: ChainType, params: GenEverpayParams): Promise<Everpay> {
    return getChainLib(chainType).genEverpay(chainType, params)
  },
  async getDepositGasFeeAsync (chainType: ChainType, address: string): Promise<string> {
    return await getChainLib(chainType).getDepositGasFeeAsync(chainType, address)
  },
  async getAccountAsync (chainType: ChainType, params: GetAccountAsyncParams): Promise<string> {
    return await getChainLib(chainType).getAccountAsync(chainType, params)
  },
  async getTokenBalanceAsync (chainType: ChainType, params: GetTokenBalanceAsyncParams): Promise<string> {
    return await getChainLib(chainType).getTokenBalanceAsync(chainType, params)
  },
  async getMinedDepositChainTxHashAsync (chainType: ChainType, params: GetMinedDepositChainTxHashAsyncParams): Promise<GetMinedDepositChainTxHashResult> {
    return await getChainLib(chainType).getMinedDepositChainTxHashAsync(chainType, params)
  },
  handleChainEvents (chainType: ChainType, params: HandleChainEventsParams): void {
    return getChainLib(chainType).handleChainEvents(chainType, params)
  },
  getExplorerUrl (chainType: ChainType, params: GetExplorerUrlParams): string {
    return getChainLib(chainType).getExplorerUrl(chainType, params)
  },
  disconnect (chainType: ChainType, connectAppName: ConnectAppName): void {
    return getChainLib(chainType).disconnect(chainType, connectAppName)
  }
}

export default chainLibAdaptor
