<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWalletStore } from '~/stores/wallet'
import '../css/specialStoreModal.css'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const walletStore = useWalletStore()

// 表單綁定狀態
type IdValue = string | number
const selectedCompanyId = ref<IdValue>('')
const selectedVipId = ref<IdValue>('')
const selectedAgreedAccountAddress = ref('')
const fetchedAccount = ref<{name: string, address: string, account: string, email: string, phone: string, physicalAddress: string} | null>(null)
const accountValidationMsg = ref('')
const selectedVipForDetails = ref<any>(null)

// 確認彈窗的開關
const showConfirmModal = ref(false)

// 新增特約帳號彈窗狀態
const showNewVipModal = ref(false)
const newVipName = ref('')

// === 連動計算屬性 ===
// 動態過濾下方顯示的特約帳號清單 (若有選擇公司，則只顯示該公司的特約帳號)
const displayedVips = computed(() => {
  if (!selectedCompanyId.value) return walletStore.vipAccounts
  return walletStore.vipAccounts.filter(g => String(g.companyId) === String(selectedCompanyId.value))
})

// 動態提供特約帳號輸入框的自動完成選項 (僅限目前選擇的公司)
const availableVipNames = computed(() => {
  if (!selectedCompanyId.value) return []
  return walletStore.vipAccounts.filter(g => String(g.companyId) === String(selectedCompanyId.value))
})

// 按鈕1: 新增 (清空表單，準備輸入下一筆)
const resetForm = () => {
  selectedCompanyId.value = ''
  selectedVipId.value = ''
  selectedAgreedAccountAddress.value = ''
  fetchedAccount.value = null
  accountValidationMsg.value = ''
}

// 開啟新增特約帳號彈窗
const openNewVipModal = () => {
  if (!selectedCompanyId.value) {
    alert('⚠️ 請先選擇合作公司！')
    return
  }
  newVipName.value = ''
  showNewVipModal.value = true
}

// 確認建立新特約帳號
const confirmCreateNewVip = () => {
  if (newVipName.value && newVipName.value.trim()) {
    const vipId = 'vip_' + Date.now()
    walletStore.vipAccounts.push({
      id: vipId,
      companyId: selectedCompanyId.value,
      name: newVipName.value.trim(),
      accounts: []
    })
    selectedVipId.value = vipId
    alert('✅ 成功建立新特約帳號！')
    showNewVipModal.value = false
  } else {
    alert('⚠️ 特約帳號名稱不能為空白！')
  }
}

// 獲取並驗證帳戶資料
const fetchAccountInfo = () => {
  if (!selectedAgreedAccountAddress.value) {
    accountValidationMsg.value = '⚠️ 請輸入帳號地址'
    fetchedAccount.value = null
    return
  }
  const acc = walletStore.agreedAccounts.find(a => a.address.toLowerCase() === selectedAgreedAccountAddress.value.trim().toLowerCase())
  if (acc) {
    fetchedAccount.value = { 
      name: acc.name, 
      address: acc.address,
      account: acc.account,
      email: acc.email,
      phone: acc.phone,
      physicalAddress: acc.physicalAddress
    }
    accountValidationMsg.value = `✅ 合法帳戶 - 名稱: ${acc.name}`
  } else {
    fetchedAccount.value = null
    accountValidationMsg.value = '❌ 找不到該帳戶或非約定帳戶'
  }
}

// 按鈕2: 確認帳號 (檢查是否有漏填，若無則開啟確認彈窗)
const verifyAccount = () => {
  if (!selectedCompanyId.value || !selectedVipId.value || !fetchedAccount.value) {
    alert('⚠️ 請選擇公司、選擇特約帳號，並確實點擊按鈕獲取合法帳戶資料！')
    return
  }
  showConfirmModal.value = true
}

// 確認彈窗中的「確認新增」動作
const confirmAdd = () => {
  if (!fetchedAccount.value) {
    alert('❌ 錯誤：尚未獲取合法帳戶，請重新操作。')
    showConfirmModal.value = false
    return
  }

  // 確認該特約帳號是否已存在於該公司下
  const existingVip = walletStore.vipAccounts.find(g => String(g.id) === String(selectedVipId.value))
  if (existingVip) {
    // 檢查該帳戶是否已經綁定於此特約帳號內
    if (existingVip.accounts.some(a => a.address === fetchedAccount.value!.address)) {
      alert('⚠️ 此帳號已綁定於該特約帳號中！')
      showConfirmModal.value = false
      return
    }
    existingVip.accounts.push({
      name: fetchedAccount.value.name,
      address: fetchedAccount.value.address,
      account: fetchedAccount.value.account,
      email: fetchedAccount.value.email,
      phone: fetchedAccount.value.phone,
      physicalAddress: fetchedAccount.value.physicalAddress
    })
  } else {
    alert('❌ 錯誤：找不到選擇的特約帳號。')
    return
  }

  alert('✅ 成功綁定帳號！')
  showConfirmModal.value = false
  resetForm()
}

const closeModal = () => {
  emit('close')
}

// 刪除單筆綁定的約定帳戶
const removeAccount = (vipId: IdValue, accountIndex: number) => {
  const vip = walletStore.vipAccounts.find(g => String(g.id) === String(vipId))
  if (vip) {
    vip.accounts.splice(accountIndex, 1)
  }
}

// 刪除整個特約帳號
const removeVip = (vipId: IdValue) => {
  const index = walletStore.vipAccounts.findIndex(g => String(g.id) === String(vipId))
  if (index !== -1) {
    walletStore.vipAccounts.splice(index, 1)
  }
}

// 透過 CompanyId 查詢公司名稱來顯示
const getCompanyName = (companyId: IdValue) => {
  const comp = walletStore.companies.find(c => String(c.id) === String(companyId))
  return comp ? comp.name : '未知公司'
}
</script>

<template>
  <ClientOnly>
  <Teleport to="body">
    <!-- 主設定彈窗 -->
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content special-store-modal">
        <div class="modal-header">
          <h2>⚙️ 特約帳號設定</h2>
          <span class="close-btn" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group-row" style="align-items: flex-start; margin-bottom: 8px;">
            <!-- 切換公司時，連動清空 特約帳號 名稱與已選擇的約定帳戶 -->
            <select v-model="selectedCompanyId" style="flex: 1; margin-bottom: 0;" @change="selectedVipId = ''; selectedAgreedAccountAddress = ''; fetchedAccount = null; accountValidationMsg = ''">
              <option value="" disabled>-- 選擇特約合作公司 --</option>
              <option v-for="comp in walletStore.companies" :key="comp.id" :value="comp.id">
                {{ comp.name }}
              </option>
            </select>
            <select v-model="selectedVipId" style="flex: 1; margin-bottom: 0;">
              <option value="" disabled>-- 選擇已建立的特約帳號 --</option>
              <option v-for="vip in availableVipNames" :key="vip.id" :value="vip.id">{{ vip.name }}</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
            <button class="action-btn add-btn small-btn" @click="openNewVipModal">➕ 新增特約帳號</button>
          </div>
          <div class="form-group">
            <label style="margin-top: 10px;">輸入要綁定的約定帳戶地址：</label>
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
              <input type="text" v-model="selectedAgreedAccountAddress" placeholder="請輸入帳戶地址..." style="flex: 1; margin-bottom: 0;" @input="fetchedAccount = null; accountValidationMsg = ''" />
              <button class="action-btn verify-btn" style="white-space: nowrap;" @click="fetchAccountInfo">🔍 獲取資料</button>
            </div>
            <!-- 獲取資料成功後，帶出唯讀欄位供使用者確認 -->
            <div v-if="fetchedAccount" style="display: flex; gap: 10px; margin-bottom: 8px;">
              <div style="flex: 1;">
                <label style="margin-bottom: 4px; font-size: 0.85rem; color: #94a3b8;">自動帶出: 帳戶名稱</label>
                <input type="text" disabled :value="fetchedAccount.name" style="margin-bottom: 0; background: rgba(0,0,0,0.2); color: #cbd5e1; cursor: not-allowed; padding: 8px 12px;" />
              </div>
              <div style="flex: 1;">
                <label style="margin-bottom: 4px; font-size: 0.85rem; color: #94a3b8;">自動帶出: 登入帳號 (Account)</label>
                <input type="text" disabled :value="fetchedAccount.account" style="margin-bottom: 0; background: rgba(0,0,0,0.2); color: #cbd5e1; cursor: not-allowed; padding: 8px 12px;" />
              </div>
            </div>
            <div v-if="accountValidationMsg" :style="{ color: fetchedAccount ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }">
              {{ accountValidationMsg }}
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-start; margin-top: 10px;">
            <button class="action-btn" style="background: #64748b; color: white;" @click="resetForm">🧹 清空表單</button>
            <button class="action-btn verify-btn" @click="verifyAccount">✅ 確認帳號</button>
            <button class="action-btn close-btn-action" @click="closeModal">❌ 關閉</button>
          </div>

          <hr class="divider" style="margin: 20px 0;" />

          <div class="table-container">
            <h3 style="margin-top: 0; color: var(--primary-color);">目前特約帳號清單 {{ selectedCompanyId ? '(已過濾)' : '' }}</h3>
            <div v-for="vip in displayedVips" :key="vip.id" class="vip-section">
              <div class="vip-header">
                <strong>{{ getCompanyName(vip.companyId) }}</strong> - {{ vip.name }}
                <span style="font-size: 0.85rem; color: #94a3b8; margin-left: 10px;">(共 {{ vip.accounts.length }} 個約定帳戶)</span>
                <div style="margin-left: auto; display: flex; gap: 8px;">
                  <button class="action-btn verify-btn" @click="selectedVipForDetails = vip" style="padding: 4px 8px; font-size: 0.75rem;">查看明細</button>
                  <button class="action-btn delete-btn" @click="removeVip(vip.id)" style="padding: 4px 8px; font-size: 0.75rem;">刪除特約帳號</button>
                </div>
              </div>
            </div>
            <div v-if="displayedVips.length === 0" style="text-align: center; color: #94a3b8; padding: 20px;">
              目前尚無符合的特約帳號
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 二次確認帳號彈窗 -->
    <div v-if="showConfirmModal" class="modal-overlay" style="z-index: 10000;" @click.self="showConfirmModal = false">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h2>⚠️ 確認帳號資訊</h2>
          <span class="close-btn" @click="showConfirmModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <p><strong>合作公司:</strong> {{ getCompanyName(selectedCompanyId) }}</p>
          <p><strong>特約帳號名稱:</strong> {{ walletStore.vipAccounts.find(g => g.id === selectedVipId)?.name }}</p>
          <p><strong>帳戶名稱:</strong> {{ fetchedAccount?.name }}</p>
          <p><strong>登入帳號:</strong> {{ fetchedAccount?.account }}</p>
          <p><strong>Email:</strong> {{ fetchedAccount?.email }}</p>
          <p><strong>手機號碼:</strong> {{ fetchedAccount?.phone }}</p>
          <p><strong>聯絡地址:</strong> {{ fetchedAccount?.physicalAddress }}</p>
          <p><strong>錢包地址:</strong> <span class="hash-text">{{ fetchedAccount?.address.slice(0,6) }}...{{ fetchedAccount?.address.slice(-4) }}</span></p>
          <p style="margin-top: 15px; color: #fbbf24;">請確認以上資訊是否正確？</p>
        </div>
        <div class="modal-footer">
          <button class="action-btn submit-btn" @click="confirmAdd">✅ 確認新增</button>
          <button class="action-btn close-btn-action" @click="showConfirmModal = false">❌ 取消</button>
        </div>
      </div>
    </div>

    <!-- 特約帳號明細彈窗 (第三層視窗) -->
    <div v-if="selectedVipForDetails" class="modal-overlay" style="z-index: 10005;" @click.self="selectedVipForDetails = null">
      <!-- 加寬彈窗並允許橫向捲動，避免欄位過多擠壓 -->
      <div class="modal-content confirm-modal" style="max-width: 900px; overflow-x: auto;">
        <div class="modal-header">
          <h2>📄 特約帳號明細: {{ selectedVipForDetails.name }}</h2>
          <span class="close-btn" @click="selectedVipForDetails = null">&times;</span>
        </div>
        <div class="modal-body">
          <table class="history-table" style="margin-top: 5px; white-space: nowrap;">
            <thead>
              <tr>
                <th>帳戶名稱</th>
                <th>登入帳號(Account)</th>
                <th>Email</th>
                <th>手機</th>
                <th>聯絡地址</th>
                <th>錢包地址</th>
                <th style="width: 80px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(acc, index) in selectedVipForDetails.accounts" :key="index">
                <td>{{ acc.name }}</td>
                <td>{{ acc.account }}</td>
                <td>{{ acc.email }}</td>
                <td>{{ acc.phone }}</td>
                <td>{{ acc.physicalAddress }}</td>
                <td class="hash-text">{{ acc.address.slice(0,6) }}...{{ acc.address.slice(-4) }}</td>
                <td>
                  <button class="action-btn delete-btn" @click="removeAccount(selectedVipForDetails.id, index)">解除綁定</button>
                </td>
              </tr>
              <tr v-if="selectedVipForDetails.accounts.length === 0">
                <td colspan="7" style="text-align: center; color: #94a3b8;">目前尚無綁定帳號</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 新增特約帳號專屬彈窗 -->
    <div v-if="showNewVipModal" class="modal-overlay" style="z-index: 10010;" @click.self="showNewVipModal = false">
      <div class="modal-content prompt-modal">
        <div class="modal-header">
          <h2>🏷️ 建立新特約帳號</h2>
          <span class="close-btn" @click="showNewVipModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <label style="margin-bottom: 8px; display: block; color: #cbd5e1;">請輸入新特約帳號的名稱：</label>
          <input type="text" v-model="newVipName" placeholder="例如: 財務部核心特約..." @keyup.enter="confirmCreateNewVip" style="margin-bottom: 5px;" autofocus />
          <small style="color: #94a3b8;">此特約帳號將建立於目前所選的合作公司下。</small>
        </div>
        <div class="modal-footer" style="margin-top: 25px;">
          <button class="action-btn submit-btn" @click="confirmCreateNewVip">✅ 確認建立</button>
          <button class="action-btn close-btn-action" @click="showNewVipModal = false">❌ 取消</button>
        </div>
      </div>
    </div>
  </Teleport>
  </ClientOnly>
</template>
