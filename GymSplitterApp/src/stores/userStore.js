import { defineStore } from "pinia"

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [], 
    currentUser: null 
  }),
  persist: true,
  actions: {

    setCurrentUserSignUp(user) {
      this.currentUser = user
    },

    setCurrentUserLogIn(user) {
      this.currentUser = user
    },

    logout() {
      this.currentUser=null
    },

  }
})