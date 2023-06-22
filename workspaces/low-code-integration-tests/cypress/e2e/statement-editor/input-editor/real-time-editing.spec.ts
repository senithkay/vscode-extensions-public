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

describe('Test statement editor real-time code changes', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add variable declaration and save', () => {
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

        SourceCode.shouldHave("var variable = EXPRESSION;");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("10");

        SourceCode.shouldHave("var variable = 10;");

        EditorPane
            .reTriggerDiagnostics("NumericLiteral", "10");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "real-time-editing.expected.bal");

    });

    it('Add variable declaration and cancel', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible();

        SourceCode.shouldHave("var variable = EXPRESSION;");

        StatementEditor
            .cancel();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "real-time-editing-no-change.expected.bal");

    });

    it('Edit variable declaration statement and save', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        SourceCode.shouldHave("int var2 = 2;");

        EditorPane
            .getExpression("DecimalIntegerLiteralToken")
            .doubleClickExpressionContent("2");

        InputEditor
            .typeInput("10");

        SourceCode.shouldHave("int var2 = 10;");

        EditorPane
            .reTriggerDiagnostics("NumericLiteral", "10");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "real-time-editing-updated.expected.bal");
    });

    it('Edit variable declaration statement and cancel', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible();

        SourceCode.shouldHave("int var2 = 2;");

        StatementEditor
            .cancel();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "real-time-editing-no-change.expected.bal");
    });
});
