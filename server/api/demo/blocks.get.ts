import { createError, defineEventHandler, getQuery } from 'h3'
import type { BlockchainBlock } from '../../../shared/types/blockchain'

export default defineEventHandler((event): BlockchainBlock => {
  const value = getQuery(event).blockNumber
  if (typeof value !== 'string' || (value !== 'latest' && !/^\d+$/.test(value))) {
    throw createError({ statusCode: 400, statusMessage: 'blockNumber must be latest or a non-negative safe integer' })
  }
  const number = value === 'latest' ? 123456 : Number(value)
  if (!Number.isSafeInteger(number)) {
    throw createError({ statusCode: 400, statusMessage: 'blockNumber exceeds the safe integer range' })
  }
  return {
    number,
    hash: `0x${number.toString(16).padStart(64, '0')}`,
    transactionCount: 3,
    timestamp: 1700000000000,
  }
})
