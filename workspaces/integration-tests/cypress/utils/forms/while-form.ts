import { ExpressionEditor } from "../components/expression-editor"

export class WhileForm {

    private static selector = '[data-testid="while-form"]';

    static typeCondition(value: any) {
        ExpressionEditor
            .getForField("Condition", this.selector)
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



}
