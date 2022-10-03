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

    static deleteDisabled(){
        cy.get(`[data-testid="toolbar-delete"]`)
            .should('have.class', 'Mui-disabled');
        return this;
    }

    static clickConfigurableButton() {
        cy.get(`[data-testid="toolbar-configurable"]`)
            .click()
        return this;
    }

}
