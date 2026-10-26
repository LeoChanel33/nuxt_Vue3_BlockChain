export interface TransferPayload {
  sender: string
  receiver: string
  amount: number
  memo?: string
  network?: string
}

export interface TransferResult {
  success: boolean
  transactionHash?: string
  error?: string
  timestamp: number
}

export interface UserQuery {
  address: string
}

export interface BlockchainUser {
  address: string
  name: string
  balance: string
}

export interface BlockQuery {
  blockNumber: number | 'latest'
}

export interface BlockchainBlock {
  number: number
  hash: string
  transactionCount: number
  timestamp: number
}
