import { faker } from "@faker-js/faker";

describe("Registration Process", () => {
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    birthDate: "2000-01-01",
    zip: "29200",
    city: "Brest",
  };

  let createdUser = null;

  beforeEach(() => {
    cy.visit("http://localhost:5173/Ynov-ModuleTest/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
        if (createdUser) {
          win.localStorage.setItem("users", JSON.stringify([createdUser]));
        }
      },
    });
  });

  it("Scénario Nominal: create a valid user, then verify on home", () => {
    // Accueil 0 utilisateur
    cy.contains("0 utilisateur(s) inscrit(s)").should("be.visible");
    cy.contains("Aucun utilisateur inscrit.").should("be.visible");

    // Formulaire
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

    // Succès
    cy.contains("Enregistré").should("be.visible");

    // Redirection / retour home
    cy.wait(2100);
    cy.url().should("include", "/Ynov-ModuleTest/");

    // Vérifie 1 utilisateur + présence dans la liste
    cy.contains("1 utilisateur(s) inscrit(s)").should("be.visible");
    cy.contains(`${user.firstName} ${user.lastName}`).should("be.visible");

    // On capture l'utilisateur
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem("users")) || [];
      expect(users).to.have.lengthOf(1);
      createdUser = users[0];
    });
  });

  it("Scénario d'Erreur: with 1 existing user, try duplicate email, verify unchanged", () => {
    // Accueil doit déjà avoir 1 user
    cy.contains("1 utilisateur(s) inscrit(s)").should("be.visible");
    cy.contains(`${createdUser.firstName} ${createdUser.lastName}`).should(
      "be.visible",
    );

    // Formulaire
    cy.contains("S'inscrire").click();
    cy.url().should("include", "/register");

    // Tentative invalide : email déjà pris
    cy.get("#lastName").type(faker.person.lastName());
    cy.get("#firstName").type(faker.person.firstName());
    cy.get("#email").type(createdUser.email); // email déjà utilisé
    cy.get("#birthDate").type("2000-01-01");
    cy.get("#zip").type("29200");
    cy.get("#city").type("Brest");
    cy.get('button[type="submit"]').click();

    // Vérifie l'erreur
    cy.contains("Email déjà utilisé").should("be.visible");

    // Retour home
    cy.visit("http://localhost:5173/Ynov-ModuleTest/");

    // Toujours 1 utilisateur + liste inchangée
    cy.contains("1 utilisateur(s) inscrit(s)").should("be.visible");
    cy.contains(`${createdUser.firstName} ${createdUser.lastName}`).should(
      "be.visible",
    );

    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem("users")) || [];
      expect(users).to.have.lengthOf(1);
      expect(users[0].email).to.equal(createdUser.email);
    });
  });
});
