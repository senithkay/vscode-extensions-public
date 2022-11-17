import { ExpressionEditor } from "../components/expression-editor"

export class IfForm {

    private static selector = '[data-testid="if-form"]';


    static typeCondition(value: any, position: number) {
        ExpressionEditor
            .getForField("Condition", this.selector, position)
            .type(value)
            .waitForValidations();
        return this;
    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;

    }

    static clickAddExpression() {
        this.getForm().get('[data-testid="plus-button"]').first().click();
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
