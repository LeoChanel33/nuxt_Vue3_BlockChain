import type { TransferPayload, TransferResult } from '../../../../shared/types/blockchain'
import type { ApiModule, ApiTransport } from '../ApiGateway'

export class TransferModule implements ApiModule<TransferPayload, TransferResult> {
  readonly method = 'POST' as const

  execute(params: TransferPayload, transport: ApiTransport): Promise<TransferResult> {
    return transport<TransferResult>({
      path: '/transfers',
      method: this.method,
      body: { ...params },
    })
  }
}
