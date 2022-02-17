import { ExpressionEditor } from "../components/expression-editor"

export class FunctionForm {

    private static selector = '[data-testid="function-form"]';

    static typeFunctionName(fnName: string) {
        ExpressionEditor
            .getForField("Function Name", this.selector)
            .clear()
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

    static cancel() {
        this.getForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;

    }

    static close() {
        this.getForm()
            .get('.panel-close-button')
            .click();
        return this;

    }

    static addParameter(type: string, name: string) {
        this.getForm()
            .get('button')
            .contains("Add parameter")
            .click();
        FunctionForm.fillParameterForm(type, name);
        this.getForm()
            .get('button')
            .contains("Add")
            .click();

        return this;

    }

    static updateParameter(parameter: string, type: string, name: string) {
        this.getForm()
            .contains(parameter)
            .parent()
            .click();
        FunctionForm.fillParameterForm(type, name);
        this.getForm()
            .get('button')
            .contains("Update")
            .click();

        return this;

    }

    private static fillParameterForm(type: string, name: string) {
        ExpressionEditor
            .getForField("Param Type", this.selector)
            .clear()
            .type(type)
            .waitForValidations();
        cy.get(`.MuiFormControl-root[data-testid="api-function-param-name"] .MuiInput-input`)
            .clear()
            .type(name);

        return this;
    }

    static removeParameter(name: string) {
        this.getForm()
            .contains(name)
            .parent()
            .children('button')
            .click();
        return this;
    }
}
