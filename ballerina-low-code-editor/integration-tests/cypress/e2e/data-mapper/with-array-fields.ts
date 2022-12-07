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

describe("Primitive array field manipulation within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Initialize the primitive array field", () => {
        DataMapper.arrayFieldPortEnabled('Output.stArr');
        DataMapper.targetNodeFieldMenuClick('Output.stArr', "Initialize Array");
        DataMapper.isArrayFieldExists('Output.stArr');
        DataMapper.arrayFieldPortDisabled('Output.stArr');
    });

    it("Add an element to the array field", () => {
        DataMapper.addElementToArrayField('Output.stArr');
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.0', '""');
    });

    it("Create mapping between the first array element and source node", () => {
        DataMapper.createMapping('input.st1', 'Output.stArr.0');
        DataMapper.linkExists('input.st1', 'Output.stArr.0');
    });

    it("Add another element to the array field", () => {
        DataMapper.addElementToArrayField('Output.stArr')
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.1', '""');
    });

    it("Verify expand/collapse functionality in array field", () => {
        DataMapper.toggleArrayFieldExpand('Output.stArr')
        DataMapper.isArrayFieldNotExists('Output.stArr')
        DataMapper.toggleArrayFieldExpand('Output.stArr')
        DataMapper.isArrayFieldExists('Output.stArr');
    });

    it("Edit value of the second element using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.stArr.1', "Edit Value");
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("StringLiteralToken").doubleClickExpressionContent(`""`);
        InputEditor.typeInput(`"strValue"`);
        StatementEditor.save();
        DataMapper.checkPrimitiveArrayFieldElementValue('Output.stArr.1', `"strValue"`);
    });
    
    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-primitive-array-field.bal");
    });

    it("Delete link between the input node and the second array element", () => DataMapper.deleteLink('input.st1', 'Output.stArr.0'));

    it("Delete first element of the array field", () => DataMapper.targetNodeFieldMenuClick('Output.stArr.0', "Delete Element"));
    
    it("Delete array assignment for the array field", () => {
        DataMapper.targetNodeFieldMenuClick('Output.stArr', "Delete Array");
        DataMapper.isArrayFieldNotExists('Output.stArr')
    });
})


describe("Record type array field manipulation within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Initialize the record type array field", () => {
        DataMapper.arrayFieldPortEnabled('Output.Items');
        DataMapper.targetNodeFieldMenuClick('Output.Items', "Initialize Array");
        DataMapper.isArrayFieldExists('Output.Items');
        DataMapper.arrayFieldPortDisabled('Output.Items');
    });

    it("Verify expand/collapse functionality in array field", () => {
        DataMapper.toggleArrayFieldExpand('Output.Items')
        DataMapper.isArrayFieldNotExists('Output.Items')
        DataMapper.toggleArrayFieldExpand('Output.Items')
        DataMapper.isArrayFieldExists('Output.Items');
    });

    it("Add an element to the array field", () => {
        DataMapper.addElementToArrayField('Output.Items');
        DataMapper.getRecordArrayFieldElement('Output.Items.0');
    });

    it("Verify expand/collapse functionality of record element in array", () => {
        DataMapper.toggleRecordFieldExpand('Output.Items.0')
        DataMapper.mappingPortNotExists('Output.Items.0.Id')
        DataMapper.toggleRecordFieldExpand('Output.Items.0')
        DataMapper.mappingPortExists('Output.Items.0.Id')
    });

    it("Create an invalid mapping between a string value and first record item in the array", () => {
        DataMapper.createMapping('input.st1', 'Output.Items.0');
        DataMapper.linkWithErrorExists('input.st1', 'Output.Items.0');
        DataMapper.deleteLinkWithDiagnostics('input.st1', 'Output.Items.0');
    });

    it("Create mapping between a string value and a string field of the first record item in the array", () => {
        DataMapper.addElementToArrayField('Output.Items');
        DataMapper.getRecordArrayFieldElement('Output.Items.0');
        DataMapper.createMapping('input.st1', 'Output.Items.0.Id');
        DataMapper.linkExists('input.st1', 'Output.Items.0.Id');
    });

    it("Edit value of the second element using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.Items.0.Confirmed', "Add Value");
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`true`);
        EditorPane.reTriggerDiagnostics("TrueKeyword", `true`)
        StatementEditor.save();
        DataMapper.checkRecordArrayFieldElementValue('Output.Items.0.Confirmed', `true`);
    });
    
    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-record-array-field.bal");
    });

    it("Delete link between the input node and the second array element", () => DataMapper.deleteLink('input.st1', 'Output.Items.0.Id'));

    it("Delete first element of the array field", () => DataMapper.targetNodeFieldMenuClick('Output.Items.0.Confirmed', "Delete Value"));
    
    it("Delete array assignment for the array field", () => {
        DataMapper.targetNodeFieldMenuClick('Output.Items', "Delete Array");
        DataMapper.isArrayFieldNotExists('Output.Items')
    });
})
