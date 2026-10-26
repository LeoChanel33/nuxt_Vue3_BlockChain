
<script setup>
import "../css/syncErrorPage.css";
// 模擬點擊重啟按鈕的操作
const handleReboot = () => {
  alert('正在嘗試重新連接節點系統...')
  // 這裡可以加入 router 推送或重新呼叫 API 的邏輯
}
</script>

<template>
  <div class="syncError-wrapper">
    <!-- =========================================
         主要內容：錯誤狀態卡片
         ========================================= -->
    <div class="syncError-fatal-error-card">
      <div class="syncError-error-core-visual">
        <div class="syncError-dead-orbit"></div>
        <div class="syncError-neon-cross"></div>
      </div>
      
      <span class="syncError-error-code">ERR_NODE_DISCONNECTED</span>
      <h3 class="syncError-error-title">主網連線中斷</h3>
      <p class="syncError-error-desc">無法與區塊鏈節點建立穩定通訊。<br>請檢查網路環境或切換 RPC 伺服器。</p>
      
      <button class="syncError-sys-reboot-btn" @click="handleReboot">> INIT_REBOOT</button>
    </div>

    <!-- =========================================
         底部內容：系統版本與開發者資訊
         ========================================= -->
    <div class="syncError-system-credits">
      <span class="syncError-credit-item">開發者: <span class="syncError-highlight">LEO</span></span>
      <span class="syncError-divider">/</span>
      <span class="syncError-credit-item">聯絡資訊: <a href="mailto:loveaoe33@gmail.com" class="syncError-credit-link">loveaoe33@gmail.com</a></span>
      <span class="syncError-divider">/</span>
      <span class="syncError-credit-item syncError-version">系統版本: ETH 2.0-V1.0</span>
    </div>
  </div>
</template>

