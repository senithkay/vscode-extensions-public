/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export class ConnectorMarketplace {
    private static marketplaceSelector = '[data-testid="log-form"]';

    static selectConnector(type: string) {
        const startDate = new Date();
        cy.task('log', `Started to select the type-${type} at ${startDate}`);
        this.getConnectorMarketplace()
            .get(`[data-testid="${type.toLowerCase()}"]`)
            .should("be.visible")
            .click();
        const endDate = new Date();
        cy.task('log', `Completed selecting the type-${type} at ${endDate}`);
        return this;
    }

    static searchConnector(type: string) {
        this.getConnectorMarketplace()
            .get('[data-testid="search-input"]')
            .should("be.visible")
            .click()
            .type(type);
        return this;
    }

    static waitForConnectorsLoading(name?: string) {
        const startDate = new Date();
        cy.task('log', `Connector/Action ${name} loading started at ${startDate}`);
        this.getConnectorMarketplace().get('[data-testid="marketplace-search-loader"]').should('be.visible');
        this.getConnectorMarketplace().get('[data-testid="marketplace-search-loader"]',
            { timeout: 200000 }).should('not.exist');
        const endDate = new Date();
        cy.task('log', `Connector/Action ${name} loading completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        return this;
    }

    static shouldBeVisible() {
        this.getConnectorMarketplace().should("be.visible");
        return this;
    }

    static close() {
        this.getConnectorMarketplace()
            .get('.close-btn-wrap button')
            .click();
    }

    private static getConnectorMarketplace() {
        return cy
            .get(this.marketplaceSelector);

    }

}
