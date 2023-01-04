export class Class {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public edit() {
        cy.get('#edit-button')
            .click({ force: true });
    }

    public delete() {
        cy.get('#delete-button')
            .click({ force: true });
    }
}
