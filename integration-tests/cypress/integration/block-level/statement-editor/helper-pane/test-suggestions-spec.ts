import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { Canvas } from "../../../../utils/components/canvas";
import { VariableFormBlockLevel } from "../../../../utils/forms/variable-form-block-level";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { SuggestionsPane } from "../../../../utils/components/statement-editor/suggestions-pane";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test helper pane functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add Variable Declaration Statement with Ls-Suggestions', () => {
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
            .getEditorPane()

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .clickExpressionContent('var')

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('int')

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`)

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var1')

        EditorPane
            .validateNewExpression("SimpleNameReference","var1")

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "suggestions-functionality.expected.bal");

    });

    it('Add Variable Declaration Statement with Expression and Operator Suggestions', () => {
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
            .getEditorPane()

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .clickExpressionContent('var')

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('int')

        EditorPane
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`)

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('Es + Ex')

        EditorPane
            .getExpression("BinaryExpression")
            .clickSpecificExpression("SimpleNameReference",0,`<add-expression>`)

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var2')

        EditorPane
            .getExpression("BinaryExpression")
            .clickExpressionContent('+')
        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('-')

        EditorPane
            .getExpression("BinaryExpression")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("1")

        EditorPane
            .validateNewExpression("NumericLiteral","1")

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "expression-and-operator-suggestions.expected.bal");
    });

    it('Add Variable Declaration Statement with Type Expression Suggestions', () => {
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
            .getEditorPane()

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var')

        InputEditor
            .typeInput('int')

        EditorPane
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('int')

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('Es | Ex')
            .clickSuggestionsTab("Suggestions")

        EditorPane
            .getExpression("UnionTypeDesc")
            .clickSpecificExpression("SimpleNameReference", 0, '<add-type>' )

        SuggestionsPane
            .clickLsSuggestion('float')

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("var1")

        EditorPane
            .validateNewExpression("SimpleNameReference","var1")

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "type-suggestion.expected.bal");
    });
})
