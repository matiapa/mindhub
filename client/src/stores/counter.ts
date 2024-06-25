import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UsersApiFactory } from '@/libs/user-api-sdk'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
