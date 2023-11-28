import { ConnectAppName } from '@/store/state'

export const INFURA_ID = 'b6ac62371f004aa2beeb1790f7dcf09f'

export const isProd = false

export const InstallEthereumWalletLink = {
  [ConnectAppName.Metamask]: 'https://metamask.io/',
  [ConnectAppName.BitKeep]: 'https://web3.bitget.com/',
  [ConnectAppName.Safeheron]: 'https://www.safeheron.com/'
}
export const InstallArweaveWalletLink = {
  [ConnectAppName.BitKeep]: 'https://web3.bitget.com/',
  [ConnectAppName.Finnie]: 'https://koii.network/getFinnie',
  [ConnectAppName.ArConnect]: 'https://arconnect.io/',
  [ConnectAppName.MathWallet]: 'https://mathwallet.org/'
}