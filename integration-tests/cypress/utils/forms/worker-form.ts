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

    static waitForValidName() {
        this.getForm().get("be.visible");
        return this;

    }

    private static getForm() {
        return cy
            .get(this.selector);

    }

    static save() {
        this.getForm().within(() => {
            cy.get('[data-testid="save-btn"]').click();
        });

    }

    static checkForDiagnostics() {
        this.getForm()
            .get('[data-testid="expr-diagnostics"]')
            .should('not.exist', { timeout: 50000 })
        return this;
    }

    static saveShouldBeEnabled() {
        this.getForm()
            .contains("Save")
            .should('be.enabled', { timeout: 10000 })
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
        cy.get(`[id="canvas-overlay"]`, { timeout: 50000 })
            .children().should("have.length", 0)
        cy.get(`[data-testid="diagram-loader"]`)
            .should("not.exist")
        return this;
    }
}
