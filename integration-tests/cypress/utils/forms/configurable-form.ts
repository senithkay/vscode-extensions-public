import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";

export class ConfigurableForm {

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

    static typeConfigurableType(type: string) {
        ExpressionEditor
            .getForField("Variable Type", this.selector)
            .clear()
            .type(type)
            .waitForValidations();
        return this;
    }

    static typeConfigurableName(name: string) {
        ExpressionEditor
            .getForField("Configurable Name", this.selector)
            .type(name)
            .waitForValidations();
        return this;
    }

    static toggleDefaultValue() {
        this.getForm().contains('Include Default Value').parent()
            .click()
        return this;
    }

    static typeLabalShouldBeVisible(type: string) {
        this.getForm().get('[data-lang="ballerina"]').should("contain", type);
        return this;
    }

    static typeVariableValueShouldBeVisible() {
        this.getForm().get('[field-name="Value Expression"]').should("be.visible");
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
