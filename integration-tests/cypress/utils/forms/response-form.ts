import { ExpressionEditor } from "../components/expression-editor"

export class ResponseForm {

    private static selector = '[data-testid="respond-form"]';


    static typeExpression(value: any) {
        ExpressionEditor
            .getForField("respond expression", this.selector)
            .clear()
            .type(value)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    static typeStatusCode(value: any) {
        ExpressionEditor
            .getForField("Status Code", this.selector)
            .clear()
            .type(value)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    static clearExpression() {
        ExpressionEditor
            .getForField("respond expression", this.selector)
            .clear();
        return this;
    }

    static clearStatusCode() {
        ExpressionEditor
            .getForField("Status Code", this.selector)
            .clear();
        return this;
    }

    static checkForDiagnostics() {
        this.getForm()
            .get('[data-testid="expr-diagnostics"]')
            .should("be.visible")
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
}
