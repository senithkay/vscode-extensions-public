/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export class EndpointListForm {
    private static endpointListForm = '[data-testid="endpoint-list-form"]';

    static selectEndpoint(endpoint: string) {
        const startDate = new Date();
        cy.task('log', `Endpoint selection with name ${endpoint} started at ${startDate}`);
        this.getEndpointListForm()
            .get(`[data-testid="${endpoint.toLowerCase()}"]`, { timeout: 200000 })
            .should("be.visible")
            .click();
        const endDate = new Date();
        cy.task('log', `Endpoint selection with name ${endpoint} completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static shouldBeVisible() {
        this.getEndpointListForm().should("be.visible");
        return this;
    }

    static close() {
        this.getEndpointListForm()
        .get('.close-btn-wrap button')
        .click();
    }

    private static getEndpointListForm() {
        return cy
            .get(this.endpointListForm);
    }

}
