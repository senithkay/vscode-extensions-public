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
        this.getConnectorForm().get('.TextVerticalPreloader-wrapper-relative')
            .should("not.exist");
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
