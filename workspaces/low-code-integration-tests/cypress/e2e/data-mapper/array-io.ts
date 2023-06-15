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
import { SuggestionsPane } from "../../utils/components/statement-editor/suggestions-pane";

const ARRAY_IO_BAL_FILES_DIR = "expectedBalFiles/array-io";
const PRIMITIVE_ARRAY_TO_PRIMITIVE_ARRAY_ELEMENT_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-primitive-array-to-primitive-array-element.bal`;
const PRIMITIVE_ARRAY_TO_PRIMITIVE_ARRAY_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-primitive-array-to-primitive-array.bal`;
const RECORD_FIELD_TO_PRIMITIVE_ARRAY_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-record-field-to-primitive-array.bal`;
const RECORD_FIELD_TO_RECORD_ARRAY_ELEMENT_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-record-field-to-record-array-element.bal`;
const RECORD_ARRAY_TO_RECORD_ARRAY_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-record-array-to-record-array.bal`;
const RECORD_TO_2D_RECORD_ARRAY_BAL_FILE =
    `${ARRAY_IO_BAL_FILES_DIR}/transform-record-to-2D-record-array.bal`;
const BAL_FILE_WITH_BASIC_TRANSFORM = "data-mapper/with-basic-transform.bal";

describe("Verify mappings between primitive type array and primitive type array element", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("primitiveArray2PrimitiveArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("names");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Add an element to the output array", () => {
        DataMapper.addElementToArrayField('array', 'listConstructor');
        DataMapper.checkPrimitiveArrayFieldElementValue('array.0', '""', 'listConstructor');
    });

    it("Add another element to the output array", () => {
        DataMapper.addElementToArrayField('array', 'listConstructor');
        DataMapper.checkPrimitiveArrayFieldElementValue('array.1', '""', 'listConstructor');
    });

    it("Create mapping between the first array element and source node", () => {
        DataMapper.createMappingUsingFields('names', 'array.0', 'listConstructor');
        DataMapper.linkExists('names', 'array.0', 'listConstructor');
    });

    it("Edit value of the first element using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('array.0', "Edit Value", 'listConstructor');
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").clickExpressionContent(`names`);
        SuggestionsPane.clickLsSuggestion('pop()');
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`pop`);
        InputEditor.escapeInput();
        StatementEditor.save();
        DataMapper.checkPrimitiveArrayFieldElementValue('array.0', `names.pop()`, 'listConstructor');
    });

    it("Verify expand/collapse functionality of nodes", () => {
        DataMapper.toggleTargetNodeExpand('array', 'listConstructor');
        DataMapper.isArrayFieldNotExists('array', 'listConstructor');

        DataMapper.toggleTargetNodeExpand('array', 'listConstructor');
        DataMapper.isArrayFieldExists('array', 'listConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder()
            + PRIMITIVE_ARRAY_TO_PRIMITIVE_ARRAY_ELEMENT_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () => {
        DataMapper.deleteLinksWithLinkConnector(['names.pop()'], 'array.0');
        DataMapper.checkPrimitiveArrayFieldElementValue('array.0', '""', 'listConstructor');
    });

    it("Delete second element of the array", () => {
        DataMapper.targetNodeFieldMenuClick('array.1', "Delete Element", 'listConstructor');
        DataMapper.isArrayFieldNotExists('array.1', 'listConstructor');
    });

    it("Delete first element of the array", () => {
        DataMapper.targetNodeFieldMenuClick('array.0', "Delete Element", 'listConstructor');
        DataMapper.isArrayFieldNotExists('array.0', 'listConstructor');
    });
});

describe("Verify mappings between primitive type array and primitive type array via query expression", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("primitiveArray2PrimitiveArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("names");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMappingUsingFields('names', 'array', 'listConstructor');
        cy.wait(4000);
        DataMapper.linkExists('names', 'array', 'listConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("names", "array", 'listConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("array");
        DataMapper.getQueryExprNode("source.namesItem");
        DataMapper.getTargetNode("primitiveType");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingFields('namesItem', 'string', 'primitiveType');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.namesItem', 'string', 'primitiveType');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + PRIMITIVE_ARRAY_TO_PRIMITIVE_ARRAY_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteLink('expandedQueryExpr.source.namesItem', 'string', 'primitiveType'));
});

describe("Verify mappings between record fields and primitive type array via query expression", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("record2PrimitiveArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMappingUsingPorts('input.Items', 'array', 'listConstructor');
        cy.wait(4000);
        DataMapper.linkExists('input.Items', 'array', 'listConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "array", 'listConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("array");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("primitiveType");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingPorts('ItemsItem.count', 'int', 'primitiveType');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.ItemsItem.count', 'int', 'primitiveType');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + RECORD_FIELD_TO_PRIMITIVE_ARRAY_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteLink('expandedQueryExpr.source.ItemsItem.count', 'int', 'primitiveType'));
});

describe("Verify mappings between record field and record type array element", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("record2RecordArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Add an element to the output array", () => {
        DataMapper.addElementToArrayField('array', 'listConstructor');
        DataMapper.getRecordArrayFieldElement('array.0.Output', 'listConstructor');
    });

    it("Create mapping between array element field and source node", () => {
        DataMapper.createMappingUsingFieldAndPort('input.Items', 'array.0.Output.Items', 'listConstructor');
        DataMapper.linkExists('input.Items', 'array.0.Output.Items', 'listConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "array.0.Output.Items", 'listConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("array.0.Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Create links between source nodes and target node", () => {
        DataMapper.createMappingFromQueryExprUsingPortAndField('ItemsItem.Id', 'Id', 'mappingConstructor');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder()
            + RECORD_FIELD_TO_RECORD_ARRAY_ELEMENT_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteLink('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor'));
});

describe("Verify mappings between input record array and output record array via query expression", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("recordArray2RecordArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMappingUsingPortAndField('input', 'array', 'listConstructor');
        cy.wait(4000);
        DataMapper.linkExists('input', 'array', 'listConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input", "array", 'listConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("array");
        DataMapper.getQueryExprNode("source.inputItem");
        DataMapper.getTargetNode("mappingConstructor", "Output");
    });

    it("Create mapping between source port and target port", () => {
        DataMapper.createMappingFromQueryExprUsingFields('inputItem.st1', 'Output.st1', 'mappingConstructor');
        cy.wait(4000);
    });

    it("Create another mapping from the another source port to the same target port", () => {
        DataMapper.createMappingFromQueryExprUsingPorts('inputItem.st2', 'Output.st1', 'mappingConstructor');
        DataMapper.checkIntermediateLinks(['expandedQueryExpr.source.inputItem.st1', 'expandedQueryExpr.source.inputItem.st2'], 'Output.st1');
        cy.wait(4000);
    });

    it("Create mapping between source port of an array field and target port of an array field", () => {
        DataMapper.createMappingFromQueryExprUsingFields('inputItem.Items', 'Output.Items', 'mappingConstructor');
        cy.wait(4000);
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("expandedQueryExpr.source.inputItem.Items", "Output.Items", 'mappingConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Create mapping between source port and target port", () => {
        DataMapper.createMappingFromQueryExprUsingFieldAndPort('ItemsItem.Id', 'Id', 'mappingConstructor');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + RECORD_ARRAY_TO_RECORD_ARRAY_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteLink('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor'));

    it("Navigate out of expanded query view", () => DataMapper.clickHeaderBreadcrumb(1));

    it("Delete all links one by one", () => {
        DataMapper.deleteLinksWithLinkConnector(['inputItem.st1', 'inputItem.st2'], 'Output.st1');
        DataMapper.deleteQueryLink('inputItem.Items', 'Output.Items');
    });

    it("Navigate out of expanded query view", () => DataMapper.clickHeaderBreadcrumb(0));

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteQueryLink('input', 'array'));
});

describe("Verify mappings between input record field and output 2D record array", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("record2Record2DArray").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Add an element to the output array", () => {
        DataMapper.addElementToArrayField('array', 'listConstructor');
        DataMapper.getRecordArrayFieldElement('array.0', 'listConstructor');
    });

    it("Add an element to the inner array", () => {
        DataMapper.addElementToArrayField('array.0', 'listConstructor');
        DataMapper.getRecordArrayFieldElement('array.0.0.Output', 'listConstructor');
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMappingUsingPorts('input.Items', 'array.0.0.Output.Items', 'listConstructor');
        cy.wait(4000);
        DataMapper.linkExists('input.Items', 'array.0.0.Output.Items', 'listConstructor');
    });

    it("Convert link into query using code action", () => {
        DataMapper.clickLinkCodeAction("input.Items", "array.0.0.Output.Items", 'listConstructor');
    });

    it("Navigate into expanded query view", () => {
        DataMapper.clickExpandQueryView("array.0.0.Output.Items");
        DataMapper.getQueryExprNode("source.ItemsItem");
        DataMapper.getTargetNode("mappingConstructor");
    });

    it("Create mapping between source port and target port", () => {
        DataMapper.createMappingFromQueryExprUsingFields('ItemsItem.Id', 'Id', 'mappingConstructor');
        cy.wait(4000);
        DataMapper.linkExists('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + RECORD_TO_2D_RECORD_ARRAY_BAL_FILE);
    });

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteLink('expandedQueryExpr.source.ItemsItem.Id', 'Id', 'mappingConstructor'));

    it("Navigate out of expanded query view", () => DataMapper.clickHeaderBreadcrumb(0));

    it("Delete mapping by clicking the delete button in the link", () =>
        DataMapper.deleteQueryLink('input.Items', 'array.0.0.Output.Items'));

    it("Delete outer array", () =>
        DataMapper.targetNodeFieldMenuClick('array.0', "Delete Array", 'listConstructor'));

});
