export class Other {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public edit() {
        cy.get('#Edit-Button')
            .click({ force: true });
    }

    public delete() {
        cy.get('#Delete')
            .click({ force: true });
    }
}