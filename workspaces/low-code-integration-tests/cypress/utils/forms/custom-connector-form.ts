/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExpressionEditor } from "../components/expression-editor"

export class CustomConnectorForm {

    private static connectorFormSelector = '[data-testid="connector-form"]';

    private static getConnectorForm() {
        return cy
            .get(this.connectorFormSelector);
    }

    static shouldBeVisible() {
        this.getConnectorForm().should("be.visible");
        return this;
    }

    static waitForConnectorLoad() {
        this.getConnectorForm().get('.TextVerticalPreloader-wrapper-relative').should(($div) => {
            const element = $div;
            expect(element).to.be.not.exist;
        })
        return this;
    }

    static typeClientId(clientId: string) {
        ExpressionEditor
            .getForField("clientId", this.connectorFormSelector)
            .type(clientId)
            .waitForValidations()
            .clickEditor()
            .waitForValidations()
        return this;
    }

    static typeClientSecret(ClientSecret: string) {
        ExpressionEditor
            .getForField("clientSecret", this.connectorFormSelector)
            .type(ClientSecret)
            .waitForValidations()
            .clickEditor()
            .waitForValidations()
        return this;
    }

    static saveConnection() {
        this.getConnectorForm()
            .get('button')
            .contains("Save Connection")
            .click();
        return this;
    }
}
