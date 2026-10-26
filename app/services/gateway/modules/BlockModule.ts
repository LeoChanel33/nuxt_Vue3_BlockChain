import type { BlockchainBlock, BlockQuery } from '../../../../shared/types/blockchain'
import type { ApiModule, ApiTransport } from '../ApiGateway'

export class BlockModule implements ApiModule<BlockQuery, BlockchainBlock> {
  readonly method = 'GET' as const

  execute(params: BlockQuery, transport: ApiTransport): Promise<BlockchainBlock> {
    return transport<BlockchainBlock>({
      path: '/blocks',
      method: this.method,
      query: { blockNumber: params.blockNumber },
    })
  }
}
