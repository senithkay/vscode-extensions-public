import { Canvas } from "../../../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { VariableFormBlockLevel } from "../../../../utils/forms/variable-form-block-level";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test input editor functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add Variable Declaration Statement With Input-Editor', () => {
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
            .typeInput("float")

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`)
        InputEditor
            .typeInput("3.14")

        EditorPane
            .validateEmptyDiagnostics()

        StatementEditor
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "input-editor-functionality.expected.bal");

    });
})
