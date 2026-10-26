# 檔案命名規則

| 檔案類型 | 命名方式 | 範例 |
| --- | --- | --- |
| Vue 共用元件（`app/components`） | PascalCase | `AccountEditModal.vue`、`MyCard.vue` |
| 類別與模組實作 | PascalCase，對應類別名稱 | `ApiGateway.ts`、`TransferModule.ts` |
| Nuxt 頁面（`app/pages`） | camelCase | `gatewayDemo.vue`、`initLoadingPage.vue` |
| CSS | camelCase，對應功能名稱 | `initLoadingPage.css`、`blockAccountMain.css` |
| 函式、store、plugin、工具與型別檔 | camelCase | `useApiGateway.ts`、`apiGateway.ts`、`demoValidation.ts` |
| 測試 | camelCase，加上 `.test` | `apiGateway.test.mjs` |
| 文件 | kebab-case | `api-gateway.md`、`file-naming.md` |

保留 Nuxt 與工具慣用檔名，例如 `nuxt.config.ts`、`tsconfig.json`、`package.json`、`README.md`，以及 Nitro 的 `users.get.ts`、`transfers.post.ts` HTTP 方法後綴。

所有 import、CSS 引用與文件路徑的大小寫必須完全符合實際檔名。元件標籤使用 PascalCase，例如 `<AccountEditModal />`。

頁面檔名會決定路由；本次統一後的載入頁路徑為 `/initLoadingPage` 與 `/syncErrorPage`。
