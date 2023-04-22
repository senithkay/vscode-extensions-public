import { ExpressionEditor } from "../components/expression-editor"
import { StatementEditorToggle } from "../components/statement-editor-toggle";

export class ForEachForm {

    private static selector = '[data-testid="foreach-form"]';


    static typeArrayType(value: any) {
        ExpressionEditor
            .getForField("Variable Type", this.selector)
            .clear()
            .type(value)
            .waitForValidations();
        return this;
    }
    
    static typeCurrentValue(name: string) {
        const clearKeyStroke = Cypress.platform == "darwin" ? "{selectall}{del}{esc}" : "{ctrl}a{del}{esc}";
        this.getForm().get('[placeholder="Current Value"]')
        .type(clearKeyStroke)
        .type(name);
        return this;
    }
    
    static haveDefaultValueName() {
        this.getForm().get('[placeholder="Current Value"]')
        .should("have.value", "item")
        return this;
    }
    
    static typeIterableExpression(value: any) {
        ExpressionEditor
            .getForField("Iterable Expression", this.selector)
            .type(value)
            .waitForValidations()
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

    static toggleStatementEditor() {
        StatementEditorToggle
            .clickStatementEditorToggle()
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
