/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import { Canvas } from "../../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";
import { ParameterTab } from "../../../utils/components/statement-editor/parameter-tab";

const BAL_FILE_PATH = "block-level/statement-editor/add-function-call-to-function.bal";

describe('Test helper plane parameter tab functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Call functions form a function', () => {
        // Add function call with zero arguments
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('emptyFun()');

        ParameterTab.shouldBeFocused();

        EditorPane
            .getExpression("CaptureBindingPattern")
            .doubleClickExpressionContent(`variable`);

        InputEditor
            .typeInput("fun");

        StatementEditor
            .save();

        // Add function call with required and defaultable argument with record inclusion
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('fooFun(string str, int n, Student student)');

        ParameterTab
            .shouldBeFocused()
            .shouldHaveRequiredArg("str")
            .shouldHaveOptionalArg("n")
            .shouldHaveOptionalArg("student")
            .toggleOptionalArg("student");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-str>`);

        InputEditor
            .typeInput('"str"');

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-n>`);

        InputEditor
            .typeInput("0");

        EditorPane
            .validateNewExpression("NumericLiteral", "0")
            .reTriggerDiagnostics("NumericLiteral", "0");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-function-call-to-function.expected.bal");

    });
});
