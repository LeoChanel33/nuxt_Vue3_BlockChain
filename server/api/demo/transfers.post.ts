import { randomBytes } from 'node:crypto'
import { createError, defineEventHandler, readBody } from 'h3'
import type { TransferResult } from '../../../shared/types/blockchain'
import { requireDemoAddress } from '../../utils/demoValidation'

export default defineEventHandler(async (event): Promise<TransferResult> => {
  const body: unknown = await readBody(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a transfer object' })
  }
  const payload = body as Record<string, unknown>
  requireDemoAddress(payload.sender, 'sender')
  requireDemoAddress(payload.receiver, 'receiver')
  if (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'amount must be a positive finite number' })
  }
  for (const field of ['memo', 'network']) {
    if (payload[field] !== undefined && typeof payload[field] !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `${field} must be a string` })
    }
  }
  // 只產生模擬結果，不簽署、不廣播交易，也不修改任何帳戶餘額。
  return { success: true, transactionHash: `0x${randomBytes(32).toString('hex')}`, timestamp: Date.now() }
})
