import { defineStore } from 'pinia'
import { UpdateProfileReqDtoGenderEnum, UsersApiFactory, type GetOwnUserResDto } from 'user-api-sdk'

let usersApi: ReturnType<typeof UsersApiFactory>;

export const useUserStore = defineStore('userStore', {
  state: () => ({
    ownUser: null as GetOwnUserResDto | null,
  }),

  actions: {
    async setup() {
      const idToken = localStorage.getItem('id_token');
      if (!idToken) {
        return;
      }
  
      usersApi = UsersApiFactory({
          basePath: import.meta.env.VITE_API_URL,
          accessToken: () => idToken,
          isJsonMime: () => true,
      });
  
      await this.fetchOwnUser();
    },
  
    async fetchOwnUser() {
      if (this.ownUser !== null)
        return this.ownUser;
  
      const res = await usersApi.usersControllerGetOwnUser();
      this.ownUser = res.data;
  
      return this.ownUser;
    },
  
    async updateProfile(gender: UpdateProfileReqDtoGenderEnum, birthday: Date, biography: string) {
      await usersApi.usersControllerUpdateProfile({
        gender,
        birthday: birthday.toISOString(),
        biography
      });

      this.ownUser!.profile.gender = gender;
      this.ownUser!.profile.birthday = birthday.toISOString();
      this.ownUser!.profile.biography = biography;
      this.ownUser!.profile.completed = true;
    }
  },
});