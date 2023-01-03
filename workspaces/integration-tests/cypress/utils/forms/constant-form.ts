import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";

export class ConstantForm {

    private static selector = '[data-testid="module-variable-config-form"]';


    static togglePublickAccessModifier() {
        this.getForm().get('[name="public"]').parent()
            .click()
        return this;
    }

    static isAccessModifierChecked(value: "public") {
        this.getForm().get('[name="public"]')
            .should("have.value", value)
        return this;
    }

    static typeConstantName(name: string) {
        ExpressionEditor
            .getForField("Constant Name", this.selector)
            .type(name)
            .waitForValidations();
        return this;
    }

    static toggleTypeDeclaration() {
        this.getForm().contains('Include type in declaration').parent()
            .click()
        return this;
    }

    static typeDeclareShouldBeVisible() {
        this.getForm().get('[data-testid="select-drop-down"]').should("be.visible");
        return this;
    }

    static selectType(type: "int" | "float" | "byte" | "boolean" | "string") {
        SelectDropDown
            .getForField("Select type", this.selector)
            .select(type);
        return this;
    }

    static typeLabalShouldBeVisible(type: "int" | "float" | "byte" | "boolean" | "string") {
        this.getForm().get('[data-lang="ballerina"]').should("contain", type);
        return this;
    }

    static typeVariableValue(value: any) {
        ExpressionEditor
            .getForField("Value Expression", this.selector)
            .type(value)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    private static getForm() {
        return cy
            .get(this.selector);

    }

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;

    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;

    }


}
