import { ExpressionEditor } from "../components/expression-editor"

export class FunctionForm {

    private static selector = '[data-testid="function-form"]';

    static typeFunctionName(fnName: string) {
        const typeInput = `{selectall}${fnName}`;
        this.getForm()
            .get('[data-testid="function-name"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static typeReturnType(retType: string) {
        const typeInput = `{selectall}${retType}`;
        this.getForm()
            .get('[data-testid="return-type"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static typeParamType(type: string) {
        const typeInput = `{selectall}${type}`;
        this.getForm()
            .get('[data-testid="function-param-type"]')
            .type(typeInput);
        this.getForm().wait(1000);
        return this;
    }

    static typeParamName(name: string) {
        const clearKeyStroke = `{selectall}${name}`;
        this.getForm()
            .get('[data-testid="function-param-name"]')
            .type(clearKeyStroke);
        this.getForm().wait(1000);
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
            .contains("Save")
            .should('be.enabled', { timeout: 5000 })
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
            .get('[data-testid="param-save-btn"]')
            .click();

        return this;

    }

    static updateParameter(parameter: string, type: string, name: string) {
        this.getForm()
            .contains(parameter)
            .parent()
            .click();
        FunctionForm.updateParameterForm(type, name);
        this.getForm()
            .get('button')
            .contains("Update")
            .click();

        return this;

    }

    private static fillParameterForm(type: string, name: string) {
        FunctionForm.typeParamType(type);
        FunctionForm.typeParamName(name);

        return this;
    }

    private static updateParameterForm(type: string, name: string) {
        FunctionForm.typeParamType(type);
        FunctionForm.typeParamName(name);
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
