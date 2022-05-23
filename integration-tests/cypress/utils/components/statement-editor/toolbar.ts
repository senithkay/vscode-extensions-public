export class Toolbar {
    static clickUndoButton() {
        cy.get(`[data-testid="toolbar-undo"]`)
            .click()
        return this;
    }

    static clickRedoButton() {
        cy.get(`[data-testid="toolbar-redo"]`)
            .click()
        return this;
    }

    static clickDeleteButton() {
        cy.get(`[data-testid="toolbar-delete"]`)
            .click()
        return this;
    }
}
