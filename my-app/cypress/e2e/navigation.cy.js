import { faker } from "@faker-js/faker";

describe("Registration Process", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/Ynov-ModuleTest/");
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  // Données pour un nouvel utilisateur
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    birthDate: "2000-01-01",
    zip: faker.location.zipCode(),
    city: faker.location.city(),
  };

  it("should register a new user and verify registration", () => {
    // 1. Vérifie qu'on est sur la page d'accueil et qu'il n'y a aucun utilisateur inscrit
    cy.contains("Aucun utilisateur inscrit").should("be.visible");

    // 2. Navigation vers la page de formulaire d'inscription
    cy.contains("S'inscrire").click();
    cy.url().should("include", "/register");

    // 3. Remplit le formulaire avec des données fictives
    cy.get("#lastName").type(user.lastName);
    cy.get("#firstName").type(user.firstName);
    cy.get("#email").type(user.email);
    cy.get("#birthDate").type(user.birthDate);
    cy.get("#zip").type(user.zip);
    cy.get("#city").type(user.city);
    cy.get('button[type="submit"]').click();

    // 4. Vérifie que le message de succès est affiché
    cy.contains("Enregistré").should("be.visible");

    // 5. Retour à la page d'accueil et vérifie que l'utilisateur est inscrit
    cy.visit("/Ynov-ModuleTest/");
    cy.contains("1 utilisateur inscrit").should("be.visible");
    cy.contains(user.firstName + " " + user.lastName).should("be.visible");
  });

  // Données pour un utilisateur déjà inscrit (simulé)
  const existingUser = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
  };

  // Données pour un nouvel utilisateur avec le même email que l'utilisateur existant
  const duplicateUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: existingUser.email, // Même email que l'utilisateur existant
    birthDate: "2000-01-01",
    zip: faker.location.zipCode(),
    city: faker.location.city(),
  };

  it("should fail to register a new user with an existing email and verify no new user is added", () => {
    // 1. Vérifie qu'on est sur la page d'accueil et qu'il y a 1 utilisateur inscrit
    cy.contains("1 utilisateur inscrit").should("be.visible");

    // 2. Navigation vers la page de formulaire d'inscription
    cy.contains("S'inscrire").click();
    cy.url().should("include", "/register");

    // 3. Remplit le formulaire avec un email déjà utilisé
    cy.get("#lastName").type(duplicateUser.lastName);
    cy.get("#firstName").type(duplicateUser.firstName);
    cy.get("#email").type(duplicateUser.email);
    cy.get("#birthDate").type(duplicateUser.birthDate);
    cy.get("#zip").type(duplicateUser.zip);
    cy.get("#city").type(duplicateUser.city);
    cy.get('button[type="submit"]').click();

    // 4. Vérifie qu'une erreur est affichée
    cy.contains("Email déjà utilisé").should("be.visible");

    // 5. Retour à la page d'accueil et vérifie que le nombre d'utilisateurs n'a pas changé
    cy.visit("/Ynov-ModuleTest/");
    cy.contains("1 utilisateur(s) inscrit(s)").should("be.visible");
    cy.contains(duplicateUser.firstName + " " + duplicateUser.lastName).should(
      "not.exist",
    );
  });
});
