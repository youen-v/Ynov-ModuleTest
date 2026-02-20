import { defineStore } from "pinia";
import axios from "axios";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    error: null,
    loading: false,
  }),
  getters: {
    userCount: (state) => state.users.length,
    getError: (state) => state.error,
  },
  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await axios.get(
          "https://jsonplaceholder.typicode.com/users",
        );
        this.users = data ?? [];
      } catch (e) {
        this.error = "Erreur lors du chargement des utilisateurs";
      } finally {
        this.loading = false;
      }
    },

    async addUser(user) {
      const existingUser = this.users.find((u) => u.email === user.email);
      if (existingUser) {
        this.error = "Email déjà utilisé";
        throw new Error(this.error);
      }

      this.error = null;

      this.users.push(user);

      try {
        await axios.post("https://jsonplaceholder.typicode.com/users", user);
      } catch (error) {
        const status = error?.response?.status;
        const backendMsg = error?.response?.data?.message;

        if (status === 400 && backendMsg) {
          this.error = backendMsg;
          throw new Error(this.error);
        }

        if (status >= 500) {
          this.error = "Serveur indisponible, réessaie plus tard";
          throw new Error(this.error);
        }

        this.error = "Erreur survenue dans l'envoi du formulaire";
        throw new Error(this.error);
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
