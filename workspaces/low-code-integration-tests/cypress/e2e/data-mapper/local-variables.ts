/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { Canvas } from "../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";
import { DataMapper } from "../../utils/forms/data-mapper";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";

const LOCAL_VAR_BAL_FILES_DIR = "expectedBalFiles/local-variables";
const NEW_LOCAL_VARIABLES_WITH_MAPPINGS_BAL_FILE = `${LOCAL_VAR_BAL_FILES_DIR}/transform-with-new-local-variables.bal`;
const DELETED_LOCAL_VARIABLES_BAL_FILE = `${LOCAL_VAR_BAL_FILES_DIR}/deleted-local-variables.bal`;
const EXISTING_LOCAL_VARIABLES_WITH_MAPPINGS_BAL_FILE = `${LOCAL_VAR_BAL_FILES_DIR}/transform-with-existing-local-variables.bal`;
const DELETED_EXISTING_LOCAL_VARIABLES_BAL_FILE = `${LOCAL_VAR_BAL_FILES_DIR}/deleted-existing-local-variables.bal`;
const EXISTING_LOCAL_VARIABLES_N_MODULE_VARIABLES_BAL_FILE = `${LOCAL_VAR_BAL_FILES_DIR}/transform-with-existing-local-variables-and-module-variables.bal`;
const BAL_FILE_WITH_BASIC_TRANSFORM = "data-mapper/with-basic-transform.bal";

describe("Verify mappings by creating local variables", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Open local variables panel and add a local Variable", () => {
        DataMapper.clickAddLocalVariableBtn();
        DataMapper.addNewLocalVariableAtEnd();
    });

    it("Edit the local variable name", () => {
        DataMapper.editLocalVariableName(0, 'intValue1');
    });

    it("Edit the local variable value expression", () => {
        DataMapper.editLocalVariableValueExpr(0, '100', 'IdentifierToken', 'DecimalIntegerLiteralToken', `<add-expression>`);
    });

    it("Add another local variable at the beginning", () => {
        DataMapper.addNewLocalVariableAtGivenLocation(0);
    });

    it("Edit local variable name", () => {
        DataMapper.editLocalVariableName(0, 'strValue1');
    });

    it("Edit local variable value expression", () => {
        DataMapper.editLocalVariableValueExpr(0, `"sampleText"`, 'IdentifierToken', 'StringLiteralToken', `<add-expression>`);
    });

    it("Add another local variable at the middle", () => {
        DataMapper.addNewLocalVariableAtGivenLocation(1);
    });

    it("Edit local variable name", () => {
        DataMapper.editLocalVariableName(1, 'strValue2');
    });

    it("Edit local variable value expression", () => {
        DataMapper.editLocalVariableValueExpr(1, `strValue1`, 'IdentifierToken', 'IdentifierToken', `<add-expression>`);
    });

    it("Close the local variable panel and verify the variables are displayed", () => {
        DataMapper.closeLocalVariablePanel();
        DataMapper.checkLocalVariables(['intValue1', 'strValue1', 'strValue2']);
    });

    it("Create a mapping between local variable port and output port", () => {
        DataMapper.createMappingUsingFields('letExpression.strValue1', 'Output.st1', 'mappingConstructor');
        cy.wait(4000);
    });

    it("Create another mapping from input param field port to the same target port", () => {
        DataMapper.createMappingUsingPorts('input.st1', 'Output.st1', 'mappingConstructor');
        DataMapper.checkIntermediateLinks(['letExpression.strValue1', 'input.st1'], 'Output.st1');
        cy.wait(4000);
    });

    it("Create another mapping from local variable port to the port in the connector node", () => {
        DataMapper.createMappingToIntermediatePort("letExpression.strValue2", "strValue1 + input.st1");
        DataMapper.checkIntermediateLinks(['letExpression.strValue1', 'input.st1', 'letExpression.strValue2'], 'Output.st1');
        cy.wait(4000);
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + NEW_LOCAL_VARIABLES_WITH_MAPPINGS_BAL_FILE);
    });

    it("Delete links", () => {
        DataMapper.deleteLinksWithLinkConnector(['strValue1', 'input.st1', 'strValue2'], 'Output.st1');
    });

    it("Open local variables panel", () => {
        DataMapper.clickEditLocalVariablesBtn();
    });

    it("Delete local variables", () => {
        DataMapper.selectLocalVariables([0, 2]);
        DataMapper.deleteSelectedLocalVariables();
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + DELETED_LOCAL_VARIABLES_BAL_FILE);
    });

    it("Delete local variable", () => {
        DataMapper.selectLocalVariables([0]);
        DataMapper.deleteSelectedLocalVariables();
    });
});

describe("Verify mappings with existing local variables", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("localVar2Record").clickEdit();
    });

    it("Create a mapping between local variable port and output port", () => {
        DataMapper.createMappingUsingPortAndField('letExpression.secondInput.st1', 'Output.st1', 'mappingConstructor');
        cy.wait(4000);
    });

    it("Create another mapping from local variable field port to the same target port", () => {
        DataMapper.createMappingUsingFieldAndPort('letExpression.strValue1', 'Output.st1', 'mappingConstructor');
        DataMapper.checkIntermediateLinks(['letExpression.secondInput.st1', 'letExpression.strValue1'], 'Output.st1');
        cy.wait(4000);
    });

    it("Create another mapping from input param port to the port in the connector node", () => {
        DataMapper.createMappingToIntermediatePort("input.st3", "secondInput.st1 + strValue1");
        DataMapper.checkIntermediateLinks(['letExpression.secondInput.st1', 'letExpression.strValue1', 'input.st3'], 'Output.st1');
        cy.wait(4000);
    });

    it("Open local variables panel", () => {
        DataMapper.clickEditLocalVariablesBtn();
    });

    it("Add another local variable at the middle", () => {
        DataMapper.addNewLocalVariableAtGivenLocation(1);
    });

    it("Edit local variable name", () => {
        DataMapper.editLocalVariableName(1, 'strValue2');
    });

    it("Edit local variable value expression", () => {
        DataMapper.editLocalVariableValueExpr(1, `strValue1`, 'IdentifierToken', 'IdentifierToken', `<add-expression>`);
    });

    it("Edit existing local variable name", () => {
        DataMapper.editLocalVariableName(0, 'strValue1Renamed');
    });

    it("Edit existing local variable value expression", () => {
        DataMapper.editLocalVariableValueExpr(0, `"sampleTextNew"`, 'StringLiteralToken', 'StringLiteralToken', `"sampleText"`);
    });

    it("Close the local variable panel and verify the variables are displayed", () => {
        DataMapper.closeLocalVariablePanel();
        DataMapper.checkLocalVariables(['strValue1Renamed', 'strValue2', 'secondInput']);
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + EXISTING_LOCAL_VARIABLES_WITH_MAPPINGS_BAL_FILE);
    });

    it("Delete links", () => {
        DataMapper.deleteLinksWithLinkConnector(['secondInput.st1', 'strValue1Renamed', 'input.st3'], 'Output.st1');
    });

    it("Open local variables panel", () => {
        DataMapper.clickEditLocalVariablesBtn();
    });

    it("Delete local variables", () => {
        DataMapper.selectLocalVariables([1, 2]);
        DataMapper.deleteSelectedLocalVariables();
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + DELETED_EXISTING_LOCAL_VARIABLES_BAL_FILE);
    });

    it("Delete local variable", () => {
        DataMapper.selectLocalVariables([0]);
        DataMapper.deleteSelectedLocalVariables();
    });
});

describe("Verify mappings with existing local variables and module variables", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("localVar2Record").clickEdit();
    });

    it("Assign a constant to a output field using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.st1', "Add Value", 'mappingConstructor');
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`NAME`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `NAME`);
        StatementEditor.save();
    });

    it("Create another mapping from local variable field port to the same target port", () => {
        DataMapper.createMappingUsingPorts('letExpression.strValue1', 'Output.st1', 'mappingConstructor');
        DataMapper.checkIntermediateLinks(['moduleVariable.NAME', 'letExpression.strValue1'], 'Output.st1');
        cy.wait(4000);
    });

    it("Create another mapping between two record array element", () => {
        DataMapper.createMappingUsingFields("input.Items", "Output.Items", 'mappingConstructor');
        DataMapper.linkExists("input.Items", "Output.Items", 'mappingConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "Output.Items", 'mappingConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Assign a constant to a target field using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Id', "Add Value", 'mappingConstructor');
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`moduleLevelRecord.st1`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `st1`);
        StatementEditor.save();
    });

    it("Create another mapping between source nodes and target node", () => {
        DataMapper.createMappingUsingFields('letExpression.secondInput.st1', 'Id', 'mappingConstructor');
        DataMapper.checkIntermediateLinks(['moduleVariable.moduleLevelRecord.st1', 'letExpression.secondInput.st1'], 'Id');
        cy.wait(4000);
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + EXISTING_LOCAL_VARIABLES_N_MODULE_VARIABLES_BAL_FILE);
    });

    it("Delete links", () => {
        DataMapper.deleteLinksWithLinkConnector(['moduleLevelRecord.st1', 'secondInput.st1'], 'Id');
    });

    it("Navigate out of expanded query view", () => DataMapper.clickHeaderBreadcrumb(0));

    it("Delete links", () => {
        DataMapper.deleteLinksWithLinkConnector(['NAME', 'strValue1'], 'Output.st1');
        DataMapper.deleteQueryLink('input.Items', 'Output.Items');
    });
});
