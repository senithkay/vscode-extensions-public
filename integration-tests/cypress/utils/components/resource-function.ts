import { FunctionDiagram } from "./diagram";

export class ResourceFunction {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
    }

    public showMenu() {
        this.container.within(() => {
            cy.get(".header-amendment-options [id=menu-button]")
                .click({force: true});
        });
    }

    public editResource() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu-resource .menu-option [id=edit-button]")
                .click();
        });
    }

    public deleteResource() {
        this.showMenu();
        this.container.within(() => {
            cy.get(".rectangle-menu-resource .menu-option [id=delete-button]")
                .click();
        });
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
        this.container.should("have.class", "expanded");
        return this;
    }

    public expand() {
        this.container.within(() => {
            cy.get('.component-expand-icon-container')
                .click();
        })
        return this;
    }
    
    public editDiagram() {
        this.container.within(() => {
            cy.get('#edit-button')
                .click();
        })
        return this;
    }


    public getDiagram(): FunctionDiagram {
        return new FunctionDiagram(this.container);
    }

}
