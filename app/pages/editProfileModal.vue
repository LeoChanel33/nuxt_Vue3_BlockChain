<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWalletStore } from '~/stores/wallet'
import '../css/accountEditModal.css'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const walletStore = useWalletStore()

// 綁定表單的內部狀態
const formData = ref({
  accountName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  address: ''
})

// 帶出：將全域 state 中的資料同步至表單
const loadData = () => {
  if (walletStore.isConnected) {
    formData.value = {
      accountName: walletStore.userInfo?.account || '',
      password: walletStore.userInfo?.password || '',
      confirmPassword: walletStore.userInfo?.password || '',
      phone: walletStore.userInfo?.phone || '',
      email: walletStore.userInfo?.email || '',
      address: walletStore.userInfo?.address || ''
    }
    alert('🔄 已成功帶出最新使用者資料！')
  }
}

// 送出：將修改後的表單資料存回全域 state (實務上這裡會是 API 請求)
const submitData = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('❌ 密碼與確認密碼不相符，請重新輸入！')
    return
  }
  
  // 更新至 Pinia Store (改用 userInfo)
  walletStore.userInfo = {
    ...walletStore.userInfo,
    account: formData.value.accountName,
    phone: formData.value.phone,
    email: formData.value.email,
    address: formData.value.address,
    password: formData.value.password || walletStore.userInfo.password
  }

  alert('✅ 使用者資料修改成功！')
  closeModal()
}

// 關閉彈窗
const closeModal = () => {
  emit('close')
}

// 每次打開彈窗時，自動帶入當前的資料
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    formData.value = {
      accountName: walletStore.userInfo?.account || '',
      password: '', // 基於安全，打開時密碼預設留空
      confirmPassword: '',
      phone: walletStore.userInfo?.phone || '',
      email: walletStore.userInfo?.email || '',
      address: walletStore.userInfo?.address || ''
    }
  }
})
</script>

<template>
  <ClientOnly>
  <Teleport to="body">
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content profile-modal account-edit-modal">
      <div class="modal-header">
        <h2>✏️ 修改使用者資料</h2>
        <span class="close-btn" @click="closeModal">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>使用者帳號 (不可更改):</label>
          <input type="text" :value="walletStore.walletAddress" disabled class="disabled-input" />
        </div>
        <div class="form-group">
          <label>帳號名稱:</label>
          <input type="text" v-model="formData.accountName" placeholder="請輸入帳號名稱" />
        </div>
        <div class="form-group">
          <label>登入密碼:</label>
          <input type="password" v-model="formData.password" placeholder="請輸入新密碼" />
        </div>
        <div class="form-group">
          <label>確認密碼:</label>
          <input type="password" v-model="formData.confirmPassword" placeholder="請再次輸入新密碼" />
        </div>
        <div class="form-group">
          <label>聯絡電話:</label>
          <input type="tel" v-model="formData.phone" placeholder="請輸入聯絡電話" />
        </div>
        <div class="form-group">
          <label>Email 信箱:</label>
          <input type="email" v-model="formData.email" placeholder="請輸入 Email" />
        </div>
        <div class="form-group">
          <label>聯絡住址:</label>
          <input type="text" v-model="formData.address" placeholder="請輸入聯絡住址" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="action-btn load-btn" @click="loadData">🔄 帶出</button>
        <button class="action-btn submit-btn" @click="submitData">✅ 送出</button>
        <button class="action-btn close-btn-action" @click="closeModal">❌ 關閉</button>
      </div>
    </div>
  </div>
  </Teleport>
  </ClientOnly>
</template>

