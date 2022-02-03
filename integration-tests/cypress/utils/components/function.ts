import { FunctionDiagram } from "./diagram";

export class Function {

    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
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
            .click({ force: true });
        })
        return this;
    }


    public getDiagram(): FunctionDiagram {
       return new FunctionDiagram(this.container);
    }

}
