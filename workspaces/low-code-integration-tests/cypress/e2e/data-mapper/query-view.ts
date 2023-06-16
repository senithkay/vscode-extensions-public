/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

const QUERY_VIEW_BAL_FILES_DIR = "expectedBalFiles/query-view";
const DEFINED_RECORD_BAL_FILE = `${QUERY_VIEW_BAL_FILES_DIR}/transform-with-expanded-query-view-for-defined-record.bal`;
const INLINE_RECORD_BAL_FILE = `${QUERY_VIEW_BAL_FILES_DIR}/transform-with-expanded-query-view-for-inline-record.bal`;
const INITIAL_BAL_FILE = "data-mapper/query-view.bal";

describe("Expanded query view for inline record within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(INITIAL_BAL_FILE));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create mapping between two record array element", () => {
        DataMapper.createMappingUsingFields("input.Items", "Output.Items");
        DataMapper.linkExists("input.Items", "Output.Items");
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "Output.Items", 'mappingConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Add an intermediary where clause", () => {
        DataMapper.addIntermediaryClause(-1, "Add where clause");
        DataMapper.clickIntermediateExpression(0);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`);
        StatementEditor.save();
    });

    it("Add an intermediary let clause with a string value", () => {
        DataMapper.addIntermediaryClause(0, "Add let clause");
        DataMapper.clickIntermediateExpression(1);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`"strValue"`);
        EditorPane.reTriggerDiagnostics("StringLiteralToken", `"strValue"`);
        StatementEditor.save();
        DataMapper.getQueryExprNode("source.variable");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingFields("ItemsItem.Id", "Id");
        cy.wait(4000);
        DataMapper.createMappingFromQueryExprUsingPorts("variable", "Id");
        DataMapper.checkIntermediateLinks(
            ["expandedQueryExpr.source.ItemsItem.Id", "expandedQueryExpr.source.variable"],
            "Id"
        );
    });

    it("Rename let clause variable name", () => {
        DataMapper.updateLetVariableName(1, "updatedName");
        DataMapper.getQueryExprNode("source.updatedName");
    });

    it("Add an intermediary limit clause with a value", () => {
        cy.wait(3000);
        DataMapper.addIntermediaryClause(1, "Add limit clause");
        DataMapper.clickIntermediateExpression(2);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`10`);
        EditorPane.reTriggerDiagnostics("DecimalIntegerLiteralToken", `10`);
        StatementEditor.save();
    });

    it("Add an intermediary order by clause with a value", () => {
        cy.wait(3000);
        DataMapper.addIntermediaryClause(2, "Add order by clause");
        DataMapper.clickIntermediateExpression(3);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`ItemsItem.Id`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `ItemsItem`);
        StatementEditor.save();
    });

    it("Add an intermediary join clause", () => {
        cy.wait(3000);
        DataMapper.addIntermediaryClause(3, "Add join clause");

        DataMapper.clickIntermediateExpression(4);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`users`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `users`);
        StatementEditor.save();
    });

    it("Update on expression of Join clause", () => {
        cy.wait(3000);
        DataMapper.clickJoinOnExpression(4);
        EditorPane.doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`ItemsItem.Id`);
        EditorPane.reTriggerDiagnostics("IdentifierToken", `ItemsItem`);
        StatementEditor.save();
    });

    it("Update equals expression of Join clause", () => {
        cy.wait(3000);
        DataMapper.clickJoinEqualsExpression(4);
        EditorPane.doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`variable.id`); //rename
        EditorPane.reTriggerDiagnostics("IdentifierToken", `variable`);
        StatementEditor.save();
    });

    it("Create links between join clause node and target node", () => {
        DataMapper.createMappingFromQueryExprUsingFieldAndPort("variable.id", "Id");
        cy.wait(4000);
        DataMapper.checkIntermediateLinks(
            [
                "expandedQueryExpr.source.ItemsItem.Id",
                "expandedQueryExpr.source.updatedName",
                "expandedQueryExpr.source.variable.id",
            ],
            "Id"
        );
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + INLINE_RECORD_BAL_FILE);
    });

    it("Delete intermediate clauses", () => {
        DataMapper.deleteIntermediateWhereClause(0);
        DataMapper.deleteIntermediateLetClause(0);
        DataMapper.getQueryExprNode("source.updatedName").should("not.exist");
    });

    it("Navigate out of expanded query view", () => DataMapper.clickHeaderBreadcrumb(0));

    it("Delete query link", () => DataMapper.deleteQueryLink('input.Items', 'Output.Items'));
});

describe("Expanded query view for defined record within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(INITIAL_BAL_FILE));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create mapping between two record array element", () => {
        DataMapper.createMappingUsingFields('input.Items', 'Output.innerOutput');
        DataMapper.linkExists('input.Items', 'Output.innerOutput');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction('input.Items', 'Output.innerOutput', 'mappingConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView('Output.innerOutput');
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor", "InnerOutput");
    });

    it("Add an intermediary where clause", () => {
        DataMapper.addIntermediaryClause(-1, 'Add where clause');
        DataMapper.clickIntermediateExpression(0);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`);
        StatementEditor.save();
    });

    it("Add an intermediary let clause with a string value", () => {
        DataMapper.addIntermediaryClause(0, 'Add let clause');
        DataMapper.clickIntermediateExpression(1);
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`"strValue"`);
        EditorPane.reTriggerDiagnostics("StringLiteralToken", `"strValue"`);
        StatementEditor.save();
        DataMapper.getQueryExprNode("source.variable");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingPortAndField('ItemsItem.Id', 'InnerOutput.st1');
        cy.wait(4000);
        DataMapper.createMappingFromQueryExprUsingFields('variable', 'InnerOutput.st1');
        DataMapper.checkIntermediateLinks(['expandedQueryExpr.source.ItemsItem.Id', 'expandedQueryExpr.source.variable'], 'InnerOutput.st1')
    });

    it("Rename let clause variable name", () => {
        DataMapper.updateLetVariableName(1, 'updatedName');
        DataMapper.getQueryExprNode("source.updatedName");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + DEFINED_RECORD_BAL_FILE);
    });

    it("Delete intermediate clauses", () => {
        DataMapper.deleteIntermediateWhereClause(0);
        DataMapper.deleteIntermediateLetClause(0);
        DataMapper.getQueryExprNode("source.updatedName").should('not.exist');
    });

    it("Navigate out of expanded query view", () =>  DataMapper.clickHeaderBreadcrumb(0));

    it("Delete query link", () => DataMapper.deleteQueryLink('input.Items', 'Output.innerOutput'));
})


describe("Verify input & output search", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(INITIAL_BAL_FILE));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create mapping between two record array element", () => {
        DataMapper.createMappingUsingFields("input.Items", "Output.Items", "mappingConstructor");
        DataMapper.linkExists("input.Items", "Output.Items", "mappingConstructor");
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "Output.Items", "mappingConstructor");
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Verify input search", () => {
        DataMapper.searchInput('id');
        DataMapper.sourcePortExists('expandedQueryExpr.source.ItemsItem.Id');
        DataMapper.sourcePortNotExists('expandedQueryExpr.source.Confirmed');
    });

    it("Verify output search", () => {
        DataMapper.searchOutput('id');
        DataMapper.mappingPortExists("mappingConstructor", 'Id');
        DataMapper.mappingPortNotExists("mappingConstructor", 'Confirmed');
    });
})
