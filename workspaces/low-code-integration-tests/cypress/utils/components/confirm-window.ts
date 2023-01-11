export class ConfirmWindow {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    static shouldBeVisible() {
        cy.get(".confirm-container").should("be.visible");
        return this;
    }

    static clickNo() {
        cy.get(".confirm-container").get(".cancelbtn").click();
        return this;
    }

    static clickYes() {
        cy.get(".confirm-container").get(".confirmbtn").click();
        return this;
    }
}
