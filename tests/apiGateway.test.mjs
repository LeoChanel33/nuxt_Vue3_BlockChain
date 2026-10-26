import assert from 'node:assert/strict'
import test from 'node:test'
// Nuxt 已包含 jiti，使用相同載入器讀取 TypeScript 模組。
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { ApiGateway } = await jiti.import('../app/services/gateway/ApiGateway.ts')
const { createBlockchainGateway } = await jiti.import('../app/services/gateway/createBlockchainGateway.ts')

const sender = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
const receiver = '0x123f681646d4a755815f9cb19e1acc8565a0c2ac'

test('三個模組依名稱分派，GET 使用 query、POST 使用 body，回傳傳輸層結果', async () => {
  const requests = []
  const response = { success: true }
  const gateway = createBlockchainGateway(async (request) => {
    requests.push(request)
    return response
  })

  assert.equal(await gateway.call({ module: 'user', params: { address: sender } }), response)
  await gateway.call({ module: 'block', method: 'GET', params: { blockNumber: 'latest' } })
  await gateway.call({ module: 'transfer', method: 'POST', params: { sender, receiver, amount: 1 } })
  assert.deepEqual(requests, [
    { path: '/users', method: 'GET', query: { address: sender } },
    { path: '/blocks', method: 'GET', query: { blockNumber: 'latest' } },
    { path: '/transfers', method: 'POST', body: { sender, receiver, amount: 1 } },
  ])
})

test('錯誤的 HTTP method 與未知模組不會發送請求', async () => {
  let calls = 0
  const gateway = createBlockchainGateway(async () => { calls++; return {} })
  await assert.rejects(gateway.call({ module: 'transfer', method: 'GET', params: {} }), /僅接受 POST/)
  await assert.rejects(gateway.call({ module: 'user', method: 'POST', params: {} }), /僅接受 GET/)
  await assert.rejects(gateway.call({ module: 'unknown', params: {} }), /尚未註冊模組/)
  assert.equal(calls, 0)
})

test('拒絕重複註冊，並重用已註冊的模組實例', async () => {
  const gateway = new ApiGateway(async () => ({}))
  const module = {
    method: 'GET',
    calls: 0,
    async execute() { return ++this.calls },
  }
  gateway.register('counter', module)
  assert.throws(() => gateway.register('counter', module), /模組已註冊/)
  assert.equal(await gateway.call({ module: 'counter', params: {} }), 1)
  assert.equal(await gateway.call({ module: 'counter', params: {} }), 2)
})

test('不同中介站的註冊表獨立，避免跨 SSR 請求共用實例', async () => {
  const first = new ApiGateway(async () => ({}))
  const second = new ApiGateway(async () => ({}))
  first.register('custom', { method: 'GET', async execute() { return 'first' } })
  assert.equal(await first.call({ module: 'custom', params: {} }), 'first')
  await assert.rejects(second.call({ module: 'custom', params: {} }), /尚未註冊模組/)
})

test('傳輸失敗往上拋出，轉帳不被中介站重試', async () => {
  const failure = new Error('upstream unavailable')
  let calls = 0
  const gateway = createBlockchainGateway(async () => { calls++; throw failure })
  await assert.rejects(
    gateway.call({ module: 'transfer', params: { sender, receiver, amount: 1 } }),
    (error) => error === failure,
  )
  assert.equal(calls, 1)
})
