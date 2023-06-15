/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
export class ActionListForm {
    private static actionListForm = '[data-testid="action-list-form"]';

    static selectAction(action: string) {
        const startDate = new Date();
        cy.task('log', `Action selection with name ${action} started at ${startDate}`);
        this.getActionListForm()
            .get(`[data-testid="action-list"]`, { timeout: 200000 })
            .get(`[data-testid="${action.toLowerCase()}"]`)
            .should("be.visible")
            .click();
        const endDate = new Date();
        cy.task('log', `Action selection with name ${action} completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static shouldBeVisible() {
        this.getActionListForm().should("be.visible").get(`[data-testid="action-list"]`)
            .should("be.visible");
        return this;
    }

    static close() {
        this.getActionListForm()
            .get('.close-btn-wrap button')
            .click();
    }

    private static getActionListForm() {
        return cy
            .get(this.actionListForm, { timeout: 200000 });
    }

}
