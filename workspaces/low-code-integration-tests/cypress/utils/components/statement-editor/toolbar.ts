/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
            .should('not.be.disabled', {timeout:10000})
            .click({ force: true })
        return this;
    }

    static clickOperator(selectedOperator: string) {
        cy.get(`[data-testid="toolbar-operators"]`).within(() => {
            cy.contains(`[data-testid="operator-value"]`, selectedOperator)
                .click({ force: true })
        });
        return this;
    }

    static clickMoreExpressions() {
        cy.get(`[data-testid="toolbar-expressions"]`)
            .click()
        return this;
    }

    static addQualifier(selectedQualifier: string) {
        cy.get(`[data-testid="toolbar-qualifier-options"]`)
            .click()
        cy.get(`[data-testid="qualifier-list-item"]`)
            .children(`[data-testid="qualifier-list-item-label"]`)
            .children()
            .contains(selectedQualifier)
            .parent()
            .parent()
            .children(`[data-testid="qualifier-check"]`)
            .click();
        return this;
    }

}
