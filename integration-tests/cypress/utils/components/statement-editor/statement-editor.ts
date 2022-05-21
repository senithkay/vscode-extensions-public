import { EditorPane } from "./editor-pane";

export class StatementEditor {

    private static selector = '[data-testid="statement-editor"]';

    static shouldBeVisible() {
        this.getStatementEditor().should("be.visible");
        return this;

    }

    private static getStatementEditor() {
        return cy.get(this.selector);
    }

    static getEditorPane() {
        return new EditorPane();
    }

    static save() {
        cy.wait(500)
        this.getStatementEditor()
            .get('button')
            .contains("Save")
            .click();
        return this;

    }

    static saveDisabled() {
        cy.wait(500)
        this.getStatementEditor()
            .get('button')
            .get(`[data-testid="save-btn"]`)
            .should('have.class', 'Mui-disabled');
        return this;
    }

    static cancel() {
        this.getStatementEditor()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }

    static close() {
        this.getStatementEditor()
            .get('button')
            .get(`[data-testid="close-btn"]`)
            .click();
        return this;
    }
}
