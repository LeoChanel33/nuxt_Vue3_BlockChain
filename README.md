# 區塊鏈前端專案

## 專案架構規劃

以下為整體系統的規劃架構；目前儲存庫的 Nuxt 前端程式位於 `app/`，示範 API 位於 `server/`。

```text
├── frontend-nuxt/           # Nuxt 前端專案
│   ├── components/          # Web3 錢包連接與交易組件
│   ├── composables/         # useWeb3, useContract 等邏輯
│   └── server/              # Nitro Server API (BFF 層)
├── backend-services/        # Java 微服務
│   ├── api-gateway/         # 網關服務
│   ├── transaction-service/ # 負責 Web3j 合約調用與監聽
│   └── user-service/        # 用戶資料與資產管理
├── k8s/                     # Kubernetes 配置
│   ├── deployments/         # 各服務部署文件
│   └── ingress.yaml         # 入口配置
└── contracts/               # Solidity 智能合約 (Hardhat/Foundry)
```

## 🔄 交易流向說明

1. **讀取數據**: Nuxt3 透過 `useFetch` 調用 Java 後端 API，或直接透過 `viem` 讀取鏈上數據。
2. **發起交易**: 
   - 用戶透過前端 MetaMask 簽名。
   - 或是前端調用 Java API，由後端使用 Web3j 進行「託管式簽名」或「多重簽名」邏輯處理。
3. **異步確認**: Java 後端 Web3j 監聽器捕捉到 `Transfer` 或自定義 `Event`，透過 WebSocket 通知前端並更新 DB。

## 📅 2026.05.15 更新日誌：前端狀態 UI 模板整合

本次更新完成了三個前端狀態展示 UI 的 Vue 3 單文件組件 (SFC) 轉換與樣式隔離。

1. ⏳ **交易傳送等待 UI (`waitPage.vue`)**
   - **動態光條**：實作 10 段式進度光條，支援處理中 (藍色閃爍) 與已完成 (綠色) 狀態自動切換。
   - **狀態驅動**：全面使用 Vue `ref` 與 `computed` 替換原生 DOM 操作，實現資料驅動渲染。
2. 🌐 **區塊鏈初始化載入 UI (`initLoadingPage.vue`)**
   - **多軌道動畫**：使用純 CSS 實作主節點與內、中、外圈衛星節點的同步旋轉動畫。
   - **樣式隔離**：全面加上 `initLoading-` 前綴與 `<style scoped>` 避免與系統其他組件發生樣式衝突。
3. ❌ **區塊鏈同步失敗 UI (`syncErrorPage.vue`)**
   - **科技感故障視覺**：實作斷開的能量核心動畫 (`slow-glitch-spin`) 與自定義錯誤代碼顯示卡片。
   - **操作整合**：內建重啟連線的模擬按鈕 (`@click`) 與底部的系統版本/開發者資訊區塊。

## 📅 2026.05.20 更新日誌：Pinia 狀態管理與交易紀錄查詢系統整合

本次更新引進了全域狀態管理機制，並擴充了區塊鏈主控台的交易紀錄調閱功能與相關 UI 獨立組件。

1. 📦 **Pinia 狀態管理導入**
   - **全域狀態**：新增 Pinia 進行前端全域狀態管理，集中管理錢包連線狀態 (`isConnected`)、使用者地址 (`shortAddress`) 與帳戶餘額 (`balance`) 等共用資料。
   - **邏輯解耦**：將 Web3 錢包連線等共用邏輯抽離至 Store (如 `walletStore`)，提升 Vue 3 頁面組件的整潔度與可維護性。
2. 📋 **交易紀錄查詢 Modal (`queryTransfer.vue`)**
   - **獨立組件與無縫掛載**：將交易紀錄查詢功能抽離為獨立 SFC，並利用 Vue `<Teleport to="body">` 解決 CSS `transform` / `backdrop-filter` 導致的跑版與層級限制問題。
   - **多條件動態篩選**：實作基於交易 Hash 與自訂日期區間的複合過濾功能，並透過 `Props` 與 `Emits` 實現父子組件狀態的單向資料流同步。
3. 📄 **交易明細彈窗 Modal**
   - **多層次彈窗架構**：在查詢列表中新增第二層檢視用的明細 Modal，支援點擊單筆紀錄展開詳細資訊（Hash、時間、類型、狀態）。
   - **互動體驗優化**：利用計算屬性與狀態綁定處理資料選取，確保雙層 Modal 的 `z-index` 堆疊正確覆蓋，並維持科技感 UI 一致性。

## 📅 2026.05.27 更新日誌：全域狀態擴充與模組化彈窗 (Modal) 系統開發

本次更新全面導入了「模組化元件」的開發模式，將各項獨立功能封裝成高替換性的 Modal，並大幅擴充了 Pinia 的狀態管理結構。

1. 🧩 **模組化彈窗 (Modal) 架構設計**
   - **高替換性元件**：將「編輯帳號 (`AccountEditModal`)」、「特約群組設定 (`SpecialStoreModal`)」、「約定帳戶設定 (`agreedAccountModal`)」及「VIP 群組管理 (`manageVipGroupModal`)」全面抽離為獨立 Vue 元件，隨插即用。
   - **SSR 渲染優化**：統一導入 `<ClientOnly>` 與 `<Teleport to="body">` 結構，完美解決 Nuxt 3 伺服器端渲染 (SSR) 造成的 Hydration Mismatch 警告與版面層級干擾。
2. 📦 **Pinia Store 狀態與型別擴充**
   - **全域資料綁定**：在 `walletStore` 中新增 `userInfo`、`companies`、`vipGroups` 與 `agreedAccounts` 等核心業務狀態，並預載假資料以供前端開發測試。
   - **TypeScript 型別定義**：嚴格定義 `Company`、`VipGroup`、`VipAccount` 等 Interface 介面，消滅物件屬性遺漏造成的 TS 報錯，提升開發體驗。
3. 🔗 **約定帳戶與特約群組聯動系統**
   - **多層級下拉選單**：優化 `SpecialStoreModal` 的操作邏輯，使用者可直接從系統預設的「合作公司」與使用者自行定義的「約定帳戶」中，透過下拉選單綁定至自訂的 Group 中。
   - **資料流同步**：前端輸入的表單資料統一由單向資料流寫回 Store，並實時連動至 `blockMain.vue` 主控台的接收帳號選單中，完成完整的業務邏輯閉環。

## 📅 2026.05.28 更新日誌：前端服務層封裝與特約帳號防呆驗證升級

本次更新著重於核心交易邏輯的解耦、主控台表單的防呆機制，以及特約帳號資料結構的全面擴充。

1. 🏗️ **服務層架構 (Service Layer) 封裝**
   - **邏輯解耦與擴充性**：新增 `blockchainService.ts` 獨立處理區塊鏈交易邏輯，並使用 TypeScript 嚴格定義 `TransferPayload` 與 `TransferResult` 介面，大幅提升系統未來切換真實 Web3 Provider 的延展性與可測試性。
   - **Store 整合**：透過 Pinia Store (`wallet.ts`) 封裝非同步的 Action 來呼叫 Service 層，達到依賴反轉，UI 畫面端僅需負責處理使用者操作與結果通知。
2. 🛡️ **主控台表單防呆與即時驗證**
   - **狀態聯動鎖定**：未連線錢包時自動鎖定特約公司與接收帳號下拉選單，顯示「請先連線錢包」提示；錢包斷線時自動清除所有表單暫存狀態，防止資料殘留與越權操作。
   - **自動帶入與驗證**：發送帳號自動綁定目前登入的錢包地址並設為唯讀；接收帳號加入即時比對驗證功能，合法時以綠字顯示對象的 Account 名稱，非法時以紅字警告並於發送前予以阻擋。
3. 👤 **特約帳號 (VIP Accounts) 結構擴充與正名**
   - **業務邏輯正名**：將原先可能造成混淆的特約群組 (Groups) 結構正名為特約帳號 (`vipAccounts`)，並擴展包含 `account` (登入帳號)、`email`、`phone`、`physicalAddress` 等詳細聯絡資訊欄位。
   - **彈窗體驗優化**：淘汰瀏覽器原生 `prompt`，改用自訂的 Vue 彈窗進行特約帳號的建立；新增綁定約定帳戶時，自動帶出並顯示唯讀的「帳戶名稱」與「登入帳號」，並將下層的明細表格加寬以完整呈現使用者個資，提升檢核的準確性。
   - **操作整合**：內建重啟連線的模擬按鈕 (`@click`) 與底部的系統版本/開發者資訊區塊。

## 📅 2026.06.04 更新日誌：新增新使用者註冊系統與介面優化

本次更新加入了全新的使用者註冊流程與獨立彈窗介面，進一步完善了區塊鏈控制台的使用者體驗。

1. 👤 **新增新使用者註冊系統**
   - 於區塊鏈控制台首頁 (`blockMain.vue`) 新增「👤 註冊」按鈕，並優化使用者體驗，設定為**未連線錢包時才會顯示**。
   - 實作獨立的註冊彈窗元件 (`accountResModal.vue`)，支援完整的註冊資訊收集，包含：帳號、電子郵件、姓名、連絡電話、密碼及確認密碼欄位。
2. 🎨 **UI/UX 介面優化**
   - 採用**深色玻璃擬態 (Glassmorphism)** 與科技感霓虹色彩 (Neon) 重新設計註冊介面，使彈窗與主畫面的區塊鏈科技風格完美融合。
   - 加入按鈕 Hover、Active 的細微互動動畫及陰影發光效果。
   - 彈窗的 CSS 類別全面加上 `acc-res-` 前綴 (Prefix)，確保樣式獨立，避免與其他全域樣式產生衝突。
3. 🛡️ **表單防呆機制**
   - 內建表單防呆機制與兩次密碼輸入一致性驗證。

## 📅 2026.09.22 更新日誌：科技感視覺全面改版與審核 Modal 顯示修復

本次更新將原先偏向柔和漸層／玻璃擬態的「Gemini 風」視覺，全面改版為極簡終端機／駭客風格，並統一了各頁面原本分散不一致的配色系統，同時修復了帳號審核彈窗因 `Teleport` 導致內容看不見的問題。

1. 🎨 **CSS 視覺全面改版：極簡終端機風格**
   - **統一配色**：`blockMain.css`、`accountEditModal.css`、`accountResModal.css`、`specialStoreModal.css`、`blockAdmin.css`、`initLoadingPage.css` 全面改用單一終端機綠 (`#00ff9d`) 作為主色，取代原本青藍、青綠、藍色等多套不一致的色系。
   - **去玻璃化 / 去漸層**：移除卡片與按鈕的 `backdrop-filter` 模糊效果與漸層底色，改為實色背景搭配 hover 反色互動；圓角統一收斂為 `2px`，呈現方正俐落的終端機質感。
   - **字體統一**：全站字體改為等寬字 (`JetBrains Mono` / `Fira Code` / `Consolas`)，並將 label 文字改為大寫 + 字距加寬，強化系統化的儀表板氛圍。
2. ✨ **背景格線與掃描線動畫**
   - 為 `blockMain`、`blockAdmin`、`initLoadingPage`、`syncErrorPage` 的頁面外層加上極淡的電路板格線背景，並疊加一條每 7 秒緩緩掃過畫面的掃描光帶動畫，緩解原本大片留白的單調感，且不影響版面互動。
   - `syncErrorPage` 的格線與掃描線改用警示紅 (`#f43f5e`)，維持該頁原有的故障感基調。
3. 🐛 **修復審核 Modal 內容不可見問題**
   - 定位出 `blockAdmin.vue` 的審核細節彈窗因使用 `<Teleport to="body">` 移出 `.ba-body` 範圍，導致原本只定義在 `.ba-body` 上的 CSS 變數（配色）全部失效。
   - 將 `--primary-color`、`--text-color` 等核心變數提升至 `:root`，並為 `.ba-modal-window` 補上明確的文字顏色、為原本完全沒有樣式的 `.ba-data-value` 補上白色粗體規則，確保帳號、日期、信箱等審核細節在任何情況下都清楚可讀。

## 📅 2026.10.27 更新日誌：模組中介站與命名整理

新增支援 GET／POST 的模組中介站、三個區塊鏈示範模組與可操作頁面，統一檔案命名並移除未使用的舊服務。

1. 🧩 **模組中介站與生命週期**
   - **統一分派**：新增 `ApiGateway`，透過 `register` 註冊模組，再依 `call({ module, params, method? })` 呼叫對應功能。
   - **實例管理**：Nuxt plugin 初始化時建立中介站與三個模組，同一個 app 內重用實例，SSR 請求之間各自獨立。
   - **請求規則**：GET 使用 query、POST 使用 body；可省略 method，由模組決定，傳入不符的方法則在送出前拒絕。
2. 🔗 **區塊鏈示範模組與操作頁面**
   - **三項功能**：提供轉帳 `TransferModule`（POST）、查詢用戶 `UserModule`（GET）與查閱區塊 `BlockModule`（GET）。
   - **操作範例**：新增 `/gatewayDemo` 頁面、`useApiGateway` composable 與 `/api/demo` 示範 API；目前僅回傳模擬資料，不會實際轉帳。
   - **後端設定**：可透過 `NUXT_PUBLIC_API_BASE` 調整後端網址，並依實際 API 契約替換模組路徑及型別。
3. 🧹 **命名統一與舊程式清理**
   - **命名規則**：共用元件與類別檔使用 PascalCase，頁面、CSS、函式與 plugin 檔使用 camelCase，並同步更新引用。
   - **路徑修正**：統一載入頁與錯誤頁檔名的大小寫，修正 `blockAccountMain.css` 拼字與既有 CSS 引用路徑。
   - **移除舊檔**：刪除未使用的 `app/method` 兩個檔案及資料夾，清除 `wallet.ts` 中對應的註解程式碼。
4. ✅ **測試與文件補充**
   - **功能驗證**：5 項中介站測試與 1 項整合測試通過，並完成 Nuxt 正式建置驗證。
   - **修改紀錄**：整理[本日完整修改紀錄](docs/changes-2026-10-27.md)，說明功能、檔名調整與驗證方式。
   - **使用文件**：補充[中介站使用方式](docs/api-gateway.md)與[檔案命名規則](docs/file-naming.md)，供後續擴充參考。
