import { render, screen, fireEvent } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import UserForm from "../src/views/UserForm.vue";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { useUsersStore } from "@/stores/users"; // en haut du test file

test("store getters: userCount + getError", async () => {
  localStorage.clear();

  await renderWithPlugins();

  const store = useUsersStore();

  expect(store.userCount).toBe(0);
  expect(store.getError).toBeNull();

  // ajoute un user
  store.addUser({
    firstName: "A",
    lastName: "B",
    email: "a@b.com",
    birthDate: "1998-05-05",
    zip: "92000",
    city: "Paris",
  });

  expect(store.userCount).toBe(1);
  expect(store.getError).toBeNull();

  // force l'erreur via doublon
  expect(() =>
    store.addUser({
      firstName: "C",
      lastName: "D",
      email: "a@b.com",
      birthDate: "1998-05-05",
      zip: "92000",
      city: "Paris",
    }),
  ).toThrow("Email déjà utilisé");

  expect(store.getError).toBe("Email déjà utilisé");
});

test("store action: clearError()", async () => {
  localStorage.clear();
  await renderWithPlugins();

  const store = useUsersStore();

  // crée une erreur
  store.addUser({
    firstName: "A",
    lastName: "B",
    email: "a@b.com",
    birthDate: "1998-05-05",
    zip: "92000",
    city: "Paris",
  });

  try {
    store.addUser({
      firstName: "C",
      lastName: "D",
      email: "a@b.com",
      birthDate: "1998-05-05",
      zip: "92000",
      city: "Paris",
    });
  } catch {}

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
    localStorage.clear();

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

    // localStorage rempli (users)
    const raw = localStorage.getItem("users");
    expect(raw).not.toBeNull();

    const savedUsers = JSON.parse(raw);
    expect(savedUsers).toHaveLength(1);
    expect(savedUsers[0]).toEqual({
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
    localStorage.clear();

    await renderWithPlugins();

    const input = screen.getByTestId("birthDate-input");

    await user.clear(input);
    await user.type(input, "not-a-date");
    await user.tab();

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent(
      "Birth date is required",
    );
    expect(localStorage.getItem("users")).toBeNull();
  });

  test("4) birthDate minor => shows 'Pegi 18' + button stays disabled", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    await renderWithPlugins();

    await fillValidForm(user, { birthDate: "2015-01-01" });

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent("Pegi 18");

    const submitButton = screen.getByRole("button", { name: /envoyer/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("form-button--disabled");

    expect(localStorage.getItem("users")).toBeNull();
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
    localStorage.clear();

    await renderWithPlugins();

    // Formulaire volontairement invalide
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.type(screen.getByTestId("email-input"), "nope@");

    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    // pas de localStorage (users)
    expect(localStorage.getItem("users")).toBeNull();

    // erreurs visibles (au moins email)
    expect(screen.getByTestId("error-email")).toBeVisible();
  });

  test("11) duplicate email => shows 'Email déjà utilisé' + users unchanged", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    await renderWithPlugins();

    const submitButton = screen.getByRole("button", { name: /envoyer/i });

    // 1) Crée un utilisateur valide
    await fillValidForm(user);
    await user.click(submitButton);

    const firstRaw = localStorage.getItem("users");
    expect(firstRaw).not.toBeNull();
    const firstUsers = JSON.parse(firstRaw);
    expect(firstUsers).toHaveLength(1);

    // 2) Ré-essaye avec le même email
    await fillValidForm(user, { email: "youen@test.com" });
    await user.click(submitButton);

    // 3) Message d'erreur affiché (serverError)
    // (le <p v-if="serverError" role="alert"> existe)
    expect(screen.getByRole("alert")).toHaveTextContent("Email déjà utilisé");

    // 4) Users inchangé
    const secondRaw = localStorage.getItem("users");
    const secondUsers = JSON.parse(secondRaw);
    expect(secondUsers).toHaveLength(1);
    expect(secondUsers[0].email).toBe("youen@test.com");
  });
});
