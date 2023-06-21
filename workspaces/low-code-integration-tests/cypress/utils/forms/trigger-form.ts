/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export class TriggerForm {
    private static marketplaceSelector = '[data-testid="log-form"]';
    private static triggerFormSelector = '[data-testid="trigger-form"]';

    static selectServiceType(svc: string) {
        this.getTriggerForm()
            .get(`[id="combo-box-demo"]`)
            .click()
            .type(svc)
            .get('li')
            .contains(svc, { matchCase: false })
            .click();
        return this;
    }

    static selectTriggerType(type: string) {
        this.getTriggerMarketplace()
            .get('[data-testid="marketplace-search-loader"]',
                { timeout: 100000 }).should('not.exist')
            .get(`[data-testid="${type.toLowerCase()}"]`, { timeout: 120000 })
            .should("be.visible")
            .click();
        return this;
    }

    static searchTrigger(type: string) {
        this.getTriggerMarketplace()
            .get('[data-testid="search-input"]', { timeout: 20000 })
            .should("be.visible")
            .click()
            .type(type);
        return this;
    }

    static addChannel(type: string) {
        this.getTriggerForm()
            .get('[data-testid="add-channel"]')
            .should("be.visible")
            .click()
            .get(`[id="combo-box-demo"]`)
            .should("be.visible")
            .click()
            .type(type)
            .get('li')
            .contains(type, { matchCase: false })
            .click();
        return this;
    }

    static deleteChannel(type: string) {
        this.getTriggerForm()
            .get(`[data-testid="delete-${type}"]`)
            .click()
            .get('div')
            .contains(type, { matchCase: false })
            .should("not.exist");
        return this;
    }

    static shouldBeVisible() {
        this.getTriggerMarketplace().should("be.visible");
        return this;
    }

    private static getTriggerMarketplace() {
        return cy
            .get(this.marketplaceSelector);

    }

    static waitForConnectorsLoading() {
        this.getTriggerMarketplace().get('[data-testid="marketplace-search-loader"]',
            { timeout: 10000 }).should('be.visible');
        this.getTriggerMarketplace().get('[data-testid="marketplace-search-loader"]',
            { timeout: 120000 }).should('not.exist');
        return this;
    }

    private static getTriggerForm() {
        return cy
            .get(this.triggerFormSelector);

    }

    static createBtnShouldNotBeClickable() {
        this.getTriggerForm()
            .get('[data-testid="save-btn"]', { timeout: 120000 })
            .should("have.attr", "disabled");
        return this;
    }

    static create() {
        this.getTriggerForm()
            .get('button')
            .contains("Create")
            .click();
        return this;
    }

    static cancel() {
        this.getTriggerForm()
            .get('button')
            .contains("Cancel")
            .click();
        return this;
    }
}
