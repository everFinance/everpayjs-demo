import { ChainType } from 'everpay'
import { ConnectAppName } from '../chainLibAdaptor/interface'

export interface InitAndHandleEventsParams {
  accChainType: ChainType
  connectAppName: ConnectAppName
}

export interface InitAccountAndEverpayAsyncParams extends InitAndHandleEventsParams {
  userOperateCausedNoAccounts: boolean
}
