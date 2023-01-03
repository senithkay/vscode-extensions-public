import { ResourceFunction } from "./resource-function";
import { methods } from "../type-utils";

export class Service {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public showMenu() {
        this.container.within(() => {
            cy.get(".service-header .header-amendment-options [id=menu-button]")
                .click();
        });
    }

    public clickRun() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu .menu-option [id=run-button]")
                .click({ force: true });
        });
        return this;
    }

    public clickTryIt() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu .menu-option [id=try-button]")
                .click({ force: true });
        });
        return this;
    }


    public clickEdit() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu .menu-option [id=edit-button]")
                .click({ force: true });
        });
    }

    public clickDelete() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu .menu-option [id=delete-button]")
                .click({ force: true });
        });
    }

    public clickPlusIcon(targetLine: number = 0) {
        this.container.within(() => {
            cy.get(`.plus-container[target-line="${targetLine}"]`)
                .click();
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
