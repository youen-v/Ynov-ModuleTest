import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useUsersStore } from "@/stores/users";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const usersStore = useUsersStore(pinia);
usersStore.loadUsers?.();

app.mount("#app");
export default app;
