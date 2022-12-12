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

import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { DataMapper } from "../../utils/forms/data-mapper";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_WITH_BASIC_TRANSFORM = "data-mapper/with-basic-transform.bal";

describe("Expanded query view for inline record within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create mapping between two record array element", () => {
        DataMapper.createMapping('input.Items', 'Output.Items');
        DataMapper.linkExists('input.Items', 'Output.Items');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction('input.Items', 'Output.Items');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView('Output.Items');
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode();
    });

    it("Add an intermediary where clause", () => {
        DataMapper.addIntermediaryClause(-1, 'Add Where Clause');
        DataMapper.clickWhereExpression(0);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`)
        StatementEditor.save();
    });

    it("Add an intermediary let clause with a string value", () => {
        DataMapper.addIntermediaryClause(0, 'Add Let Clause');
        DataMapper.clickLetExpression(1);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`"strValue"`);
        EditorPane.reTriggerDiagnostics("StringLiteralToken", `"strValue"`)
        StatementEditor.save();
        DataMapper.getQueryExprNode("source.variable");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExpression('ItemsItem.Id', 'Id');
        cy.wait(4000);
        DataMapper.createMappingFromQueryExpression('variable', 'Id');
        DataMapper.checkIntermediateLinks(['expandedQueryExpr.source.ItemsItem.Id', 'expandedQueryExpr.source.variable'], 'Id')
    });

    it("Rename let clause variable name", () => {
        DataMapper.updateLetVariableName(1, 'updatedName');
        DataMapper.getQueryExprNode("source.updatedName");
    });

    it("Add an intermediary limit clause with a value", () => {
        cy.wait(3000);
        DataMapper.addIntermediaryClause(1, 'Add Limit Clause');
        DataMapper.clickLimitExpression(2);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`10`);
        EditorPane.reTriggerDiagnostics("DecimalIntegerLiteralToken", `10`)
        StatementEditor.save();
    });

    it("Add an intermediary order by clause with a value", () => {
        cy.wait(3000);
        DataMapper.addIntermediaryClause(2, 'Add Order by Clause');
        DataMapper.clickOrderByExpression(3);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`ItemsItem.Id`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `ItemsItem`)
        StatementEditor.save();
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-expanded-query-view-for-inline-record.bal");
    });

    it("Delete intermediate clauses", () => {
        DataMapper.deleteIntermediateWhereClause(0);
        DataMapper.deleteIntermediateLetClause(0);
        DataMapper.getQueryExprNode("source.updatedName").should('not.exist');
    });

    it("Navigate out of expanded query view", () =>  DataMapper.clickHeaderBreadcrumb(0));

    it("Delete query link", () => DataMapper.deleteQueryLink('input.Items', 'Output.Items'));
})

describe("Expanded query view for defined record within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create mapping between two record array element", () => {
        DataMapper.createMapping('input.Items', 'Output.innerOutput');
        DataMapper.linkExists('input.Items', 'Output.innerOutput');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction('input.Items', 'Output.innerOutput');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView('Output.innerOutput');
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("InnerOutput");
    });

    it("Add an intermediary where clause", () => {
        DataMapper.addIntermediaryClause(-1, 'Add Where Clause');
        DataMapper.clickWhereExpression(0);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`)
        StatementEditor.save();
    });

    it("Add an intermediary let clause with a string value", () => {
        DataMapper.addIntermediaryClause(0, 'Add Let Clause');
        DataMapper.clickLetExpression(1);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`"strValue"`);
        EditorPane.reTriggerDiagnostics("StringLiteralToken", `"strValue"`)
        StatementEditor.save();
        DataMapper.getQueryExprNode("source.variable");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExpression('ItemsItem.Id', 'InnerOutput.st1');
        cy.wait(4000);
        DataMapper.createMappingFromQueryExpression('variable', 'InnerOutput.st1');
        DataMapper.checkIntermediateLinks(['expandedQueryExpr.source.ItemsItem.Id', 'expandedQueryExpr.source.variable'], 'InnerOutput.st1')
    });

    it("Rename let clause variable name", () => {
        DataMapper.updateLetVariableName(1, 'updatedName');
        DataMapper.getQueryExprNode("source.updatedName");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-expanded-query-view-for-defined-record.bal");
    });

    it("Delete intermediate clauses", () => {
        DataMapper.deleteIntermediateWhereClause(0);
        DataMapper.deleteIntermediateLetClause(0);
        DataMapper.getQueryExprNode("source.updatedName").should('not.exist');
    });

    it("Navigate out of expanded query view", () =>  DataMapper.clickHeaderBreadcrumb(0));

    it("Delete query link", () => DataMapper.deleteQueryLink('input.Items', 'Output.innerOutput'));
})
