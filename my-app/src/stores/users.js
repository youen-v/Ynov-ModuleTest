import { defineStore } from "pinia";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
        const { data } = await axios.get(`${API_BASE_URL}/users`);

        const rows = data?.utilisateurs ?? data?.users ?? data ?? [];

        this.users = rows.map((user) => ({
          id: user.id,
          name: user.nom,
          email: user.email,
        }));
      } catch (e) {
        console.error(e);
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
        await axios.post(`${API_BASE_URL}/users`, user);
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
