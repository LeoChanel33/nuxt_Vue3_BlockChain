import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createBlockchainGateway } from '../services/gateway/createBlockchainGateway'
import type { ApiRequest } from '../services/gateway/ApiGateway'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiGateway = createBlockchainGateway(<T>(request: ApiRequest) => {
    return $fetch<T>(request.path, {
      baseURL: config.public.apiBase,
      method: request.method,
      query: request.query,
      body: request.body,
      // 寫入請求不自動重試，避免重複送出轉帳。
      retry: 0,
    })
  })

  return { provide: { apiGateway } }
})
