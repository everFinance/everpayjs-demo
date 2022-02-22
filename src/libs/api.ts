import axios from 'axios'
import { random } from 'lodash-es'

interface GetPstTokenBalanceParams {
  contractId: string
  address: string
}

export const getPstTokenBalance = async (params: GetPstTokenBalanceParams): Promise<string> => {
  const { contractId, address } = params
  // 随机使用 API KEY 避免次数限制
  // 免费版本是每天 2000个请求，然后速率限制是 3call/s
  // https://trello.com/c/tS5yluYx
  const XAPIKEYs = [
    '0fc9994f96adcd5f4f96bea375ee30931fe09c2dcac509a270a2724f359ff083',
    '1c75136bf248d14aa875b9850f3a32a2ddc1dae4816e0c2fd33d04a017c18a5c',
    '3aac25c9c450fbe67b957cf63b3029081dca2d99ed9d04b30dcc3e96ced89cd3',
    '04ae7c896078a0816ccdb5d0d9ccc269d401701bc039fd40709f5e0a4a858e41'
  ]
  const XAPIKEY = XAPIKEYs[random(0, XAPIKEYs.length - 1)]

  const data = JSON.stringify({
    query: `query address($hash: String!, $chain: String!, $network: String!) {
      address(hash: $hash, chain: $chain, network: $network) {
        hash
        balance
        discoveredTimestamp
        txCount
        internalsCount
        checksumAddress
        oldChecksumAddress
        tokens {
          hash
          name
          symbol
          decimals
          score
          balance
        }
      }
    }`,
    variables: { hash: address, chain: 'arweave', network: 'mainnet' }
  })

  const config = {
    method: 'POST',
    url: 'https://api.viewblock.io/graphql',
    headers: {
      'X-APIKEY': XAPIKEY,
      'Content-Type': 'application/json'
    },
    data: data
  }

  const response = await axios(config as any)
  const result = response.data
  const found = result.data.address.tokens.find((t: any) => t.hash === contractId)
  if (found != null) {
    return found.balance
  }
  return '0'
}
