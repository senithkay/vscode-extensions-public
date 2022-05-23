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
            .clickExpressionContent('var')

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('int')

        EditorPane
            .validateNewExpression("TypedBindingPattern","int")

        SuggestionsPane
            .clickLsSuggestion('float')

        EditorPane
            .validateNewExpression("TypedBindingPattern","float")

        Toolbar
            .clickUndoButton()

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent('<add-expression>')

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var1')

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
            .clickExpressionContent(`123`)

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var2')

        EditorPane
            .validateNewExpression("SimpleNameReference","var2")

        Toolbar
            .clickUndoButton()

        EditorPane
            .validateNewExpression("NumericLiteral","123")

        Toolbar
            .clickRedoButton()

        EditorPane
            .validateNewExpression("SimpleNameReference","var2")

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-functionality.expected.bal");

    });
})
