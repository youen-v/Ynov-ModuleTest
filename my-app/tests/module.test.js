jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import axios from "axios";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import UserForm from "@/views/UserForm.vue";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

beforeEach(() => {
  jest.clearAllMocks();
  setActivePinia(createPinia());
  axios.post.mockResolvedValue({ data: {} });
});

describe("useUsersStore (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("getters: userCount / getError (initial state)", async () => {
    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    expect(store.users).toEqual([]);
    expect(store.userCount).toBe(0);
    expect(store.getError).toBeNull();
    expect(store.loading).toBe(false);
  });

  test("fetchUsers(): success -> fills users + toggles loading", async () => {
    const apiUsers = [
      { id: 1, email: "a@b.com", name: "A" },
      { id: 2, email: "c@d.com", name: "C" },
    ];
    axios.get.mockResolvedValueOnce({ data: apiUsers });

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    const p = store.fetchUsers();

    // juste après l'appel
    expect(store.loading).toBe(true);
    expect(store.getError).toBeNull();

    await p;

    expect(axios.get).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/users",
    );
    expect(store.loading).toBe(false);
    expect(store.getError).toBeNull();
    expect(store.users).toEqual(apiUsers);
    expect(store.userCount).toBe(2);
  });

  test("fetchUsers(): success with null/undefined data -> users becomes []", async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    store.users = [{ email: "existing@x.com" }];

    await store.fetchUsers();

    expect(store.users).toEqual([]);
    expect(store.userCount).toBe(0);
    expect(store.loading).toBe(false);
    expect(store.getError).toBeNull();
  });

  test("fetchUsers(): error -> sets error message + loading false + keeps users", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network"));

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    store.users = [{ email: "keep@me.com" }];

    await store.fetchUsers();

    expect(store.loading).toBe(false);
    expect(store.getError).toBe("Erreur lors du chargement des utilisateurs");
    expect(store.users).toEqual([{ email: "keep@me.com" }]);
  });

  test("addUser(): success -> adds user + calls POST + clears error", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    store.error = "Old error";

    const newUser = { email: "new@user.com", firstName: "New" };

    await store.addUser(newUser);

    expect(store.getError).toBeNull();
    expect(store.userCount).toBe(1);
    expect(store.users[0]).toEqual(newUser);

    expect(axios.post).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/users",
      newUser,
    );
  });

  test("addUser(): duplicate email -> throws + sets error + does NOT call POST + does NOT add", async () => {
    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    store.users = [{ email: "dup@user.com" }];

    await expect(store.addUser({ email: "dup@user.com" })).rejects.toThrow(
      "Email déjà utilisé",
    );

    expect(store.getError).toBe("Email déjà utilisé");
    expect(store.userCount).toBe(1);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("addUser(): POST fails -> throws + sets error + still has pushed user (current implementation)", async () => {
    axios.post.mockRejectedValueOnce(new Error("500"));

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    const newUser = { email: "boom@user.com" };

    await expect(store.addUser(newUser)).rejects.toThrow(
      "Erreur survenue dans l'envoi du formulaire",
    );

    expect(store.getError).toBe("Erreur survenue dans l'envoi du formulaire");
    expect(store.userCount).toBe(1);
    expect(store.users[0]).toEqual(newUser);
  });

  test("clearError(): sets error to null", async () => {
    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    store.error = "Some error";
    store.clearError();

    expect(store.getError).toBeNull();
  });
});

test("store getters: userCount + getError", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });

  const { useUsersStore } = await import("@/stores/users");
  const store = useUsersStore();

  expect(store.userCount).toBe(0);
  expect(store.getError).toBeNull();

  axios.post.mockResolvedValueOnce({ data: {} });
  await store.addUser({ email: "a@b.com" });

  expect(axios.post).toHaveBeenCalledWith(
    "https://jsonplaceholder.typicode.com/users",
    { email: "a@b.com" },
  );

  await expect(store.addUser({ email: "a@b.com" })).rejects.toThrow(
    "Email déjà utilisé",
  );
});

test("store action: clearError()", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });

  const { useUsersStore } = await import("@/stores/users");
  const store = useUsersStore();

  axios.post.mockResolvedValue({ data: {} });

  await store.addUser({ email: "a@b.com" });
  await expect(store.addUser({ email: "a@b.com" })).rejects.toThrow();

  expect(store.getError).toBe("Email déjà utilisé");

  store.clearError();
  expect(store.getError).toBeNull();
});

async function renderWithPlugins(component = UserForm) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: { template: "<div>Home</div>" } },
      { path: "/register", name: "register", component },
    ],
  });

  router.push("/register");
  await router.isReady();

  return render(component, {
    global: {
      plugins: [pinia, router],
    },
  });
}

async function fillValidForm(user, overrides = {}) {
  const formValues = {
    lastName: "VALUN",
    firstName: "Youen",
    email: "youen@test.com",
    birthDate: "1998-05-05",
    zip: "92000",
    city: "Paris",
    ...overrides,
  };

  await user.clear(screen.getByTestId("lastName-input"));
  if (formValues.lastName)
    await user.type(screen.getByTestId("lastName-input"), formValues.lastName);

  await user.clear(screen.getByTestId("firstName-input"));
  if (formValues.firstName)
    await user.type(
      screen.getByTestId("firstName-input"),
      formValues.firstName,
    );

  await user.clear(screen.getByTestId("email-input"));
  if (formValues.email)
    await user.type(screen.getByTestId("email-input"), formValues.email);

  await user.clear(screen.getByTestId("birthDate-input"));
  if (formValues.birthDate)
    await user.type(
      screen.getByTestId("birthDate-input"),
      formValues.birthDate,
    );

  await user.clear(screen.getByTestId("zip-input"));
  if (formValues.zip)
    await user.type(screen.getByTestId("zip-input"), formValues.zip);

  await user.clear(screen.getByTestId("city-input"));
  if (formValues.city)
    await user.type(screen.getByTestId("city-input"), formValues.city);

  return formValues;
}

describe("UserForm (Integration)", () => {
  test("1) user: invalid input -> errors + button disabled -> valid input -> localStorage(users) + toast + reset", async () => {
    const user = userEvent.setup();

    await renderWithPlugins();

    const submitButton = screen.getByRole("button", { name: /envoyer/i });

    // sécurité UI
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("form-button--disabled");

    // blur sur Nom => erreur visible
    await user.click(screen.getByTestId("lastName-input"));
    await user.tab();

    const lastNameError = screen.getByTestId("error-lastName");
    expect(lastNameError).toBeVisible();
    expect(lastNameError).toHaveClass("error-message");

    // saisies invalides
    await user.type(screen.getByTestId("email-input"), "nope@");
    await user.tab();
    expect(screen.getByTestId("error-email")).toBeVisible();

    await user.type(screen.getByTestId("zip-input"), "12");
    await user.tab();
    expect(screen.getByTestId("error-zip")).toBeVisible();

    expect(submitButton).toBeDisabled();

    // corrections
    await user.clear(screen.getByTestId("lastName-input"));
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.tab();

    await user.clear(screen.getByTestId("firstName-input"));
    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.tab();

    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "youen@test.com");
    await user.tab();

    await user.type(screen.getByTestId("birthDate-input"), "1998-05-05");
    await user.tab();

    await user.clear(screen.getByTestId("zip-input"));
    await user.type(screen.getByTestId("zip-input"), "92000");
    await user.tab();

    await user.clear(screen.getByTestId("city-input"));
    await user.type(screen.getByTestId("city-input"), "Paris");
    await user.tab();

    // devenu valide
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).not.toHaveClass("form-button--disabled");

    // submit
    await user.click(submitButton);

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    expect(store.userCount).toBe(1);
    expect(store.users[0]).toMatchObject({
      lastName: "VALUN",
      firstName: "Youen",
      email: "youen@test.com",
      birthDate: "1998-05-05",
      zip: "92000",
      city: "Paris",
    });

    // toaster visible
    expect(screen.getByRole("status")).toHaveTextContent(/enregistré/i);

    // reset des champs
    expect(screen.getByTestId("lastName-input")).toHaveValue("");
    expect(screen.getByTestId("firstName-input")).toHaveValue("");
    expect(screen.getByTestId("email-input")).toHaveValue("");
    expect(screen.getByTestId("birthDate-input")).toHaveValue("");
    expect(screen.getByTestId("zip-input")).toHaveValue("");
    expect(screen.getByTestId("city-input")).toHaveValue("");
  });

  test("2) birthDate empty => shows 'Birth date is required'", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    await user.click(screen.getByTestId("birthDate-input"));
    await user.tab();

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent(
      "Birth date is required",
    );
  });

  test("3) birthDate invalid input on <input type=date> => treated as empty => shows 'Birth date is required'", async () => {
    const user = userEvent.setup();

    await renderWithPlugins();

    const input = screen.getByTestId("birthDate-input");

    await user.clear(input);
    await user.type(input, "not-a-date");
    await user.tab();

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent(
      "Birth date is required",
    );
    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();
    expect(store.userCount).toBe(0);
  });

  test("4) birthDate minor => shows 'Pegi 18' + button stays disabled", async () => {
    const user = userEvent.setup();

    await renderWithPlugins();

    await fillValidForm(user, { birthDate: "2015-01-01" });

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent("Pegi 18");

    const submitButton = screen.getByRole("button", { name: /envoyer/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("form-button--disabled");

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();
    expect(store.userCount).toBe(0);
  });

  test("5) identity with HTML tags => shows 'HTML tags are not allowed in identity'", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    await user.type(screen.getByTestId("firstName-input"), "<b>Bob</b>");
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.tab();

    const firstNameError = screen.getByTestId("error-firstName");
    expect(firstNameError).toBeVisible();
    expect(firstNameError).toHaveClass("error-message");
    expect(firstNameError).toHaveTextContent(
      "HTML tags are not allowed in identity",
    );
  });

  test("6) identity invalid format (digits) => shows 'Invalid identity format' and button disabled", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.type(screen.getByTestId("lastName-input"), "VALUN123");
    await user.tab();

    const lastNameError = screen.getByTestId("error-lastName");
    expect(lastNameError).toBeVisible();
    expect(lastNameError).toHaveTextContent("Invalid identity format");

    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  test("7) email: empty -> 'Email is required' then invalid -> 'Invalid email format' then valid -> error disappears", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    // vide + blur
    await user.click(screen.getByTestId("email-input"));
    await user.tab();
    expect(screen.getByTestId("error-email")).toHaveTextContent(
      "Email is required",
    );

    // invalide
    await user.type(screen.getByTestId("email-input"), "nope@");
    await user.tab();
    expect(screen.getByTestId("error-email")).toHaveTextContent(
      "Invalid email format",
    );

    // valide => l'erreur doit disparaître
    await user.clear(screen.getByTestId("email-input"));
    await user.type(screen.getByTestId("email-input"), "youen@test.com");
    await user.tab();

    expect(screen.queryByTestId("error-email")).toBeNull();
  });

  test("8) zip: empty -> 'Zip required' then letters -> 'Zip code wrong length' then 4 digits -> wrong length then 5 digits -> error disappears", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    // vide + blur
    await user.click(screen.getByTestId("zip-input"));
    await user.tab();
    expect(screen.getByTestId("error-zip")).toHaveTextContent("Zip required");

    // lettres
    await user.type(screen.getByTestId("zip-input"), "ABCDE");
    await user.tab();
    expect(screen.getByTestId("error-zip")).toHaveTextContent(
      "Zip code wrong length",
    );

    // 4 chiffres
    await user.clear(screen.getByTestId("zip-input"));
    await user.type(screen.getByTestId("zip-input"), "1234");
    await user.tab();
    expect(screen.getByTestId("error-zip")).toHaveTextContent(
      "Zip code wrong length",
    );

    // 5 chiffres => l'erreur doit disparaître
    await user.clear(screen.getByTestId("zip-input"));
    await user.type(screen.getByTestId("zip-input"), "12345");
    await user.tab();

    expect(screen.queryByTestId("error-zip")).toBeNull();
  });

  test("9) city empty => shows 'City is required' + button stays disabled", async () => {
    const user = userEvent.setup();
    await renderWithPlugins();

    await fillValidForm(user, { city: "" });
    await user.tab();

    const cityError = screen.getByTestId("error-city");
    expect(cityError).toBeVisible();
    expect(cityError).toHaveClass("error-message");
    expect(cityError).toHaveTextContent("City is required");

    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  test("10) invalid submit => does NOT write localStorage(users) and shows errors (markAllTouched)", async () => {
    const user = userEvent.setup();

    await renderWithPlugins();

    // Formulaire volontairement invalide
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.type(screen.getByTestId("email-input"), "nope@");

    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();
    expect(store.userCount).toBe(0);

    // erreurs visibles (au moins email)
    expect(screen.getByTestId("error-email")).toBeVisible();
  });

  test("11) duplicate email => shows 'Email déjà utilisé' + users unchanged", async () => {
    const user = userEvent.setup();

    await renderWithPlugins();

    // important: mock du post sinon addUser peut throw et ne rien ajouter
    axios.post.mockResolvedValue({ data: {} });

    const submitButton = screen.getByRole("button", { name: /envoyer/i });

    // 1) Crée un utilisateur valide
    await fillValidForm(user);
    await user.click(submitButton);

    const { useUsersStore } = await import("@/stores/users");
    const store = useUsersStore();

    expect(store.userCount).toBe(1);
    expect(store.users[0].email).toBe("youen@test.com");

    // 2) Ré-essaye avec le même email
    await fillValidForm(user, { email: "youen@test.com" });
    await user.click(submitButton);

    // 3) Message d'erreur affiché
    expect(screen.getByRole("alert")).toHaveTextContent("Email déjà utilisé");

    // 4) Users inchangé
    expect(store.userCount).toBe(1);
    expect(store.users[0].email).toBe("youen@test.com");
  });

  test("12) API 400 (métier) => affiche le message spécifique du back", async () => {
    const user = userEvent.setup();

    axios.post.mockRejectedValueOnce({
      response: { status: 400, data: { message: "Email déjà utilisé" } },
    });

    await renderWithPlugins();
    await fillValidForm(user, { email: "dup@test.com" });

    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email déjà utilisé",
    );
  });

  test("13) API 500 (serveur down) => l'app ne plante pas et affiche une alerte user-friendly", async () => {
    const user = userEvent.setup();

    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Internal Server Error" } },
    });

    await renderWithPlugins();
    await fillValidForm(user, { email: "boom@test.com" });

    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Serveur indisponible, réessaie plus tard",
    );
  });
});
