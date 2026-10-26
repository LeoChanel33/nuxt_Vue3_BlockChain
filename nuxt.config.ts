// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // 可透過 NUXT_PUBLIC_API_BASE 改為實際後端網址。
      apiBase: '/api/demo',
    },
  },
  modules: [
    ['@pinia/nuxt', {
      autoImports: [
        'defineStore', // 自動匯入 defineStore
      ],
    }]
  ],
})
// nuxt.config.ts
