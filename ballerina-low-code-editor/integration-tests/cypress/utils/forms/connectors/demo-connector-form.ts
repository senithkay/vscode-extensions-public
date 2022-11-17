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

import { ExpressionEditor } from "../../components/expression-editor";

export class DemoConnectorForm {

    private static selector = '[data-testid="connector-form"]';

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;
    }

    static waitForConnectorLoad() {
        this.getForm().get('.TextVerticalPreloader-wrapper-relative')
            .should("not.exist");
        return this;
    }

    static haveDefaultName(name: string) {
        ExpressionEditor
            .getForField("Endpoint Name", this.selector)
            .includeText(name)
            .waitForValidations();
        return this;
    }

    static typeEndpointName(name: string) {
        ExpressionEditor
            .getForField("Endpoint Name", this.selector)
            .clear()
            .type(name)
            .waitForValidations();
        return this;
    }

    static typeInField(fieldName: string, text: string, editorIndex: number = 0) {
        ExpressionEditor
            .getForField(fieldName, this.selector)
            .type(text, editorIndex)
            .waitForValidations()
            .clearSuggestions();
        return this;
    }

    static saveConnection() {
        this.getForm()
            .get('button')
            .contains("Save Connection")
            .click();
        return this;
    }

    static continueToInvoke() {
        this.getForm()
            .get('button')
            .contains("Continue to Invoke API")
            .click();
        return this;
    }

    static save() {
        this.getForm()
            .get('button')
            .contains("Save")
            .click();
        return this;
    }

    static selectOperation(operation: string) {
        this.getForm().get('[placeholder="Search operation"]')
            .type(operation)
            .get('li')
            .contains(operation, { matchCase: false })
            .click();
        return this;
    }

    static clickAddItem() {
        this.getForm()
            .get('.add-element-button')
            .contains('Add Item')
            .click();
        return this;
    }

    static clickAddMapItem() {
        this.getForm()
            .get('.add-element-button')
            .contains('Add Key-Value Pair')
            .click();
        return this;
    }

    private static getForm() {
        return cy
            .get(this.selector);
    }
}
