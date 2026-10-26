import { createError } from 'h3'

export function requireDemoAddress(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}: expected an Ethereum address` })
  }
  return value
}
