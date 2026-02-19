// src/stores/users.js
import { defineStore } from "pinia";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
  }),
  getters: {
    userCount: (state) => state.users.length,
  },
  actions: {
    addUser(user) {
      this.users.push(user);
    },
  },
});
