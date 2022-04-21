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
            .get(`[data-testid="${type.toLowerCase()}"]`)
            .should("be.visible")
            .click();
        return this;
    }

    static searchTrigger(type: string) {
        this.getTriggerMarketplace()
            .get('[data-testid="search-input"]')
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
        cy.wait(5000);
        this.getTriggerMarketplace().get(`[data-testid="marketplace-search-loader"]`).should(($div) => {
            const element = $div;
            expect(element).to.be.not.exist;
        })
        return this;
    }

    private static getTriggerForm() {
        return cy
            .get(this.triggerFormSelector);

    }

    static createBtnShouldNotBeClickable() {
        this.getTriggerForm()
            .get('[data-testid="save-btn"]')
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

    static waitForDiagramUpdate() {
        cy.get(`[id="canvas-overlay"]`)
            .children().should("have.length", 0)
        cy.get(`[data-testid="diagram-loader"]`)
            .should("not.exist")
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
