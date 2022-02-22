import { Store } from 'vuex'
import { State } from '@/store/state'
import { ChainType } from 'everpay'

export interface InitAndHandleEventsParams {
  accChainType: ChainType
  store: Store<State>
}

export interface InitAccountAndEverpayAsyncParams extends InitAndHandleEventsParams {
  userOperateCausedNoAccounts: boolean
}
