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
import { Canvas } from "../../../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../../utils/components/block-level-plus-widget";
import { SuggestionsPane } from "../../../../utils/components/statement-editor/suggestions-pane";
import { ParameterTab } from "../../../../utils/components/statement-editor/parameter-tab";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test function call and method call parameters', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add function call via libraries', () => {
        // Add function call with arguments
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
            .clickLibrarySuggestion('lang.int')
            .clickSearchedLibSuggestion('lang.int:min')

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameterList()
            .shouldHaveRequiredArg("n")
            .shouldHaveOptionalArg("ns")
            .shouldHavecheckboxDisabled("n");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-n>`);

        InputEditor
            .typeInput('1');

        EditorPane
            .validateNewExpression("SimpleNameReference", `<add-ns>`)
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-ns>`);

        InputEditor
            .typeInput('2');

        EditorPane
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "check-function-params.expected.bal");

    });

    it('Add method call via libraries', () => {
        // Add method call with arguments
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
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput('"Text"');

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('indexOf(string substr, int startIndex)');

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameters(2)
            .shouldHaveOptionalArg("startIndex")

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-substr>`);

        InputEditor
            .typeInput('"xt"');

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-startIndex>`);

        InputEditor
            .typeInput('2');

        EditorPane
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "check-methodcall-params.expected.bal");

    });
});
