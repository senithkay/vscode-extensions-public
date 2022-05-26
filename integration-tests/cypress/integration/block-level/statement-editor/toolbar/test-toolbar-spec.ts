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
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { Canvas } from "../../../../utils/components/canvas";
import { VariableFormBlockLevel } from "../../../../utils/forms/variable-form-block-level";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { SuggestionsPane } from "../../../../utils/components/statement-editor/suggestions-pane";
import { Toolbar } from "../../../../utils/components/statement-editor/toolbar";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test statement editor toolbar functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test Undo, Redo and Delete options', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2)
            .getBlockLevelPlusWidget()
            .clickOption("Variable");

        VariableFormBlockLevel
            .shouldBeVisible()
            .toggleStatementEditor()

        StatementEditor
            .shouldBeVisible()

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var')

        InputEditor
            .typeInput("int")

        EditorPane
            .validateNewExpression("TypedBindingPattern","int")
            .getExpression("TypedBindingPattern")
            .clickExpressionContent('int')

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('float')

        EditorPane
            .validateNewExpression("TypedBindingPattern","float")

        Toolbar
            .clickUndoButton()

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>')

        InputEditor
            .typeInput("var1")

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent('var1')

        Toolbar
            .clickDeleteButton()

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("123")

        EditorPane
            .getExpression("NumericLiteral")
            .doubleClickExpressionContent(`123`)

        InputEditor
            .typeInput("456")

        EditorPane
            .validateNewExpression("NumericLiteral","456")

        Toolbar
            .clickUndoButton()

        EditorPane
            .validateNewExpression("NumericLiteral","123")

        Toolbar
            .clickRedoButton()

        EditorPane
            .validateNewExpression("NumericLiteral","456")
            .validateEmptyDiagnostics()

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-functionality.expected.bal");

    });
})
