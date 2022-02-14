import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";
import { methods } from "../type-utils";

export class ResourceForm {

    private static selector = '[data-testid="resource-form"]';

    static typePathName(pathName: string) {
        ExpressionEditor
            .getForField("Resource path", this.selector)
            .type(pathName)
            .waitForValidations();
        return this;
    }

    static selectMethod(type: methods) {
        SelectDropDown
            .getForField("HTTP Method", this.selector)
            .select(type);
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
