import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UsersApiFactory, type GetOwnUserResDto } from 'user-api-sdk'

export const useUserStore = defineStore('data', () => {
  const ownUser = ref<GetOwnUserResDto | null>(null)

  async function fetchOwnUser() {
    if (ownUser.value !== null)
      return ownUser.value;

    const idToken = localStorage.getItem('id_token')!;

    const usersApi = UsersApiFactory({
        basePath: import.meta.env.VITE_API_URL,
        accessToken: () => idToken,
        isJsonMime: () => true,
    });

    const res = await usersApi.usersControllerGetOwnUser();
    ownUser.value = res.data;

    return ownUser.value;
  }

  return { fetchOwnUser }
})