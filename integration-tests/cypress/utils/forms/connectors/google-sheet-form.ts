import { ExpressionEditor } from "../../components/expression-editor"
import { SelectDropDown } from "../../components/select-drop-down";
import { methods } from "../../type-utils";

export class GoogleSheetForm {

    private static selector = '[data-testid="connector-form"]';

    static typeConnectionName(name: string) {
        const clearKeyStroke = "{selectall}{del}";
        this.getForm().get('[placeholder="Enter endpoint name"]')
            .type(clearKeyStroke)
            .type(name);
        return this;
    }

    static typeToken(token: string) {
        ExpressionEditor
            .getForField("token", this.selector)
            .type(token)
            .waitForValidations();
        return this;
    }

    static selectOperation(type: "addSheet") {
        this.getForm().get('[placeholder="Search operation"]')
            .type(type)
            .get('li')
            .contains(type, { matchCase: false })
            .click();
        return this;
    }

    static haveDefaultName() {
        this.getForm().get('[placeholder="Enter endpoint name"]')
            .should("have.value", "sheetsEndpoint")
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

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;
    }


    /**
     * Opetaion fillings
     */

    //addSheet
    static addSheetFill(id: string, sheetName: string) {
        ExpressionEditor
            .getForField("spreadsheetId", this.selector)
            .type(`"${id}"`)
            .clearSuggestions()
            .waitForValidations();
        ExpressionEditor
            .getForField("sheetName", this.selector)
            .type(`"${sheetName}"`)
            .clearSuggestions()
            .waitForValidations();
        return this;
    }

}
