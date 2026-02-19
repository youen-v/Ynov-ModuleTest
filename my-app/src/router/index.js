import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Register from "../views/UserForm.vue";

// Définis les routes
const routes = [
  { path: "/", component: Home },
  { path: "/register", component: Register },
];

const router = createRouter({
  history: createWebHistory("/Ynov-ModuleTest/"),
  routes,
});

export default router;
