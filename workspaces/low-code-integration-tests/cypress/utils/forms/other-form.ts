import { ExpressionEditor } from "../components/expression-editor"

export class OtherForm {

    private static selector = '[data-testid="custom-expression-form"]';


    static typeStatement(value: any, clearSuggestions: boolean = true) {
        ExpressionEditor
            .getForField("statement", this.selector)
            .type(value, false)
            .waitForValidations()
            .clearSuggestions(clearSuggestions);
        return this;
    }

    static clearStatement() {
        ExpressionEditor
            .getForField("statement", this.selector)
            .clear();
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
