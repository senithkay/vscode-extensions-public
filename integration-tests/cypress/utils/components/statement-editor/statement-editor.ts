/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
        this.getStatementEditor()
            .get('button')
            .contains("Save")
            .should('not.be.disabled')
            .wait(1000)
            .click();
        return this;

    }

    static add() {
        this.getStatementEditor()
            .get('button')
            .contains("Add")
            .should('not.be.disabled')
            .wait(1000)
            .click()
            .wait(3000);
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
}
