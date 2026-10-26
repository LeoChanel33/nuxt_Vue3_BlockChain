<template>
  <div class="container">
    <h1>歡迎來到 Nuxt 3 測試頁面</h1>
    <p>點擊次數：{{ count }}</p>
    <button @click="count++">點我增加</button>

    <!-- 引用自訂元件 -->
    <MyCard title="卡片標題" content="這是測試卡片內容" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MyCard from '~/components/MyCard.vue' // 需先建立 components/MyCard.vue

const count = ref(0)
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
}

button {
  padding: 8px 16px;
  margin: 16px 0;
  cursor: pointer;
}
</style>
