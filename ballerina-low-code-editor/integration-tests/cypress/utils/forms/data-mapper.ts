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

    static disabledSaveButton = () => this.getForm().contains("Save").should('be.disabled')

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

    static getFunctionName = () => this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input");

    static updateFunctionName(name: string) {
        this.getFunctionName().type(name).blur();
    }

    static clearFunctionName() {
        this.getFunctionName().clear().blur();
    }

    static checkFnName(inputValue) {
        this.getFunctionName().should('have.value', inputValue)
    }

    static containsValidFnName() {
        this.getFunctionName().should('have.attr', 'aria-invalid', 'false');;
    }

    static containsInvalidFnName() {
        this.getFunctionName().should('have.attr', 'aria-invalid', 'true');;
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
        // this.getForm().contains("Save").should('not.be.disabled')
        this.getForm().contains("Save").should('not.be.disabled').click();
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
        cy.get(`[data-name='mappingConstructor.${targetPort}.IN']`).click({force: true})
    }

    static createMappingToIntermediatePort(sourcePort: string, inputPorts: string) {
        cy.get(`[data-name='${sourcePort}.OUT']`).click();
        cy.get(`[data-testid='link-connector-node-${inputPorts}-input']`).click({force: true})
    }

    static deleteLinksWithLinkConnector(inputPorts: string[], targetPort: string) {
        cy.get(`[data-testid='link-connector-delete-${inputPorts.join(' + ')}']`).click();

        for(const port of inputPorts){
            cy.get(`[data-testid='link-from-${port}.OUT-to-datamapper-intermediate-port']`).should('not.exist');
        }
        cy.get(`[data-testid='link-from-datamapper-intermediate-port-to-mappingConstructor.${targetPort}.IN']`).should('not.exist');
    }

    static linkExists(sourcePort: string, targetPort: string) {
        cy.get(`[role="progressbar]"`).should('not.exist');
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`)
    }

    static linkWithErrorExists(sourcePort: string, targetPort: string) {
        cy.get(`[role="progressbar]"`).should('not.exist');
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`).should('have.attr','data-diagnostics', 'true')
    }

    static checkIntermediateLinks(sourcePort: string[], targetPort: string) {
        cy.get(`[role="progressbar]"`).should('not.exist');
        for(const port of sourcePort){
            cy.get(`[data-testid='link-from-${port}.OUT-to-datamapper-intermediate-port']`)
        }
        cy.get(`[data-testid='link-from-datamapper-intermediate-port-to-mappingConstructor.${targetPort}.IN']`)
    }

    static deleteLink(sourcePort: string, targetPort: string) {
        cy.get(`[role="progressbar]"`).should('not.exist');
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`).click();
        cy.get(`[data-testid='expression-label-delete']`).click();
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`).should('not.exist');
    }

    static deleteLinkWithDiagnostics(sourcePort: string, targetPort: string) {
        cy.get(`[role="progressbar]"`).should('not.exist');
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`).click();
        cy.get(`[data-testid='expression-label-diagnostic']`);
        cy.get(`[data-testid='expression-label-delete']`).click();
        cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-mappingConstructor.${targetPort}.IN']`).should('not.exist');
    }

    static targetNodeFieldMenuClick(field: string, option: string) {
        cy.get(`[data-testid='value-config-mappingConstructor.${field}.IN']`).click();
        cy.contains(option).click();
    }

    static directValueAssignmentExists(field: string, value: string) {
        cy.get(`[data-testid='record-widget-field-mappingConstructor.${field}.IN']`).should("have.text", value);
    }

    static directValueAssignmentNotExists(field: string) {
        cy.get(`[data-testid='record-widget-field-mappingConstructor.${field}.IN']`).should('not.exist');
    }

    static outputLabelContains(field: string, containsText) {
        cy.get(`[data-testid='record-widget-field-label-mappingConstructor.${field}.IN']`).should("contain.text", containsText);
    }

    static outputLabelNotContain(field: string, containsText) {
        cy.get(`[data-testid='record-widget-field-label-mappingConstructor.${field}.IN']`).should("not.contain.text", containsText);
    }

    static addElementToArrayField(field: string) {
        cy.get(`[data-testid='array-widget-mappingConstructor.${field}.IN-add-element']`).click();
    }

    static isArrayFieldInitialized(field: string) {
        cy.get(`[data-testid='array-widget-mappingConstructor.${field}.IN-values']`).should('exist')
    }

    static isArrayFieldNotInitialized(field: string) {
        cy.get(`[data-testid='array-widget-mappingConstructor.${field}.IN-values']`).should('not.exist')
    }

    static checkPrimitiveArrayFieldElementValue(field: string, value: string) {
        cy.get(`[data-testid='primitive-array-element-mappingConstructor.${field}.IN']`).should("have.text", value);
    }

    static arrayFieldPortEnabled(field: string) {
        cy.get(`[data-testid='array-type-editable-record-field-mappingConstructor.${field}.IN']`).should('have.css', 'cursor', 'pointer')
    }

    static arrayFieldPortDisabled(field: string) {
        cy.get(`[data-testid='array-type-editable-record-field-mappingConstructor.${field}.IN']`).should('have.css', 'cursor', 'not-allowed')
    }

    static saveShouldBeDisabled() {
        this.getForm().contains("Save").should('be.disabled', { timeout: 5000 })
        return this;
    }


    public static getForm() {
        return cy.get(this.selector);
    }
}
