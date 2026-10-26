<script setup lang="ts">
import { ref } from 'vue'
import { useApiGateway } from '../composables/useApiGateway'

const gateway = useApiGateway()
const sender = ref('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
const receiver = ref('0x123f681646d4a755815f9cb19e1acc8565a0c2ac')
const amount = ref(1)
const blockNumber = ref('latest')
const pending = ref(false)
const result = ref('點選操作查看回傳結果')

async function run(module: 'transfer' | 'user' | 'block') {
  if (pending.value) return
  pending.value = true
  try {
    let data: unknown
    switch (module) {
      case 'transfer':
        data = await gateway.call({
          module: 'transfer', method: 'POST',
          params: { sender: sender.value, receiver: receiver.value, amount: amount.value },
        })
        break
      case 'user':
        data = await gateway.call({ module: 'user', params: { address: sender.value } })
        break
      case 'block': {
        const value = blockNumber.value.trim()
        if (value !== 'latest' && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))) {
          throw new Error('請輸入 latest 或非負安全整數')
        }
        data = await gateway.call({
          module: 'block', method: 'GET',
          params: { blockNumber: value === 'latest' ? 'latest' : Number(value) },
        })
        break
      }
    }
    result.value = JSON.stringify(data, null, 2)
  } catch (error) {
    result.value = error instanceof Error ? error.message : String(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="gateway-demo">
    <h1>區塊鏈模組中介站範例</h1>
    <p>預設使用模擬 API，轉帳不會發送到區塊鏈，查詢結果也是示範資料。</p>
    <label>用戶／發送者地址 <input v-model="sender" /></label>
    <label>接收者地址 <input v-model="receiver" /></label>
    <label>轉帳金額 <input v-model.number="amount" type="number" min="0" step="any" /></label>
    <label>區塊編號 <input v-model="blockNumber" placeholder="latest 或非負整數" /></label>
    <div class="actions">
      <button :disabled="pending" @click="run('transfer')">模擬轉帳（POST）</button>
      <button :disabled="pending" @click="run('user')">查詢用戶（GET）</button>
      <button :disabled="pending" @click="run('block')">查閱區塊（GET）</button>
    </div>
    <p v-if="pending" role="status">處理中…</p>
    <pre aria-live="polite">{{ result }}</pre>
  </main>
</template>

<style scoped>
.gateway-demo { max-width: 820px; margin: 40px auto; padding: 24px; font-family: sans-serif; }
label { display: block; margin: 16px 0; }
input { display: block; box-sizing: border-box; width: 100%; padding: 10px; margin-top: 6px; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }
button { padding: 10px 16px; cursor: pointer; }
pre { padding: 16px; background: #f3f4f6; color: #111827; overflow: auto; }
</style>
