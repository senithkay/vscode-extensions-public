import { ExpressionEditor } from "../components/expression-editor"
import { SelectDropDown } from "../components/select-drop-down";

export class LogForm {

    private static selector = '[data-testid="log-form"]';

    static typeExpression(expression: string) {
        ExpressionEditor
            .getForField("expression", this.selector)
            .type(expression)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    static selectType(type: "Info" | "Debug" | "Warn" | "Error") {
        SelectDropDown
            .getForField("Type", this.selector)
            .select(type);
        return this;
    }

    static diagnosticsShouldBeVisible() {
        this.getForm().get('[data-testid="expr-diagnostics"]').should("be.visible");
        return this;
    }

    static clickDiagnosticsSupportButton() {
        this.getForm().get('a').contains("Click here").click().wait(1000);
        ExpressionEditor
            .getForField("expression", this.selector)
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
