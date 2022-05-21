import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { Canvas } from "../../../../utils/components/canvas";
import { VariableFormBlockLevel } from "../../../../utils/forms/variable-form-block-level";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { ForEachForm } from "../../../../utils/forms/foreach-form";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test statement editor diagnostics', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test semantic diagnostics with disabled save button', () => {
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
            .typeInput("string")

        EditorPane
            .validateEmptyDiagnostics()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("\"testing LS diagnostics functionality\"")

        EditorPane
            .validateEmptyDiagnostics()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('string')

        InputEditor
            .typeInput("int")

        EditorPane
            .validateDiagnosticMessage("incompatible types: expected 'int', found 'string'")

        StatementEditor
            .saveDisabled()
            .close()
    });


    it('Test syntax diagnostics with disabled save button', () => {
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
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("1 +")

        EditorPane
            .validateDiagnosticMessage("missing identifier")

        StatementEditor
            .saveDisabled()
    });

    it('Test statement with multiple diagnostics', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2)
            .getBlockLevelPlusWidget()
            .clickOption("ForEach");

        ForEachForm
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
            .typeInput("json")

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)

        InputEditor
            .typeInput("var1")

        EditorPane
            .checkForMultipleDiagnostics()

        StatementEditor
            .saveDisabled()
            .cancel()
    });
})
