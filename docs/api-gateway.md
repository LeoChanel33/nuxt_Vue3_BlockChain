# 模組中介站範例

啟動 `npm run dev` 後開啟 `/gatewayDemo`。預設串接本專案 `/api/demo` 的模擬 API，所有回傳都是示範資料；轉帳只產生隨機 hash，不會真的轉帳或改變餘額。

## 建立與呼叫流程

```text
Nuxt plugin 初始化
  → createBlockchainGateway(transport)
  → new ApiGateway(transport)
  → new TransferModule / UserModule / BlockModule 並 register
  → provide $apiGateway
  → 頁面透過 useApiGateway().call({ module, params, method? }) 呼叫
  → 找到已註冊實例，檢查 method，再交給模組組成 HTTP 請求
```

註冊發生在 plugin 初始化，不會在每次呼叫時重新 new。瀏覽器內同一個 Nuxt app 共用中介站；SSR 每個請求各自建立。伺服器渲染與瀏覽器 hydration 是不同的 app 實例，不是跨前後端共用單例。plugin 建立時不發送任何交易。

| module | method | 路徑（相對 apiBase） | params 傳送位置 |
| --- | --- | --- | --- |
| transfer | POST | /transfers | body |
| user | GET | /users | query |
| block | GET | /blocks | query |

## 在 Vue 頁面或 composable 使用

```ts
// 在 setup 中取得，後續的事件函式可以重用。
const gateway = useApiGateway()

const user = await gateway.call({
  module: 'user',
  params: { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
}) // 型別自動推導為 BlockchainUser

const block = await gateway.call({
  module: 'block',
  method: 'GET',
  params: { blockNumber: 'latest' }, // 或非負整數
})

// 轉帳放在使用者點擊事件內，勿在 SSR setup/useAsyncData 自動執行。
async function sendTransfer() {
  return gateway.call({
    module: 'transfer',
    method: 'POST',
    params: {
      sender: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      receiver: '0x123f681646d4a755815f9cb19e1acc8565a0c2ac',
      amount: 1,
      memo: '範例',
    },
  })
}
```

`method` 可省略，採用模組定義；若傳入不符的方法則在發送前拋錯。未知模組、重複註冊也會拋錯。HTTP 錯誤直接往上傳，呼叫端使用 `try/catch`；傳輸層停用自動重試。

## 新增模組

1. 在 `app/services/gateway/modules/` 新增 class，實作 `ApiModule<參數型別, 回傳型別>`，定義 `method` 與 `execute(params, transport)`。
2. 在 `BlockchainSchema` 新增對應名稱、`params` 和 `result` 型別。
3. 在 `createBlockchainGateway` 加上 `.register('名稱', new YourModule())`，之後即可用相同名稱呼叫。中介站本身不用修改。

也可以建立自己的 Schema，使用 `new ApiGateway<YourSchema>(transport)` 註冊其他業務模組。模組可在 `execute` 內加入參數轉換或業務邏輯。

## 替換實際後端

設定環境變數 `NUXT_PUBLIC_API_BASE=https://your-backend.example/api`，並依後端契約調整三個模組的路徑與型別；跨來源連線需由後端設定 CORS。示範沒有加入登入驗證、簽章或真實鏈上服務。正式轉帳應由後端驗證授權、處理簽章與冪等性；鏈上金額可依後端契約改為最小單位的字串。

此中介站是 Nuxt app 的服務分派器，不是可接受任意外部網址的 HTTP proxy。

## 驗證

```sh
npm run test:gateway
npm run build
npm run test:gateway:integration
```

測試使用 Node 內建測試工具與 Nuxt 已包含的 jiti TypeScript 載入器。
