import { ExpressionEditor } from "../components/expression-editor"

export class WorkerForm {

    private static selector = '[data-testid="worker-form"]';

    static typeWorkerName(value: any) {
        ExpressionEditor
            .getForField("Worker Name", this.selector)
            .type(value)
            .waitForValidations();
        return this;
    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;

    }

    private static getForm() {
        return cy
            .get(this.selector);

    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;

    }

    static cancel() {
        this.getForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }

    static close() {
        this.getForm()
            .get('.close-btn-wrap button')
            .click();
    }

    static waitForDiagramUpdate() {
        cy.wait(15000);
        cy.get(`[id="canvas-overlay"]`)
            .children().should("have.length", 0)
        cy.get(`[data-testid="diagram-loader"]`)
            .should("not.exist")
        return this;
    }
}
