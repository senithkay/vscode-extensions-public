import { FunctionDiagram } from "./diagram";

export class Service {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public clickRun() {
        this.container.within(() => {
            cy.get('.action-container')
            .contains("Run")
            .should("have.text", "Run")
            .click({ force: true });
        });
        return this;
    }

    public clickTryIt() {
        this.container.within(() => {
            cy.get('.action-container')
            .contains("Try it")
            .should("have.text", "Try it")
            .click({ force: true });
        });
        return this;
    }

    public nameShouldBe(fnName: string) {
        this.container.within(() => {
            cy.get('.param-wrapper .param-container .path-text')
                .first()
                .should("have.text", fnName);
        });
        return this;
    }

    public shouldBeExpanded() {
        this.container.get('.content-container').children().should('have.length.at.least', 1);
        return this;
    }

    public shouldBeHidden() {
        this.container.get('.content-container').children().should('have.length', 0);
        return this;
    }

    //.component-expand-icon-container
    public expandToggle() {
        this.container.within(() => {
            cy.get('.service-header .component-expand-icon-container')
            .click({ force: true });
        })
        return this;
    }


    public getDiagram(): FunctionDiagram {
       return new FunctionDiagram(this.container);
    }

}
