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

    static shouldBeVisible() {
        this.getTriggerMarketplace().should("be.visible");
        return this;

    }

    private static getTriggerMarketplace() {
        return cy 
            .get(this.marketplaceSelector);

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
}
