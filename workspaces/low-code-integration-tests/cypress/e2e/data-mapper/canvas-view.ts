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

    it("Verify expand/collapse functionality of nodes", () => {
        DataMapper.toggleSourceNodeExpand('input')
        DataMapper.toggleSourceNodeExpand('secondInput')
        DataMapper.toggleTargetNodeExpand('Output')

        DataMapper.sourcePortNotExists('input.st1');
        DataMapper.sourcePortNotExists('secondInput.st1');
        DataMapper.mappingPortNotExists('Output.Items');

        DataMapper.toggleSourceNodeExpand('input')
        DataMapper.toggleSourceNodeExpand('secondInput')
        DataMapper.toggleTargetNodeExpand('Output')

        DataMapper.sourcePortExists('input.st1');
        DataMapper.sourcePortExists('secondInput.st1');
        DataMapper.mappingPortExists('Output.Items');
    });

    it("Verify direct mappings between two valid ports", () => {
        DataMapper.createMappingUsingFields('input.st1', 'Output.st1');
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
        DataMapper.createMappingUsingPorts('input.st1', 'Output.st1');
        cy.wait(4000);
    });

    it("Create another mapping from the another source port to the same target port", () => {
        DataMapper.createMappingUsingFieldAndPort('input.st2', 'Output.st1');
        DataMapper.checkIntermediateLinks(['input.st1', 'input.st2'], 'Output.st1')
        cy.wait(4000);
    });

    it("Create a third mapping from the another source port to the same target port", () => {
        DataMapper.createMappingUsingPortAndField('input.st3', 'Output.st1');
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
        DataMapper.createMappingUsingFields('input.int1', 'Output.st1');
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
