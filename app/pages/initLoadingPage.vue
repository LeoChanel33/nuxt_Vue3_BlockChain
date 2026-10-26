<script setup>
// 這個元件主要用於純視覺展示，因此沒有包含 JavaScript 腳本邏輯。
import '../css/initLoadingPage.css';
</script>

<template>
  <div class="initLoading-page-wrapper">
    <div class="initLoading-container">
      <div class="initLoading-node-cluster">
        <div class="initLoading-node initLoading-central"></div>
        <!-- 內圈節點 -->
        <div class="initLoading-node initLoading-orbit-inner-1"></div>
        <div class="initLoading-node initLoading-orbit-inner-2"></div>
        <!-- 中圈節點 -->
        <div class="initLoading-node initLoading-orbit-mid-1"></div>
        <div class="initLoading-node initLoading-orbit-mid-2"></div>
        <!-- 外圈節點 -->
        <div class="initLoading-node initLoading-orbit-outer-1"></div>
        <div class="initLoading-node initLoading-orbit-outer-2"></div>
      </div>
      <p class="initLoading-loading-text">正在同步區塊鏈節點...</p>
    </div>
  </div>
</template>


