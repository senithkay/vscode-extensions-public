import { ExpressionEditor } from "../components/expression-editor"

export class AssignmentForm {

    private static selector = '[data-testid="property-form"]';


    static typeVariableName(name: string) {
        ExpressionEditor
            .getForField("Variable Name", this.selector)
            .type(name)
            .waitForValidations();
        return this;
    }

    static selectVariableSuggestion(name: string) {
        ExpressionEditor
            .getForField("Variable Name", this.selector)
            .pickSuggetionWithText(name)
            .waitForValidations();
        return this;
    }

    static typeVariableValue(value: any) {
        ExpressionEditor
            .getForField("Value Expression", this.selector)
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
