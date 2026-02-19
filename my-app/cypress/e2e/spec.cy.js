describe("Home page", () => {
  it("deploy app", () => {
    cy.visit("http://localhost:5173");
    cy.contains("Nom");
  });
});
