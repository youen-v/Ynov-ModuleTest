import { faker } from "@faker-js/faker";

describe("Test registration user", () => {
  const APP = "http://localhost:5173/Ynov-ModuleTest/";
  const API = "http://localhost:8000/users";

  const makeUser = () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `test_${Date.now()}_${faker.string.alphanumeric(6)}@mail.com`,
    birthDate: "2000-01-01",
    zip: "29200",
    city: "Brest",
  });

  beforeEach(() => {
    cy.visit(APP);
  });

  it("Scénario nominal : créer un utilisateur valide puis le voir sur l'accueil", () => {
    const user = makeUser();
    const fullName = `${user.firstName} ${user.lastName}`;

    cy.contains("S'inscrire").click();
    cy.url().should("include", "/register");

    // Ajout user valide
    cy.get("#lastName").type(user.lastName);
    cy.get("#firstName").type(user.firstName);
    cy.get("#email").type(user.email);
    cy.get("#birthDate").type(user.birthDate);
    cy.get("#zip").type(user.zip);
    cy.get("#city").type(user.city);
    cy.get('button[type="submit"]').click();

    // Vérification le retour à l'accueil plutôt qu'un toast fragile
    cy.url().should("include", "/");
    cy.contains(fullName).should("be.visible");

    // Vérification côté API
    cy.request(API).then((response) => {
      expect(response.status).to.eq(200);

      const rows =
        response.body?.utilisateurs ??
        response.body?.users ??
        response.body ??
        [];

      const found = rows.find((u) => u.email === user.email);
      expect(found).to.exist;
    });
  });

  it("Scénario erreur : email déjà utilisé", () => {
    const user = makeUser();

    cy.request("POST", API, user).then((response) => {
      expect([200, 201]).to.include(response.status);
    });

    cy.visit(APP);

    cy.contains("S'inscrire").click();
    cy.url().should("include", "/register");

    cy.get("#lastName").type(user.lastName);
    cy.get("#firstName").type(user.firstName);
    cy.get("#email").type(user.email);
    cy.get("#birthDate").type(user.birthDate);
    cy.get("#zip").type(user.zip);
    cy.get("#city").type(user.city);
    cy.get('button[type="submit"]').click();

    cy.contains("Email déjà utilisé").should("be.visible");

    // Vérification que l'API contient bien un seul user avec cet email
    cy.request(API).then((response) => {
      expect(response.status).to.eq(200);

      const rows =
        response.body?.utilisateurs ??
        response.body?.users ??
        response.body ??
        [];

      const matches = rows.filter((u) => u.email === user.email);
      expect(matches.length).to.eq(1);
    });
  });
});
