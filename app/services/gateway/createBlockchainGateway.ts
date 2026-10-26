import type {
  BlockchainBlock, BlockchainUser, BlockQuery, TransferPayload, TransferResult, UserQuery,
} from '../../../shared/types/blockchain'
import { ApiGateway, type ApiTransport } from './ApiGateway'
import { TransferModule } from './modules/TransferModule'
import { UserModule } from './modules/UserModule'
import { BlockModule } from './modules/BlockModule'

export interface BlockchainSchema {
  transfer: { params: TransferPayload; result: TransferResult }
  user: { params: UserQuery; result: BlockchainUser }
  block: { params: BlockQuery; result: BlockchainBlock }
}

export function createBlockchainGateway(transport: ApiTransport) {
  // 每次建立中介站時只建立、註冊一次模組，call 時重用模組物件。
  return new ApiGateway<BlockchainSchema>(transport)
    .register('transfer', new TransferModule())
    .register('user', new UserModule())
    .register('block', new BlockModule())
}
