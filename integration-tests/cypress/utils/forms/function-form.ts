import { ExpressionEditor } from "../components/expression-editor"

export class FunctionForm {

    private static selector = '[data-testid="function-form"]';

    static typeFunctionName(fnName: string) {
        ExpressionEditor
            .getForField("Function Name", this.selector)
            .type(fnName)
            .waitForValidations();
        return this;
    }

    static typeReturnType(retType: string) {
        ExpressionEditor
            .getForField("Return Type", this.selector)
            .clear()
            .type(retType)
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


}
