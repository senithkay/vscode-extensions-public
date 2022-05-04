import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";

export class VariableFormBlockLevel {

    private static selector = '[data-testid="property-form"]';

    static typeVariableType(type: string) {
        ExpressionEditor
            .getForField("Variable Type", this.selector)
            .type(type)
            .waitForValidations();
        return this;
    }

    static typeVariableName(name: string) {
        ExpressionEditor
            .getForField("Variable Name", this.selector)
            .type(name)
            .waitForValidations();
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

    static toggleInitializeVariable() {
        this.getForm().get('.MuiSwitch-root')
            .click()
        return this;
    }

    static valueExpressionShouldBeHidden() {
        this.getForm().get('[field-name="Value Expression"]')
            .should("not.exist");
        return this;
    }

    static isInitializeVariable() {
        this.getForm().get('[type="checkbox"]')
            .should("have.attr", "checked")
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
            .get('.close-btn-wrap button')
            .click();
    }

    static waitForDiagramUpdate() {
        cy.wait(15000);
        cy.get(`[id="canvas-overlay"]`)
            .children().should("have.length", 0)
        cy.get(`[data-testid="diagram-loader"]`)
            .should("not.exist")
        return this;
    }

}
