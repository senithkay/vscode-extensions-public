import { ExpressionEditor } from "../components/expression-editor"

export class ReturnForm {

    private static selector = '[data-testid="return-form"]';


    static typeExpression(value: any) {
        ExpressionEditor
            .getForField("return expression", this.selector)
            .clear()
            .type(value)
            .waitForValidations()
            .clearSuggestions();
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


}
