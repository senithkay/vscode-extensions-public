/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { DataMapper } from "../../utils/forms/data-mapper";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_WITH_ANYDATA_RECORD_FIELDS = "data-mapper/with-anydata.bal";

describe("Map to a record which is having anydata fields", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_ANYDATA_RECORD_FIELDS));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("Output");
    });

    it("Verify direct mappings between two string type fields", () => {
        DataMapper.createMappingUsingFields('input.str1', 'Output.str');
        cy.wait(4000);
        DataMapper.linkExists('input.str1', 'Output.str');
    });

    it("Assign a value directly to a anydata typed field using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.outputField1', "Add Value");
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`1.2`);
        EditorPane.reTriggerDiagnostics("DecimalFloatingPointLiteralToken", `1.2`);
        StatementEditor.save();
    });

    it("Navigate into expanded query view 1", () => {
        DataMapper.clickExpandQueryView('Output.anydataItems1');
        DataMapper.getQueryExprNode("source.items2Item");
        DataMapper.getTargetNode();
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingFields('items2Item.confirmed', 'qualified');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.items2Item.confirmed', 'qualified');
    });

    it("Navigate out of expanded query view", () =>  DataMapper.clickHeaderBreadcrumb(0));

    it("Navigate into expanded query view 2", () => {
        DataMapper.clickExpandQueryView('Output.items2');
        DataMapper.getQueryExprNode("source.items1Item");
        DataMapper.getTargetNode();
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingPorts('items1Item', 'outputField2.newlyAddedField');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.items1Item', 'outputField2.newlyAddedField');
    });

    it("Navigate out of expanded query view", () =>  DataMapper.clickHeaderBreadcrumb(0));

    it("Check primitive type array", () => {
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.0', '""');
        DataMapper.linkExists('input.str2', 'Output.stArr.1');
    });

    it("Create link between source node and anydata typed inner field", () => {
        DataMapper.createMappingUsingFields('input.dec', 'Output.outputField2.newlyAddedField');
        cy.wait(4000);
        DataMapper.linkExists('input.dec', 'Output.outputField2.newlyAddedField');
    });

    it("Create mapping between the anydata array element and source node", () => {
        DataMapper.createMappingUsingPorts('input.inputField', 'Output.anydataItems2.0.newlyAddedField');
        DataMapper.linkExists('input.inputField', 'Output.anydataItems2.0.newlyAddedField');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-via-records-with-anydata-type.bal");
    });
});
