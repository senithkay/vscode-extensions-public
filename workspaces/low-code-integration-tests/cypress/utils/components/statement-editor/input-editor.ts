/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export class InputEditor {
    static getInputEditor() {
        return cy.get(`[data-testid="input-editor"]`);
    }

    static typeInput(text: string, parseSpecialCharSequences: boolean = true) {
        const startDate = new Date();
        cy.task('log', `Started to wait to type input-${text} at ${startDate}`);
        cy.wait(1000);
        this.getInputEditor()
            .focus()
            .clear()
            .wait(1000)
            .type(text, { parseSpecialCharSequences: parseSpecialCharSequences });

        cy.wait(1000);
        cy.task('log', `Completed typing the input-${text}`);

        this.getInputEditor()
            .type('{enter}');
        cy.wait(2500);
        const endDate = new Date();
        cy.task('log', `Input typing confirmed for the input-${text} at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static escapeInput() {
        const startDate = new Date();
        cy.task('log', `Started to wait to escape input at ${startDate}`);
        cy.wait(1000);

        this.getInputEditor()
            .type('{esc}');
        cy.wait(2500);
        
        const endDate = new Date();
        cy.task('log', `Input escape confirmed for the input at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static checkEditingState() {
        cy.get(`[data-testid="input-editor"]`)
            .should('be.visible', { timeout: 50000 })
        return this;
    }

    static checkUneditableState() {
        cy.get(`[data-testid="input-editor"]`)
            .should("not.exist", { timeout: 50000 });
        return this;
    }
}
