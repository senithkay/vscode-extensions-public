/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
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
        cy.wait(1000);
        cy.task('log', `Started saving the statement`);
        this.getStatementEditor()
            .get('button')
            .contains("Save")
            .should('not.be.disabled')
            .wait(1000)
            .click();
        cy.task('log', `Completed saving the statement`);
        return this;
    }

    static add() {
        this.getStatementEditor()
            .get('button')
            .contains("Add")
            .should('not.be.disabled')
            .click({ force: true })
        return this;

    }

    static saveDisabled() {
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

    static clickStatementEditor() {
        this.getStatementEditor()
            .get(this.selector)
            .click();
        return this;

    }
}
