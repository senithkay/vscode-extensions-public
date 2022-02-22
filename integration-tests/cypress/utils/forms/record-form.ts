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
                    .type(name).wait(1000);
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

    static importFromJson(body: string) {
        this.getForm().within(() => {
            cy.contains("Import JSON").parent()
                .click();
        }).wait(2000);

        const inputContainer = cy.get('#json-input-container');

        inputContainer
            .get('.textarea-wrapper textarea')
            .first()
            .type(body);
        inputContainer.get('[data-testid="save-btn"]')
            .last()
            .click()

        return this;
    }

    static editField(name: string, newName?: string, newType?: string, optionalValue?: string) {
        this.getForm().within(() => {
            cy.get(`[data-field-name="${name}"]`)
                .click();

            if (newType) {
                cy.get('[placeholder="Type"]')
                    .clear()
                    .type(newType).wait(1000);

                if (!optionalValue && !newName) {
                    cy.get('[placeholder="Type"]')
                        .type('{enter}');
                }
            }

            if (newName) {
                cy.get('[placeholder="Field name"]')
                    .clear()
                    .type(newName)
                    .wait(1000);

                if (!optionalValue) {
                    cy.get('[placeholder="Field name"]').type('{enter}')
                }
            }

            if (optionalValue) {
                cy.get('[placeholder="Value(Optional)"]')
                    .clear()
                    .type(optionalValue + "{enter}");
            }
        });
        return this;
    }

    static deleteField(name: string) {
        this.getForm().within(() => {
            cy.get(`[data-field-name="${name}"]`)
                .click();

            cy.get(`[data-field-name="${name}"]`).within(() => {
                cy.get('[data-testid="delete-button"]')
                    .click()
                    .wait(1000);
            });
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
    
    static cancel() {
        this.getForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }

    static close() {
        this.getForm()
            .get('.close-btn-wrap button')
            .click();
    }

}
