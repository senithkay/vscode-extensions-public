export class InputEditor {
    static getInputEditor() {
        return cy.get(`[data-testid="input-editor"]`);
    }

    static typeInput(text: string) {
        this.getInputEditor()
            .focus()
            .clear()
            .type(text);

        cy.wait(500)

        this.getInputEditor()
            .type('{enter}');
        return this;
    }
}
