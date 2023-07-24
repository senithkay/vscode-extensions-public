/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { InputEditor } from "../components/statement-editor/input-editor";
import { StatementEditor } from "../components/statement-editor/statement-editor";
import { EditorPane } from "../components/statement-editor/editor-pane";

export class DataMapper {
    static disabledSaveButton = () => this.getForm().contains("Save").should('be.disabled');

    static displayUnsupportedTypesBanner = () => {
        this.getForm().get('[data-test-id="unsupported-input-banner"]').should('exist');
        this.getForm().get('[data-test-id="unsupported-output-banner"]').should('exist');
    }

    static addNewInputRecord = (jsonStr: string, recordName: string, separateRecords?: boolean) => {
        cy.get('[data-testid="dm-inputs"] > button[data-testid="new-record"]').click();
        cy.get('button[data-testid="import-json"]').click();
        this.disabledSaveButton();
        cy.get('[data-testid="import-record-name"]').find("input").type(recordName);
        cy.get(".textarea-wrapper").find("textarea").first().type(jsonStr, { parseSpecialCharSequences: false });
        if (separateRecords) {
            cy.get('[type="checkbox"]').check({ force: true });
        }
        cy.get('[test-id="json-input-container"]').get('[data-testid="save-btn"]').should('not.be.disabled').click();
    }

    static addNewOutputRecord = (jsonStr: string, recordName: string) => {
        cy.get('[data-testid="dm-output"] > button[data-testid="new-record"]').click();
        cy.get('button[data-testid="import-json"]').click();
        this.disabledSaveButton();
        cy.get('[data-testid="import-record-name"]').find("input").type(recordName);
        cy.get(".textarea-wrapper").find("textarea").first().type(jsonStr, { parseSpecialCharSequences: false });
        cy.get('[test-id="json-input-container"]').get('[data-testid="save-btn"]').should('not.be.disabled').click();
    }

    static addExitingInputRecord = (recordName: string, setAsArray?: boolean) => {
        cy.get('[data-testid="dm-inputs"] > button[data-testid="exiting-record"]').click();
        cy.get('li').contains(recordName).click();
        if (setAsArray) {
            cy.get('[type="checkbox"]').check({ force: true });
        }
        cy.contains("Add").click();
    }

    static selectInputRecord = (recordName: string, setAsArray?: boolean) => {
        this.getForm().wait(5000);
        this.getForm().get(`[data-testid="type-select-dropdown"]`).click();
        this.getForm().get('li').contains(recordName).click();
        if (setAsArray) {
            cy.get('[type="checkbox"]').check({ force: true });
        }
        this.getForm().contains("button","Update").should('not.be.disabled').click({force: true});
    }

    static addExitingOutputRecord = (recordName: string, setAsArray?: boolean) => {
        cy.get('[data-testid="dm-output"] > button[data-testid="exiting-record"]').click();
        cy.get('li').contains(recordName).click();
        if (setAsArray) {
            cy.get('[type="checkbox"]').check({ force: true });
        }
    }

    static getFunctionName = () => this.getForm().get('[data-testid="data-mapper-config-fn-name"]').find("input");

    static updateFunctionName = (name: string) => this.getFunctionName().type(name).blur();

    static clearFunctionName = () => this.getFunctionName().clear().blur();

    static checkFnName = (inputValue: string) => this.getFunctionName().should('have.value', inputValue);

    static containsValidFnName = () => {
        this.getFunctionName().should('have.attr', 'aria-invalid', 'false');
    }

    static containsInvalidFnName = () => {
        this.getFunctionName().should('have.attr', 'aria-invalid', 'true');
    }

    static editInputRecord = (index: number) => {
        cy.get(`[data-testid="data-mapper-config-edit-input-${index}"]`).click();
    }

    static deleteInputRecord = (index: number) => {
        cy.get(`[data-testid="data-mapper-config-delete-input-${index}"]`).click();
    }

    static deleteOutputRecord = () => {
        cy.get(`[data-testid="data-mapper-config-delete-output"]`).click({ timeout: 10000 });
    }

    static clickConfigUpdateBtn = () => {
        this.getForm().contains("button","Update").should('not.be.disabled').click({force: true});
    }

    static saveConfig = () => {
        this.containsValidFnName();
        this.getForm().contains("Save").should('not.be.disabled').click({force: true});
    }

    static confirmSaveConfig = () => {
        cy.contains("Continue").click({force: true});
    }

    static openConfigureMenu = () => cy.contains("Configure").click();

    static getSourceNode = (name: string) => cy.get(`[data-testid="${name}-node"]`);

    static getQueryExprNode = (name: string) => cy.get(`[data-testid="expandedQueryExpr.${name}-node"]`);

    static getTargetNode = (nodeType: string, name?: string) => cy.get(`[data-testid="${nodeType}${name ? `.${name}` : ''}-node"]`);

    static getMappingPort = (nodeType: string, targetPort: string) => cy.get(`[data-name='${nodeType}.${targetPort}.IN']`);

    static getMappingField = (nodeType: string, targetField: string) => cy.get(`[id='recordfield-${nodeType}.${targetField}']`);

    static mappingPortExists = (nodeType: string, targetPort: string) => this.getMappingPort(nodeType, targetPort).should('exist');

    static mappingPortNotExists = (nodeType: string, targetPort: string) => this.getMappingPort(nodeType, targetPort).should('not.exist');

    static getSourcePort = (sourcePort: string) => cy.get(`[data-name='${sourcePort}.OUT']`);

    static getSourceField = (sourceField: string) => cy.get(`[id='recordfield-${sourceField}']`);

    static sourcePortExists = (sourcePort: string) => this.getSourcePort(sourcePort).should('exist');

    static sourcePortNotExists = (sourcePort: string) => this.getSourcePort(sourcePort).should('not.exist');

    // static createMappingUsingFields = (sourcePort: string, targetPort: string) => {
    //     this.getSourceField(sourcePort).click();
    //     this.getMappingField(targetPort).click({ force: true });
    // }

    static searchInput = (searchValue) => {
        cy.get(`[id="search-0"]`).clear().type(`${searchValue}{enter}`)
    }

    static clearSearchInput = () => {
        cy.get(`[data-testid='search-clear-0']`).click();
    }

    static searchOutput = (searchValue) => {
        cy.get(`[id="search-1"]`).clear().type(`${searchValue}{enter}`)
    }

    static clearSearchOutput = () => {
        cy.get(`[data-testid='search-clear-1']`).click();
    }

    // static createMappingUsingPorts = (sourcePort: string, targetPort: string) => {
    //     this.getSourcePort(sourcePort).click();
    //     this.getMappingPort(targetPort).click({ force: true });
    // }

    // static createMappingUsingFieldAndPort = (sourceField: string, targetPort: string) => {
    static createMappingUsingFields = (sourceField: string, targetField: string, targetNodeType: string) => {
        this.getSourceField(sourceField).click();
        this.getMappingField(targetNodeType, targetField).click({ force: true });
    }

    static createMappingUsingPorts = (sourcePort: string, targetPort: string, targetNodeType: string) => {
        this.getSourcePort(sourcePort).click();
        this.getMappingPort(targetNodeType, targetPort).click({ force: true });
    }

    static createMappingUsingFieldAndPort = (sourceField: string, targetPort: string, targetNodeType: string) => {
        this.getSourceField(sourceField).click();
        this.getMappingPort(targetNodeType, targetPort).click({ force: true });
    }

    static createMappingUsingPortAndField = (sourcePort: string, targetField: string, targetNodeType: string) => {
        this.getSourcePort(sourcePort).click();
        this.getMappingField(targetNodeType, targetField).click({ force: true });
    }

    static createMappingFromQueryExprUsingFields = (sourceField: string, targetField: string, targetNodeType: string) => {
        cy.get(`[id='recordfield-expandedQueryExpr.source.${sourceField}']`).click();
        this.getMappingField(targetNodeType, targetField).click({ force: true });
    }

    static createMappingFromQueryExprUsingPorts = (sourcePort: string, targetPort: string, targetNodeType: string) => {
        cy.get(`[data-name='expandedQueryExpr.source.${sourcePort}.OUT']`).click();
        this.getMappingPort(targetNodeType, targetPort).click({ force: true });
    }

    static createMappingFromQueryExprUsingFieldAndPort = (sourceField: string, targetPort: string, targetNodeType: string) => {
        cy.get(`[id='recordfield-expandedQueryExpr.source.${sourceField}']`).click();
        this.getMappingPort(targetNodeType, targetPort).click({ force: true });
    }
    
    static addNewField = (fieldName: string, fieldParentId: string) => {
        cy.get(`[data-testid='add-new-field-${fieldParentId}']`).click();
        cy.get(`[data-testid="new-field-name"]`).clear().type(`${fieldName}{enter}`)
    }

    static createMappingFromQueryExprUsingPortAndField = (sourcePort: string, targetField: string, targetNodeType: string) => {
        cy.get(`[data-name='expandedQueryExpr.source.${sourcePort}.OUT']`).click();
        this.getMappingField(targetNodeType, targetField).click({ force: true });
    }

    static createMappingToIntermediatePort = (sourcePort: string, inputPorts: string) => {
        cy.get(`[data-name='${sourcePort}.OUT']`).click();
        cy.get(`[data-testid='link-connector-node-${inputPorts}-input']`).click({ force: true });
    }

    static getLinkToIntermediatePort = (port: string)=>{
        return cy.get(`[data-testid='link-from-${port}.OUT-to-datamapper-intermediate-port']`);
    }

    static getLinkFromIntermediatePort = (targetPort: string)=>{
        return cy.get(`[data-testid='link-from-datamapper-intermediate-port-to-mappingConstructor.${targetPort}.IN']`);
    }

    static deleteLinksWithLinkConnector = (inputPorts: string[], targetPort: string) => {
        cy.get(`[data-testid='link-connector-delete-${inputPorts.join(' + ')}']`).click();

        for (const port of inputPorts) {
            this.getLinkToIntermediatePort(port).should('not.exist');
        }
        this.getLinkFromIntermediatePort(targetPort).should('not.exist');
    }

    static getLink = (sourcePort: string, targetPort: string, targetNode: string) => {
        return cy.get(`[data-testid='link-from-${sourcePort}.OUT-to-${targetNode}.${targetPort}.IN']`);
    }

    static linkExists = (sourcePort: string, targetPort: string, targetNode: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        this.getLink(sourcePort, targetPort, targetNode).should('exist');
    }

    static linkWithErrorExists = (sourcePort: string, targetPort: string, targetNode: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        this.getLink(sourcePort, targetPort, targetNode).should('have.attr', 'data-diagnostics', 'true');
    }

    static checkIntermediateLinks = (sourcePort: string[], targetPort: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        for (const port of sourcePort) {
            this.getLinkToIntermediatePort(port).should('exist');
        }
        this.getLinkFromIntermediatePort(targetPort).should('exist');
    }

    static deleteLink = (sourcePort: string, targetPort: string, targetNode: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        this.getLink(sourcePort, targetPort, targetNode).click();
        cy.get(`[data-testid='expression-label-delete']`).click();
        this.getLink(sourcePort, targetPort, targetNode).should('not.exist');
    }

    static deleteLinkWithDiagnostics = (sourcePort: string, targetPort: string, targetNode: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        this.getLink(sourcePort, targetPort, targetNode).click();
        cy.get(`[data-testid='expression-label-diagnostic']`);
        cy.get(`[data-testid='expression-label-delete']`).click();
        this.getLink(sourcePort, targetPort, targetNode).should('not.exist');
    }

    static targetNodeFieldMenuClick = (field: string, option: string, targetNodeType: string) => {
        cy.get(`[data-testid='value-config-${targetNodeType}.${field}.IN']`).click();
        cy.contains(option).click();
    }

    static directValueAssignmentExists = (field: string, value: string) => {
        cy.get(`[data-testid='record-widget-field-mappingConstructor.${field}.IN']`).should("have.text", value);
    }

    static directValueAssignmentNotExists = (field: string) => {
        cy.get(`[data-testid='record-widget-field-mappingConstructor.${field}.IN']`).should('not.exist');
    }

    static getRecordArrayFieldElement = (field: string, targetNodeType: string) =>
        cy.get(`[data-testid='record-widget-field-label-${targetNodeType}.${field}.IN']`)

    static outputLabelContains = (field: string, containsText: string) =>
        this.getRecordArrayFieldElement(field, 'mappingConstructor').should("contain.text", containsText)

    static outputLabelNotContain = (field: string, containsText: string) =>
        this.getRecordArrayFieldElement(field, 'mappingConstructor').should("not.contain.text", containsText)

    static addElementToArrayField = (field: string, targetNodeType: string) => {
        cy.get(`[data-testid='array-widget-${targetNodeType}.${field}.IN-add-element']`).click();
    }

    static getArrayField = (field: string, targetNodeType: string) => cy.get(`[data-testid='array-widget-${targetNodeType}.${field}.IN-values']`);

    static isArrayFieldExists = (field: string, targetNodeType: string) => this.getArrayField(field, targetNodeType).should('exist');

    static isArrayFieldNotExists = (field: string, targetNodeType: string) => this.getArrayField(field, targetNodeType).should('not.exist');

    static checkPrimitiveArrayFieldElementValue = (field: string, value: string, targetNodeType: string) => {
        cy.get(`[data-testid='primitive-array-element-${targetNodeType}.${field}.IN']`).should("have.text", value);
    }

    static getArrayPortField = (field: string) => cy.get(`[data-testid='array-type-editable-record-field-mappingConstructor.${field}.IN']`);

    static arrayFieldPortEnabled = (field: string) => this.getArrayPortField(field).should('have.css', 'cursor', 'pointer');

    static arrayFieldPortDisabled = (field: string) => this.getArrayPortField(field).should('have.css', 'cursor', 'not-allowed');

    static checkRecordArrayFieldElementValue = (field: string, value: string) => {
        cy.get(`[data-testid='record-widget-field-mappingConstructor.${field}.IN']`).should("contain.text", value);
    }

    static clickLinkCodeAction = (sourcePort: string, targetPort: string, targetNode: string) => {
        cy.get(`[role="progressbar]"`).should('not.exist');
        this.getLink(sourcePort, targetPort, targetNode).click();
        cy.get(`[data-testid='expression-label-code-action']`).click();
        cy.get(`[data-testid='code-action-additional-0']`).click();
    }

    static clickExpandQueryView = (targetPort: string) => {
        cy.get(`[data-testid='expand-query-${targetPort}']`).click();
    }

    static addIntermediaryClause = (index: number, option: string) => {
        cy.get(`[data-testid='intermediary-add-btn-${index}']`).click();
        cy.contains(option).click();
    }

    static clickIntermediateExpression = (index: number) => {
        cy.get(`[data-testid='intermediate-clause-expression-${index}']`).click();
    }

    static clickJoinOnExpression = (index: number) => {
        cy.get(`[data-testid='join-clause-on-expression-${index}']`).click();
    }

    static clickJoinEqualsExpression = (index: number) => {
        cy.get(`[data-testid='join-clause-equals-on-expression-${index}']`).click();
    }

    static updateLetVariableName = (index: number, newName: string) => {
        cy.get(`[data-testid='let-clause-name-${index}']`).click();
        cy.get(`[data-testid="let-clause-name-input-${index}"]`).clear().type(`${newName}{enter}`);
    }

    static deleteIntermediateWhereClause = (index: number) => {
        cy.get(`[data-testid='where-clause-delete-${index}']`).click();
        cy.get(`[data-testid='where-clause-expression-${index}']`).should('not.exist');
    }

    static deleteIntermediateLetClause = (index: number) => {
        cy.get(`[data-testid='let-clause-delete-${index}']`).click();
        cy.get(`[data-testid='let-clause-expression-${index}']`).should('not.exist');
    }

    static clickHeaderBreadcrumb = (index: number) => {
        cy.get(`[data-testid='dm-header-breadcrumb-${index}']`).click();
    }

    static toggleArrayFieldExpand = (field: string, targetNodeType: string) => {
        cy.get(`[data-testid="${targetNodeType}.${field}.IN-expand-icon-array-field"]`).click();
    }

    static toggleRecordFieldExpand = (field: string)=>{
        cy.get(`[data-testid="mappingConstructor.${field}.IN-expand-icon-element"]`).click();
    }

    static toggleSourceNodeExpand = (nodeName: string)=>{
        cy.get(`[data-testid="${nodeName}-expand-icon-record-source-node"]`).click({force: true});
    }

    static toggleTargetNodeExpand = (nodeName: string, targetNodeType: string) => {
        cy.get(`[data-testid="${targetNodeType}.${nodeName}-expand-icon-mapping-target-node`).click({force: true});
    }

    static deleteQueryLink = (sourcePort: string, targetPort: string) => {
        cy.get(`[data-testid='delete-query-${targetPort}']`).click();
        this.getLinkToIntermediatePort(sourcePort).should('not.exist');
        this.getLinkFromIntermediatePort(targetPort).should('not.exist');        
    }

    public static getForm = () => cy.get('[data-testid="data-mapper-form"]');

    public static getLocalVariablesForm = () => cy.get('[data-testid="data-mapper-local-variables-form"]');

    static clickAddLocalVariableBtn = () => {
        cy.get(`[data-testid=add-local-variable-btn`).click({force: true});
    }

    static closeLocalVariablePanel = () => {
        this.getLocalVariablesForm().get('[data-testid="done-btn"]').should('not.be.disabled').click();
    }

    static addNewLocalVariableAtEnd = () => {
        this.getLocalVariablesForm().get('[data-testid="create-new-local-variable-btn"]').click();
        this.getLocalVariablesForm().get('[data-testid="done-btn"]').should('be.disabled');
    }

    static addNewLocalVariableAtGivenLocation = (index: number) => {
        cy.get(`[data-testid="add-local-variable-btn-${index}"]`).click();
        this.getLocalVariablesForm().get('[data-testid="done-btn"]').should('be.disabled');
    }

    static editLocalVariableName = (variableIndex: number, varName: string) => {
        cy.get(`[data-testid="local-variable-name-${variableIndex}"]`).click();
        cy.get(`[data-testid="local-variable-name-input-${variableIndex}"]`).clear().type(`${varName}{enter}`);
    }

    static editLocalVariableValueExpr = (variableIndex: number,
                                         value: string, initialModelType: string,
                                         updatedModelType: string,
                                         textToBeEdited: string) => {
        cy.get(`[data-testid="local-variable-value-${variableIndex}"]`).click();
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression(initialModelType).doubleClickExpressionContent(textToBeEdited);
        InputEditor.typeInput(value);
        EditorPane.reTriggerDiagnostics(updatedModelType, value);
        StatementEditor.save();
    }

    static getLocalVariable = (varName: string) => {
        return cy.get(`[data-testid="local-var-widget-label-letExpression.${varName}"]`);
    }

    static getLocalVariablePort = (varName: string) => {
        return cy.get(`[data-testid="local-variable-port-letExpression.${varName}.OUT"]`);
    }

    static checkLocalVariables = (varNames: string[]) => {
        for (const name of varNames) {
            this.getLocalVariable(name).should('exist');
            this.getLocalVariablePort(name).should('exist');
        }
    }

    static clickEditLocalVariablesBtn = () => {
        cy.get(`[data-testid="edit-local-variables-btn"]`).click();
    }

    static selectLocalVariables = (varIndices: number[]) => {
        for (const index of varIndices) {
            cy.get(`[data-testid="select-local-variable-${index}"]`).click();
        }
    }

    static deleteSelectedLocalVariables = () => {
        cy.get(`[data-testid="delete-selected-local-variables"]`).click();
    }

    static resetZoom = () => {
        cy.get(`[data-testid="reset-zoom"]`).click();
    }

    static fitToScreen = () => {
        cy.get(`[data-testid="fit-to-screen"]`).click();
    }
}
