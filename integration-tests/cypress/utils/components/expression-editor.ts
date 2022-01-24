export class ExpressionEditor {

    private constructor(private fieldName: string, private parentSelector: string) {}

    static getForField(fieldName: string, parentSelector: string = '') {
        return new ExpressionEditor(fieldName, parentSelector);
    }

    private getEditor() {
        return cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] .view-lines`);
    }

    public type(text: string) {
        this.getEditor().type("{esc}" +text); // Adding escpate first to close suggetions if any
        return this;
    }

    public clear() {
        const clearKeyStroke = Cypress.platform == "darwin" ? "{selectall}{del}{esc}" : "{ctrl}a{del}{esc}";
        this.getEditor().type(clearKeyStroke);
        return this;
    }

    public waitForValidations() {
        cy.get(`${this.parentSelector} .exp-container[field-name="${this.fieldName}"] [data-testid="expr-validating-loader"]`)
            .should("not.exist");
        return this;
    }

}
