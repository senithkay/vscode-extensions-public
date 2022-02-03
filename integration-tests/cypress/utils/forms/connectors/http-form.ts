import { ExpressionEditor } from "../../components/expression-editor"
import { SelectDropDown } from "../../components/select-drop-down";
import { methods } from "../../type-utils";

export class HttpForm {

    private static selector = '[data-testid="connector-form"]';

    static typeConnectionName(name: string) {
        const clearKeyStroke = Cypress.platform == "darwin" ? "{selectall}{del}{esc}" : "{ctrl}a{del}{esc}";
        this.getForm().get('[placeholder="Enter connection name"]')
            .type(clearKeyStroke)
            .type(name);
        return this;
    }

    static typeUrl(url: string) {
        ExpressionEditor
            .getForField("url", this.selector)
            .type(url)
            .waitForValidations();
        return this;
    }

    static selectOperation(type: methods) {
        this.getForm().get('[placeholder="Search Operation"]')
            .type(type)
            .get('li')
            .contains(type, { matchCase: false })
            .click();
        return this;
    }

    static typeOperationPath(path: string) {
        ExpressionEditor
            .getForField("path", this.selector)
            .type(path)
            .waitForValidations();
        return this;
    }

    static haveDefaultName() {
        this.getForm().get('[placeholder="Enter connection name"]')
            .should("have.value", "httpEndpoint")
        return this;
    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;
    }

    static waitForConnectorLoad() {
        this.getForm().get('.TextVerticalPreloader-wrapper-relative')
            .should("not.exist");
        return this;
    }

    private static getForm() {
        return cy
            .get(this.selector);

    }

    static saveConnection() {
        this.getForm()
            .get('button')
            .contains("Save Connection")
            .click();
        return this;

    }

    static continueToInvoke() {
        this.getForm()
            .get('button')
            .contains("Continue to Invoke API")
            .click();
        return this;
    }

    static saveAndDone() {
        this.getForm()
            .get('button')
            .contains("Save & Done")
            .click();
        return this;
    }


}
