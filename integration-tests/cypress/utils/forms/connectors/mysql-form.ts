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

import { ExpressionEditor } from "../../components/expression-editor"

export class MysqlForm {

    private static selector = '[data-testid="connector-form"]';
    private static waitAfterType = 1000;

    static togglePublicAccessModifier() {
        this.getForm().get('[name="public"]').parent()
            .click()
        return this;
    }

    static toggleFinalAccessModifier() {
        this.getForm().get('[name="final"]').parent()
            .click()
        return this;
    }

    static isAccessModifierChecked(value: "public" | "final" | "public,final" | "final,public") {
        this.getForm().get('[name="public"]')
            .should("have.value", value)
        return this;
    }

    static haveDefaultName() {
        ExpressionEditor
            .getForField("Endpoint Name", this.selector)
            .includeText("mysqlEndpoint")
            .waitForValidations();
        return this;
    }

    static typeConnectionName(name: string) {
        ExpressionEditor
            .getForField("Endpoint Name", this.selector)
            .clear()
            .type(name)
            .waitForValidations();
        cy.wait(this.waitAfterType);
        return this;
    }

    static findFieldAndType(fieldId:string, text: string) {
        ExpressionEditor
            .getForField(fieldId, this.selector)
            .type(`"${text}"`)
            .waitForValidations()
            .clickEditor()
            .waitForValidations();
        cy.wait(this.waitAfterType);
        return this;
    }

    static typeDatabase(name: string) {
        ExpressionEditor
            .getForField("database", this.selector)
            .type(`"${name}"`)
            .waitForValidations();
        cy.wait(this.waitAfterType);
        return this;
    }

    static selectOperation(type: string) {
        this.getForm().get('[placeholder="Search operation"]')
            .type(type)
            .get('li')
            .contains(type, { matchCase: false })
            .click();
        return this;
    }    

    static shouldBeVisible() {
        this.getForm().should("be.visible");
        return this;
    }

    static waitForConnectorLoad() {
        this.getForm().get('.TextVerticalPreloader-wrapper-relative')
            .should("not.exist");
        return this;
    }

    private static getForm() {
        return cy
            .get(this.selector);
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

    /**
     * Operation fillings
     */

    static addSqlQuery(query: string) {
        ExpressionEditor
            .getForField("sqlQuery", this.selector)
            .type(`\`${query}\``)
            .waitForValidations()
            .clearSuggestions();
        cy.wait(this.waitAfterType);
        return this;
    }

}
