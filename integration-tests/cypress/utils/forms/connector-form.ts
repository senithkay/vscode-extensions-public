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
export class ConnectorMarketplace {
    private static marketplaceSelector = '[data-testid="log-form"]';

    static selectConnector(type: string) {
        this.getConnectorMarketplace()
            .get(`[data-testid="${type.toLowerCase()}"]`)
            .should("be.visible")
            .click();
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
