import { useNuxtApp } from '#app'

export function useApiGateway() {
  return useNuxtApp().$apiGateway
}
