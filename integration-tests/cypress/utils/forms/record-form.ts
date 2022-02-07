import { ExpressionEditor } from "../components/expression-editor"

export class RecordForm {

    private static selector = '[data-testid="record-form"]';

    static clickWhiteSpace() {
        this.getForm().click()
        return this;
    }

    static haveRecordName(name: string) {
        this.getForm().get(`[data-testid="${name}"]`)
            .should("contain", name)
        return this;
    }

    static editRecord() {
        this.getForm().within(() => {
            cy.get("[id=edit-button]")
                .click();
        });
        return this;
    }

    static makePublicRecord() {
        this.getForm().within(() => {
            cy.get("[id=inactive-public]").parent()
                .click();
        });
        return this;
    }

    static toggleClosedRecord() {
        this.getForm().within(() => {
            cy.get("[id=VSC]").parent()
                .click();
        });
        return this;
    }

    static typeRecordName(name: string) {
        const clearKeyStroke = Cypress.platform == "darwin" ? "{selectall}{del}{esc}" : "{ctrl}a{del}{esc}";
        this.getForm().get('[placeholder="Record name"]')
            .type(clearKeyStroke)
            .type(name);
        return this;
    }

    static addNewField(type: string, name: string, value?: any) {
        this.getForm().within(() => {
            cy.contains("Add Field").parent()
                .click();
            cy.get('[placeholder="Type"]')
                .type(type).wait(1000);
            if (value) {
                cy.get('[placeholder="Field name"]')
                    .type(name);
                cy.get('[placeholder="Value(Optional)"]')
                    .type(value + "{enter}");
            } else {
                cy.get('[placeholder="Field name"]')
                    .type(name + "{enter}");
                cy.get('[data-testid="delete-"] button').click();
            }
        });
        return this;
    }

    static deleteFirstField(name: string) {
        this.getForm().within(() => {
            cy.get(`[data-testid="delete-${name}"] button`).click({ force: true });
        });
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
