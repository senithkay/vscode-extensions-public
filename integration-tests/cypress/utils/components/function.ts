import { contains } from "cypress/types/jquery";
import { FunctionDiagram } from "./diagram";

export class Function {

    private diagramCanvas: Cypress.Chainable<JQuery<HTMLElement>>;
    private functionSignature: Cypress.Chainable<JQuery<HTMLElement>>;


    public constructor(private container: Cypress.Chainable<JQuery<HTMLElement>>) {
        container.within(() => {
            this.functionSignature = cy.get(`.function-signature`).should("exist");
        })
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

    public getDiagram() {
        return this.diagramCanvas;
    }

}
