/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Canvas } from "../../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test mapping constructor functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add Mapping Constructor With Input-Editor And Add New Fields', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("map<int>");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("{}");

        EditorPane
            .validateEmptyDiagnostics();

        EditorPane
            .clickPlusButton();

        EditorPane
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent(`key`);

        InputEditor
            .typeInput("k1");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("1");

        EditorPane
            .validateNewExpression("NumericLiteral", "1")
            .reTriggerDiagnostics("NumericLiteral", "1")

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "mapping-constructor.expected.bal");

    });
})
