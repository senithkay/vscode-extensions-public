export class FunctionDiagram {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {}

    public shouldBeRenderedProperly() {
        this.container.within(() => {
            cy.get('.diagram-canvas .start-wrapper .start-button .start-text')
            .should("be.visible")
            .should("have.text", " START  ");
        })
        return this;
    }

}
