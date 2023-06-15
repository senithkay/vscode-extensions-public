/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import { ParameterTab } from "../../../utils/components/statement-editor/parameter-tab";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test helper pane functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test parameter count of method with no params', () => {
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
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('var2')
            .clickLsTypeSuggestion('toString()');

        ParameterTab
            .validateNoParameters();

    });

    it('Test parameter count of method with multiple params', () => {
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
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('var2')
            .waitForLoading()
            .clickLsTypeSuggestion('max(int... ns)');

        ParameterTab
            .shouldHaveOptionalArg('ns');

    });
})
