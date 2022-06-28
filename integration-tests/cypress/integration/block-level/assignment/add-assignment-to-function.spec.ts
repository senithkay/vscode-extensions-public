import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";

const BAL_FILE_PATH = "block-level/assignment/add-assignment-to-function.bal";

describe('Add assignment to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add an assignment to function', () => {
        Canvas.getFunction("myFunction")
            .nameShouldBe("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

        BlockLevelPlusWidget.clickOption("Assignment");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent("default");

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('varName');

        EditorPane
            .validateNewExpression("SimpleNameReference", "varName")
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("200");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-assignment-to-function.expected.bal");
    })

    it('Delete an assignment in function', () => {
        Canvas.getFunction("myFunction")
            .nameShouldBe("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

        BlockLevelPlusWidget.clickOption("Assignment");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent("default");

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('varName');

        EditorPane
            .validateNewExpression("SimpleNameReference", "varName")
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("200");

        StatementEditor
            .save();

        // TODO: There is a bug with node deletion in tests. The below additional form open is added as a workaround.
        //  Remove the below form open once the issue is fixed.
        Canvas.getFunction("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .close();

        Canvas.getFunction("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDeleteExistingBlockStatement(2);

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-assignment-to-function.expected.bal");
    })

    it('Open and Cancel Assignment Form', () => {
        Canvas.getFunction("myFunction")
            .nameShouldBe("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

        BlockLevelPlusWidget.clickOption("Assignment");

        StatementEditor
            .shouldBeVisible()
            .cancel();

    });

    it('Open and Close Assignment Form', () => {
        Canvas.getFunction("myFunction")
            .nameShouldBe("myFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

        BlockLevelPlusWidget.clickOption("Assignment");

        StatementEditor
            .shouldBeVisible()
            .close();

    });

})
