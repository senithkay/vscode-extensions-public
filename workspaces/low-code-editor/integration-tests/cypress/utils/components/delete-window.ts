export class DeleteWindow {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    static shouldBeVisible() {
        cy.get(".delete-container").should("be.visible");
        return this;
    }

    static clickNo() {
        cy.get(".delete-container").get(".cancelbtn").click();
        return this;
    }

    static clickRemove() {
        cy.get(".delete-container").get(".deletebtn").click();
        return this;
    }
}
