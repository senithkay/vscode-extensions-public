export class Toolbar {
    static clickUndoButton() {
        cy.wait(500)
        cy.get(`[data-testid="toolbar-undo"]`)
            .click()
        return this;
    }

    static clickRedoButton() {
        cy.wait(500)
        cy.get(`[data-testid="toolbar-redo"]`)
            .click()
        return this;
    }

    static clickDeleteButton() {
        cy.wait(500)
        cy.get(`[data-testid="toolbar-delete"]`)
            .click()
        return this;
    }
}
