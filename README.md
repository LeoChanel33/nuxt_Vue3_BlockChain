├── frontend-nuxt/           # Nuxt3 前端專案
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


### 🔄 交易流向說明
1. **讀取數據**: Nuxt3 透過 `useFetch` 調用 Java 後端 API，或直接透過 `viem` 讀取鏈上數據。
2. **發起交易**: 
   - 用戶透過前端 MetaMask 簽名。
   - 或是前端調用 Java API，由後端使用 Web3j 進行「託管式簽名」或「多重簽名」邏輯處理。
3. **異步確認**: Java 後端 Web3j 監聽器捕捉到 `Transfer` 或自定義 `Event`，透過 WebSocket 通知前端並更新 DB。

## 📅 2026.05.15 更新日誌：前端狀態 UI 模板整合
本次更新完成了三隻前端狀態展示 UI 的 Vue 3 單文件組件 (SFC) 轉換與樣式隔離。

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

## 2026.10.27 更新日誌：模組中介站與命名整理

新增支援 GET／POST 的模組中介站、三個區塊鏈示範模組與可操作頁面，統一檔案命名並移除未使用的舊服務。

- [本日完整修改紀錄](docs/changes-2026-10-27.md)
- [中介站使用方式](docs/api-gateway.md)
- [檔案命名規則](docs/file-naming.md)
