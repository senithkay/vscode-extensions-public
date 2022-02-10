import { ExpressionEditor } from "../components/expression-editor"

export class ReturnForm {

    private static selector = '[data-testid="return-form"]';


    static typeExpression(value: any) {
        ExpressionEditor
            .getForField("return expression", this.selector)
            .type(value)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    static clearExpression() {
        ExpressionEditor
            .getForField("return expression", this.selector)
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
