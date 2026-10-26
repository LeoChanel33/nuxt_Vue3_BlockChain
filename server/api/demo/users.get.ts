import { defineEventHandler, getQuery } from 'h3'
import type { BlockchainUser } from '../../../shared/types/blockchain'
import { requireDemoAddress } from '../../utils/demoValidation'

export default defineEventHandler((event): BlockchainUser => {
  const address = requireDemoAddress(getQuery(event).address, 'address')
  // 僅為中介站串接範例，沒有查詢真實鏈上餘額。
  return { address, name: '示範用戶', balance: '100.5' }
})
