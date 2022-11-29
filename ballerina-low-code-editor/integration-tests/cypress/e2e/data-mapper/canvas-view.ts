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

describe("Verify simple direct mappings", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getSourceNode("secondInput");
        DataMapper.getTargetNode("Output");
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMapping('input.st1', 'Output.st1');
        cy.wait(4000);
        DataMapper.linkExists('input.st1', 'Output.st1');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-basic-mapping.bal");
    });

    it("Delete mapping by clicking the delete button in the link", () => DataMapper.deleteLink('input.st1', 'Output.st1'));
})

describe("Verify multiple mappings with link connector node", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create a mapping between two ports", () => {
        DataMapper.createMapping('input.st1', 'Output.st1');
        cy.wait(4000);
    });

    it("Create another mapping from the another source port to the same target port", () => {
        DataMapper.createMapping('input.st2', 'Output.st1');
        DataMapper.checkIntermediateLinks(['input.st1', 'input.st2'], 'Output.st1')
        cy.wait(4000);
    });

    it("Create a third mapping from the another source port to the same target port", () => {
        DataMapper.createMapping('input.st3', 'Output.st1');
        DataMapper.checkIntermediateLinks(['input.st1', 'input.st2', 'input.st3'], 'Output.st1')
        cy.wait(4000);
    });

    it("Create a fourth mapping from the another source port to the port in the connector node", () => {
        DataMapper.createMappingToIntermediatePort("secondInput.st1", "input.st1 + input.st2 + input.st3");
        DataMapper.checkIntermediateLinks(['input.st1', 'input.st2', 'input.st3', "secondInput.st1"], 'Output.st1')
        cy.wait(4000);
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-link-connector.bal");
    });

    it("Delete all links one by one", () => {
        DataMapper.deleteLinksWithLinkConnector(['input.st1', 'input.st2', 'input.st3', 'secondInput.st1'], 'Output.st1')
    });
})

describe("Verify diagnostics in mapping links", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Create a mapping between an integer value and a string value", () => {
        DataMapper.createMapping('input.int1', 'Output.st1');
        cy.wait(4000);
    });

    it("Verify that the links contains diagnostics", () => {
        DataMapper.linkWithErrorExists('input.int1', 'Output.st1');
    });

    it("Delete the link with diagnostics", () => {
        DataMapper.deleteLinkWithDiagnostics('input.int1', 'Output.st1');
    });
})

describe("Verify direct value assignment in data mapper", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Assign a value directly to a field using statement editor", () => {
        DataMapper.targetNodeFieldMenuClick('Output.st1', "Add Value");
        StatementEditor.shouldBeVisible().getEditorPane();
        EditorPane.getExpression("IdentifierToken").doubleClickExpressionContent(`<add-expression>`);
        InputEditor.typeInput(`"strValue"`);
        EditorPane.reTriggerDiagnostics("StringLiteralToken", `"strValue"`)
        StatementEditor.save();
    });

    it("Verify that the value assignment is displayed", () => {
        DataMapper.directValueAssignmentExists('Output.st1', '"strValue"');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-with-direct-assignment.bal");
    });

    it("Delete the assigned value using the menu", () => {
        DataMapper.targetNodeFieldMenuClick('Output.st1', "Delete Value");
        DataMapper.directValueAssignmentNotExists('Output.st1')
    });
})

describe("Verify that asterisk mark is shown appropriately", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Asterisk mark is shown for a required field", () => DataMapper.outputLabelContains('Output.st1', "*"));

    it("Asterisk mark is not shown for an optional field", () => DataMapper.outputLabelNotContain('Output.d1', "*"));
})

describe("Primitive array field manipulation within mapping constructor", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM))
        Canvas.getDataMapper("transform").clickEdit();
    });

    it("Initialize the primitive array field", () => {
        DataMapper.arrayFieldPortEnabled('Output.stArr');
        DataMapper.targetNodeFieldMenuClick('Output.stArr', "Initialize Array");
        DataMapper.isArrayFieldInitialized('Output.stArr');
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
        DataMapper.isArrayFieldNotInitialized('Output.stArr')
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
        DataMapper.isArrayFieldInitialized('Output.Items');
        DataMapper.arrayFieldPortDisabled('Output.Items');
    });

    it("Add an element to the array field", () => {
        DataMapper.addElementToArrayField('Output.Items');
        DataMapper.checkRecordArrayFieldElement('Output.Items.0');
    });

    it("Create an invalid mapping between a string value and first record item in the array", () => {
        DataMapper.createMapping('input.st1', 'Output.Items.0');
        DataMapper.linkWithErrorExists('input.st1', 'Output.Items.0');
        DataMapper.deleteLinkWithDiagnostics('input.st1', 'Output.Items.0');
    });

    it("Create mapping between a string value and a string field of the first record item in the array", () => {
        DataMapper.addElementToArrayField('Output.Items');
        DataMapper.checkRecordArrayFieldElement('Output.Items.0');
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
        DataMapper.isArrayFieldNotInitialized('Output.Items')
    });
})