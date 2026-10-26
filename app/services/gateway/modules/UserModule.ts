import type { BlockchainUser, UserQuery } from '../../../../shared/types/blockchain'
import type { ApiModule, ApiTransport } from '../ApiGateway'

export class UserModule implements ApiModule<UserQuery, BlockchainUser> {
  readonly method = 'GET' as const

  execute(params: UserQuery, transport: ApiTransport): Promise<BlockchainUser> {
    return transport<BlockchainUser>({
      path: '/users',
      method: this.method,
      query: { address: params.address },
    })
  }
}
