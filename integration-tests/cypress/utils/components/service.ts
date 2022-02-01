import { ResourceFunction } from "./resource-function";
import { methods } from "../type-utils";

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

    public shouldHaveResources(count: number) {
        this.container.within(() => {
            cy.get('.service-member')
                .should("have.length", count);
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

    public expandToggle() {
        this.container.within(() => {
            cy.get('.service-header .component-expand-icon-container')
                .click({ force: true });
        })
        return this;
    }

    public getResourceFunction(method: methods, path: string): ResourceFunction {
        const diagram = this.container.get(`.function-box .${method.toLowerCase()}`)
            .contains(path).parent().parent().parent().parent();
        return new ResourceFunction(diagram);
    }

}
