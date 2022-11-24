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

export class DataMapper {
    private static selector = '[data-testid="data-mapper-form"]';

    static disabledSaveButton() {
        this.getForm().contains("Save").should('be.disabled')
    }

    static displayUnsupportedTypesBanner() {
        this.getForm().get('[data-test-id="unsupported-input-banner"]').should('exist')
        this.getForm().get('[data-test-id="unsupported-output-banner"]').should('exist')
    }

    static addNewInputRecord(jsonStr: string, recordName: string, separateRecords?: boolean) {
        cy.get('[data-testid="dm-inputs"] > button[data-testid="new-record"]').click();
        cy.get('button[data-testid="import-json"]').click();
        this.disabledSaveButton();
        cy.get('[data-testid="import-record-name"]').find("input").type(recordName);
        cy.get(".textarea-wrapper").find("textarea").first().type(jsonStr, { parseSpecialCharSequences: false });
        if (separateRecords) {
            cy.get('[type="checkbox"]').check({ force: true });
        }
        this.getForm().contains("Save").should('not.be.disabled')
        cy.contains("Save").click();
    }

    static addNewOutputRecord(jsonStr: string, recordName: string) {
        cy.get('[data-testid="dm-output"] > button[data-testid="new-record"]').click();
        cy.get('button[data-testid="import-json"]').click();
        this.disabledSaveButton();
        cy.get('[data-testid="import-record-name"]').find("input").type(recordName);
        cy.get(".textarea-wrapper").find("textarea").first().type(jsonStr, { parseSpecialCharSequences: false });
        this.getForm().contains("Save").should('not.be.disabled')
        cy.contains("Save").click();
    }

    static addExitingInputRecord(recordName: string) {
        cy.get('[data-testid="dm-inputs"] > button[data-testid="exiting-record"]').click();
        cy.get('li').contains(recordName).click();
        cy.contains("Add").click();
    }

    static selectInputRecord(recordName: string, oldRecordName: string) {
        this.getForm().wait(5000);
        this.getForm().get(`[data-testid="type-select-dropdown"]`).click();
        this.getForm().get('li').contains(recordName).click();
        this.getForm().contains("Update").click();
    }

    static addExitingOutputRecord(recordName: string) {
        cy.get('[data-testid="dm-output"] > button[data-testid="exiting-record"]').click();
        cy.get('li').contains(recordName).click();
    }

    static updateFunctionName(name: string) {
        this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input").type(name).blur();
    }

    static clearFunctionName() {
        this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input").clear().blur();
    }

    static checkFnName(inputValue) {
        this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input").should('have.value', inputValue)
    }

    static containsValidFnName() {
        this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input").should('have.attr', 'aria-invalid', 'false');;
    }

    static containsInvalidFnName() {
        this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input").should('have.attr', 'aria-invalid', 'true');;
    }

    static editInputRecord(index: number) {
        cy.get(`[data-testid="data-mapper-config-edit-input-${index}"]`).click();
    }

    static deleteInputRecord(index: number) {
        cy.get(`[data-testid="data-mapper-config-delete-input-${index}"]`).click();
    }

    static deleteOutputRecord() {
        cy.get(`[data-testid="data-mapper-config-delete-output"]`).click({ timeout: 10000 });
    }

    static saveConfig() {
        this.containsValidFnName();
        this.getForm().contains("Save").should('not.be.disabled')
        this.getForm().contains("Save").click();
    }

    static openConfigureMenu() {
        cy.contains("Configure").click();
    }

    static getSourceNode(name: string) {
        return cy.get(`[data-testid="${name}-node"]`)
    }

    static getTargetNode(name: string) {
        return cy.get(`[data-testid="mappingConstructor.${name}-node"]`)
    }

    static createMapping(sourcePort: string, targetPort: string) {
        cy.get(`[data-name='${sourcePort}.OUT']`).click();
        cy.get(`[data-name='mappingConstructor.${targetPort}.IN']`).click();
    }

    static saveShouldBeDisabled() {
        this.getForm()
            .contains("Save")
            .should('be.disabled', { timeout: 5000 })
        return this;
    }


    public static getForm() {
        return cy.get(this.selector);
    }
}
