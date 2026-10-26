<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWalletStore } from '~/stores/wallet'
import '../css/accountEditModal.css'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const walletStore = useWalletStore()

// 表單綁定狀態
const account = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const password = ref('')
const confirmPassword = ref('')

// 當彈出視窗打開時，從 store 帶入現有的狀態
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // 假設您的 store 中新增了 userInfo 物件
    account.value = walletStore.userInfo?.account || ''
    phone.value = walletStore.userInfo?.phone || ''
    email.value = walletStore.userInfo?.email || ''
    address.value = walletStore.userInfo?.address || ''
    password.value = '' // 基於安全，密碼預設不回填
    confirmPassword.value = ''
  }
})

// 帶出資料：點擊按鈕後手動載入 Store 的資料
const loadData = () => {
  account.value = walletStore.userInfo?.account || ''
  phone.value = walletStore.userInfo?.phone || ''
  email.value = walletStore.userInfo?.email || ''
  address.value = walletStore.userInfo?.address || ''
  alert('✅ 成功帶出最新資料！')
}

const closeModal = () => {
  emit('close')
}

const saveProfile = () => {
  if (password.value !== confirmPassword.value) {
    alert('⚠️ 兩次輸入的密碼不一致！')
    return
  }
  
  // 一次性更新 Store 狀態，避免 TypeScript 屬性缺失的報錯
  walletStore.userInfo = {
    ...walletStore.userInfo, // 保留原有其他資料
    account: account.value,
    phone: phone.value,
    email: email.value,
    address: address.value,
    // 如果有輸入新密碼就更新，否則保留舊密碼
    password: password.value ? password.value : walletStore.userInfo.password
  }

  alert('✅ 帳號資料已成功更新！')
  closeModal()
}
</script>

<template>
  <ClientOnly>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content account-edit-modal">
        <div class="modal-header">
          <h2>📝 編輯帳號資料</h2>
          <span class="close-btn" @click="closeModal">&times;</span>
        </div>
        
        <div class="modal-body">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
            <button type="button" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem;" @click="loadData">🔄 帶出資料</button>
          </div>

          <div class="form-group-row">
            <div class="form-group">
              <label>連線錢包 (不可更改)</label>
              <input type="text" :value="walletStore.walletAddress || walletStore.shortAddress || '尚未連線'" disabled class="readonly-input" />
            </div>
            <div class="form-group">
              <label>使用者帳號 (不可更改)</label>
              <input type="text" :value="account" disabled class="readonly-input" />
            </div>
          </div>

          <div class="form-group-row">
            <div class="form-group">
              <label>聯絡電話</label>
              <input type="tel" v-model="phone" placeholder="請輸入電話號碼" />
            </div>
            <div class="form-group">
              <label>電子郵件 (E-mail)</label>
              <input type="email" v-model="email" placeholder="請輸入電子郵件" />
            </div>
          </div>

          <div class="form-group">
            <label>通訊地址</label>
            <input type="text" v-model="address" placeholder="請輸入聯絡地址" />
          </div>

          <hr class="divider" />

          <div class="form-group-row">
            <div class="form-group">
              <label>新密碼</label>
              <input type="password" v-model="password" placeholder="請輸入新密碼 (不更改請留空)" />
            </div>
            <div class="form-group">
              <label>密碼二次確認</label>
              <input type="password" v-model="confirmPassword" placeholder="請再次輸入新密碼" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: flex-end; margin-top: 20px;">
          <button class="action-btn cancel-btn" @click="closeModal">❌ 取消</button>
          <button class="action-btn save-btn" @click="saveProfile">💾 儲存變更</button>
        </div>
      </div>
    </div>
  </Teleport>
  </ClientOnly>
</template>