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

const WITH_ARRAY_FIELDS_BAL_FILES_DIR = "expectedBalFiles/with-array-fields";
const PRIMITIVE_ARRAY_FIELD_BAL_FILE = `${WITH_ARRAY_FIELDS_BAL_FILES_DIR}/transform-with-primitive-array-field.bal`;
const RECORD_ARRAY_FIELD_BAL_FILE = `${WITH_ARRAY_FIELDS_BAL_FILES_DIR}/transform-with-record-array-field.bal`;
const BAL_FILE_WITH_BASIC_TRANSFORM = "data-mapper/with-basic-transform.bal";

describe("Primitive array field manipulation within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Initialize the primitive array field", () => {
        DataMapper.arrayFieldPortEnabled('Output.stArr');
        DataMapper.targetNodeFieldMenuClick('Output.stArr', "Initialize Array", 'mappingConstructor');
        DataMapper.isArrayFieldExists('Output.stArr', 'mappingConstructor');
        DataMapper.arrayFieldPortDisabled('Output.stArr');
    });

    it("Add an element to the array field", () => {
        DataMapper.addElementToArrayField('Output.stArr', 'mappingConstructor');
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.0', '""', 'mappingConstructor');
    });

    it("Create mapping between the first array element and source node", () => {
        DataMapper.createMappingUsingFields('input.st1', 'Output.stArr.0');
        DataMapper.linkExists('input.st1', 'Output.stArr.0');
    });

    it("Add another element to the array field", () => {
        DataMapper.addElementToArrayField('Output.stArr', 'mappingConstructor');
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.1', '""', 'mappingConstructor');
    });

    it("Verify expand/collapse functionality in array field", () => {
        DataMapper.toggleArrayFieldExpand('Output.stArr', 'mappingConstructor');
        DataMapper.isArrayFieldNotExists('Output.stArr', 'mappingConstructor');
        DataMapper.toggleArrayFieldExpand('Output.stArr', 'mappingConstructor');
        DataMapper.isArrayFieldExists('Output.stArr', 'mappingConstructor');
    });

    it("Edit value of the second element using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.stArr.1', "Edit Value", 'mappingConstructor');
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("StringLiteralToken").doubleClickExpressionContent(`""`);
        InputEditor.typeInput(`"strValue"`);
        StatementEditor.save();
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.1', `"strValue"`, 'mappingConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + PRIMITIVE_ARRAY_FIELD_BAL_FILE);
    });

    it("Delete link between the input node and the first array element", () => {
        DataMapper.deleteLink('input.st1', 'Output.stArr.0', 'mappingConstructor');
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.0', '""', 'mappingConstructor');
    });

    it("Delete first element of the array field", () =>
        DataMapper.targetNodeFieldMenuClick('Output.stArr.0', "Delete Element", 'mappingConstructor'));

    it("Delete array assignment for the array field", () => {
        DataMapper.targetNodeFieldMenuClick('Output.stArr', "Delete Array", 'mappingConstructor');
        DataMapper.isArrayFieldNotExists('Output.stArr', 'mappingConstructor');
    });
});


describe("Record type array field manipulation within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM));
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Initialize the record type array field", () => {
        DataMapper.arrayFieldPortEnabled('Output.Items');
        DataMapper.targetNodeFieldMenuClick('Output.Items', "Initialize Array", 'mappingConstructor');
        DataMapper.isArrayFieldExists('Output.Items', 'mappingConstructor');
        DataMapper.arrayFieldPortDisabled('Output.Items');
    });

    it("Verify expand/collapse functionality in array field", () => {
        DataMapper.toggleArrayFieldExpand('Output.Items', 'mappingConstructor');
        DataMapper.isArrayFieldNotExists('Output.Items', 'mappingConstructor');
        DataMapper.toggleArrayFieldExpand('Output.Items', 'mappingConstructor');
        DataMapper.isArrayFieldExists('Output.Items', 'mappingConstructor');
    });

    it("Add an element to the array field", () => {
        DataMapper.addElementToArrayField('Output.Items', 'mappingConstructor');
        DataMapper.getRecordArrayFieldElement('Output.Items.0', 'mappingConstructor');
    });

    it("Verify expand/collapse functionality of record element in array", () => {
        DataMapper.toggleRecordFieldExpand('Output.Items.0');
        DataMapper.mappingPortNotExists('mappingConstructor', 'Output.Items.0.Id');
        DataMapper.toggleRecordFieldExpand('Output.Items.0');
        DataMapper.mappingPortExists('mappingConstructor', 'Output.Items.0.Id');
    });

    it("Create an invalid mapping between a string value and first record item in the array", () => {
        DataMapper.createMappingUsingFields('input.st1', 'Output.Items.0');
        DataMapper.linkWithErrorExists('input.st1', 'Output.Items.0');
        DataMapper.deleteLinkWithDiagnostics('input.st1', 'Output.Items.0');
    });

    it("Create mapping between a string value and a string field of the first record item in the array", () => {
        DataMapper.addElementToArrayField('Output.Items');
        DataMapper.getRecordArrayFieldElement('Output.Items.0');
        DataMapper.createMappingUsingFields('input.st1', 'Output.Items.0.Id');
        DataMapper.linkExists('input.st1', 'Output.Items.0.Id');
    });

    it("Edit value of the second element using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.Items.0.Confirmed', "Add Value", 'mappingConstructor');
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`);
        StatementEditor.save();
        DataMapper.checkRecordArrayFieldElementValue('Output.Items.0.Confirmed', `true`);
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + RECORD_ARRAY_FIELD_BAL_FILE);
    });

    it("Delete link between the input node and the second array element", () =>
        DataMapper.deleteLink('input.st1', 'Output.Items.0.Id', 'mappingConstructor'));

    it("Delete first element of the array field", () =>
        DataMapper.targetNodeFieldMenuClick('Output.Items.0.Confirmed', "Delete Value", 'mappingConstructor'));

    it("Delete array assignment for the array field", () => {
        DataMapper.targetNodeFieldMenuClick('Output.Items', "Delete Array", 'mappingConstructor');
        DataMapper.isArrayFieldNotExists('Output.Items', 'mappingConstructor');
    });
});
