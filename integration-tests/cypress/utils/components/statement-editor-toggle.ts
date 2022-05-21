export class StatementEditorToggle {

    static clickStatementEditorToggle() {
        return cy.get('[data-testid="statement-editor-toggle"]')
            .click({ force: true });
    }

}
