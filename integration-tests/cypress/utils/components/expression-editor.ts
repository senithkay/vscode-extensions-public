export class ExpressionEditor {

    private constructor(private fieldName: string, private parentSelector: string, private position: number) { }

    static getForField(fieldName: string, parentSelector: string = '', position: number = 0) {
        return new ExpressionEditor(fieldName, parentSelector, position);
    }

    private getEditor() {
        return cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] .view-lines`);
    }

    public clickEditor() {
        cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] .view-lines`)
            .click()
        return this;
    }

    private getEditorConditions() {
        return cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"]`);
    }

    private getForm() {
        return cy.get(`${this.parentSelector}`);
    }

    public type(text: string, clearSuggestions: boolean = true) {
        if (this.position == 0) {
            clearSuggestions ? this.getEditor().type("{esc}" + text) : this.getEditor().type(text); // Adding escpate first to close suggetions if any
        } else {
            this.getEditorConditions().children().get('.view-lines').eq(this.position - 1).type("{esc}" + text);
        }
        return this;
    }

    public suggestWidgetShouldBeVisible() {
        this.getEditorConditions()
            .get('.monaco-list-rows').children().should('have.length.at.least', 1);
        return this;

    }

    public clickFirstSuggestion() {
        this.suggestWidgetShouldBeVisible();
        this.getEditorConditions().get('.monaco-list-rows').children().first().click();
        return this;
    }

    public triggerSuggestions(force: boolean = false) {
        if (force) {
            cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] .view-lines`).type("{end}{ctrl} ");
        } else {
            cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] .view-lines`).click();
        }
        this.suggestWidgetShouldBeVisible();
        return this;
    }

    public pickSuggetionWithText(text: string, force: boolean = false) {
        this.triggerSuggestions(force).suggestWidgetShouldBeVisible();
        this.getEditorConditions().get('.monaco-list-rows').children().contains(text).click();
        return this;
    }

    public clear() {
        const clearKeyStroke = Cypress.platform == "darwin" ? "{selectall}{del}" : "{ctrl}a{del}";
        this.getEditor().type(clearKeyStroke);
        return this;
    }

    public clearSuggestions(clearSuggestions: boolean = true) {
        this.getEditor().parent().parent().parent().within(() => {
            cy.get('textarea').click();
        })
        clearSuggestions ? this.getEditor().type("{esc}") : null;
        return this;
    }

    public waitForValidations() {
        cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] [data-testid="expr-validating-loader"]`)
            .should("not.exist");
        return this;
    }

}
