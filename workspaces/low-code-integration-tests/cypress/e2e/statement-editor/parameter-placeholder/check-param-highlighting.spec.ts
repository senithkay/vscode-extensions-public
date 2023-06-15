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

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test parameter highlighting in function call', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Check parameter highlighting via selection', () => {
        // Check parameter highlighting via selection
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .validateNewExpression("SimpleNameReference", `<add-expression>`)
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Libraries")
            .clickLibrarySuggestion('lang.string')
            .clickSearchedLibSuggestion('lang.string:indexOf');

        ParameterTab
            .shouldBeFocused()
            .shouldHaveRequiredArg("str")
            .shouldHaveRequiredArg("substr")
            .shouldHaveOptionalArg("startIndex")
            .shouldHavecheckboxDisabled("str");

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-str>`);

        ParameterTab
            .shouldHaveParameterSelected("str");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-str>`);

        InputEditor
            .typeInput('"Message"');

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-substr>`);

        InputEditor
            .typeInput('"age"');

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-startIndex>`);

        ParameterTab
            .shouldHaveParameterSelected("startIndex")
            .toggleOptionalArg("startIndex");

        EditorPane
            .validateNewExpression("StringLiteral", '"age"')
            .reTriggerDiagnostics("StringLiteral", '"age"')
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "check-param-highlighting.expected.bal");
    });
});
