import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "block-level/while/add-while-to-function.bal";

describe('Add while to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add a while to function', () => {
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("While");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("1<5");

        EditorPane
            .reTriggerDiagnostics("NumericLiteral", "5");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-while-to-function.expected.bal");
    })

    it('Open and Cancel Form', () => {
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("While");

        StatementEditor
            .shouldBeVisible()
            .cancel();

    });

    it('Open and Close Form', () => {
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget
            .clickOption("While");

        StatementEditor
            .shouldBeVisible()
            .close();

    });

})
