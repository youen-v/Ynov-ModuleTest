<template>
  <div class="home-container">
    <div class="home-content">
      <h1 class="home-title">Bienvenue sur notre application !</h1>
      <p class="user-count">{{ userCount }} utilisateur(s) inscrit(s)</p>

      <div v-if="userCount > 0" class="user-list-container">
        <h2 class="user-list-title">Liste des utilisateurs inscrits</h2>
        <ul class="user-list">
          <li v-for="user in users" :key="user.email" class="user-item">
            {{ user.firstName }} {{ user.lastName }}
          </li>
        </ul>
      </div>
      <p v-else class="no-users">Aucun utilisateur inscrit.</p>

      <router-link to="/register" class="register-link">S'inscrire</router-link>
    </div>
  </div>
</template>

<script setup>
import { useUsersStore } from '@/stores/users';
import { computed } from 'vue';

const usersStore = useUsersStore();
const users = computed(() => usersStore.users);
const userCount = computed(() => usersStore.userCount);
</script>
<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  padding: 20px;
}

.home-content {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.home-title {
  color: #ffffff;
  margin-bottom: 20px;
  font-size: 28px;
}

.user-count {
  color: #bb86fc;
  font-size: 18px;
  margin-bottom: 25px;
}

.user-list-container {
  margin-top: 20px;
}

.user-list-title {
  color: #acacac;
  font-size: 20px;
  margin-bottom: 15px;
}

.user-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.user-item {
  padding: 12px;
  margin: 8px 0;
  background-color: #2d2d2d;
  border-radius: 5px;
  color: #ffffff;
  font-size: 16px;
}

.no-users {
  color: #aaaaaa;
  font-size: 16px;
  margin-top: 20px;
}

.register-link {
  display: inline-block;
  margin-top: 25px;
  padding: 10px 20px;
  background-color: #bb86fc;
  color: #ffffff;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.register-link:hover {
  background-color: #9a67ea;
}
</style>
