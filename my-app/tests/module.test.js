import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import UserForm from "../src/views/UserForm.vue";

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
  test("1) user: invalid input -> errors red + button disabled/grey -> valid input -> localStorage + toast + reset", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(UserForm);

    const submitButton = screen.getByRole("button", { name: /envoyer/i });

    // sécurité UI
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveStyle({ opacity: "0.5" });

    // blur sur Nom => erreur visible et rouge
    await user.click(screen.getByTestId("lastName-input"));
    await user.tab();

    const lastNameError = screen.getByTestId("error-lastName");
    expect(lastNameError).toBeVisible();
    expect(lastNameError).toHaveStyle({ color: "red" });

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
    expect(submitButton).toHaveStyle({ opacity: "1" });

    // submit
    await user.click(submitButton);

    // localStorage rempli
    const raw = localStorage.getItem("userForm");
    expect(raw).not.toBeNull();
    const savedData = JSON.parse(raw);

    expect(savedData).toEqual({
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
    render(UserForm);

    await user.click(screen.getByTestId("birthDate-input"));
    await user.tab();

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent(
      "Birth date is required",
    );
  });

  test("3) birthDate minor => shows 'Pegi 18' + button stays disabled", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(UserForm);

    await fillValidForm(user, { birthDate: "2015-01-01" });

    expect(screen.getByTestId("error-birthDate")).toHaveTextContent("Pegi 18");

    const submitButton = screen.getByRole("button", { name: /envoyer/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveStyle({ opacity: "0.5" });

    expect(localStorage.getItem("userForm")).toBeNull();
  });

  test("4) identity with HTML tags => shows 'HTML tags are not allowed in identity'", async () => {
    const user = userEvent.setup();
    render(UserForm);

    await user.type(screen.getByTestId("firstName-input"), "<b>Bob</b>");
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.tab();

    const firstNameError = screen.getByTestId("error-firstName");
    expect(firstNameError).toBeVisible();
    expect(firstNameError).toHaveStyle({ color: "red" });
    expect(firstNameError).toHaveTextContent(
      "HTML tags are not allowed in identity",
    );
  });

  test("5) identity invalid format (digits) => shows 'Invalid identity format' and button disabled", async () => {
    const user = userEvent.setup();
    render(UserForm);

    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.type(screen.getByTestId("lastName-input"), "VALUN123");
    await user.tab();

    const lastNameError = screen.getByTestId("error-lastName");
    expect(lastNameError).toBeVisible();
    expect(lastNameError).toHaveTextContent("Invalid identity format");

    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  test("6) email: empty -> 'Email is required' then invalid -> 'Invalid email format' then valid -> error disappears", async () => {
    const user = userEvent.setup();
    render(UserForm);

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

  test("7) zip: empty -> 'Zip required' then letters -> 'Zip code wrong length' then 4 digits -> wrong length then 5 digits -> error disappears", async () => {
    const user = userEvent.setup();
    render(UserForm);

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

  test("8) city empty => shows 'City is required' + button stays disabled", async () => {
    const user = userEvent.setup();
    render(UserForm);

    await fillValidForm(user, { city: "" });
    await user.tab();

    const cityError = screen.getByTestId("error-city");
    expect(cityError).toBeVisible();
    expect(cityError).toHaveStyle({ color: "red" });
    expect(cityError).toHaveTextContent("City is required");

    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  test("9) invalid submit => does NOT write localStorage and shows errors (markAllTouched)", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    render(UserForm);

    // Formulaire volontairement invalide
    await user.type(screen.getByTestId("lastName-input"), "VALUN");
    await user.type(screen.getByTestId("firstName-input"), "Youen");
    await user.type(screen.getByTestId("email-input"), "nope@");

    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    // pas de localStorage
    expect(localStorage.getItem("userForm")).toBeNull();

    // erreurs visibles quelque part (au moins email)
    expect(screen.getByTestId("error-email")).toBeVisible();
  });
});
