import { defineStore } from "pinia";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: JSON.parse(localStorage.getItem("users")) || [],
    error: null,
  }),
  getters: {
    userCount: (state) => state.users.length,
    getError: (state) => state.error,
  },
  actions: {
    addUser(user) {
      const existingUser = this.users.find((u) => u.email === user.email);
      if (existingUser) {
        this.error = "Email déjà utilisé";
        throw new Error("Email déjà utilisé");
      }
      this.users.push(user);
      localStorage.setItem("users", JSON.stringify(this.users));
      this.error = null;
    },
    clearError() {
      this.error = null;
    },
  },
});
