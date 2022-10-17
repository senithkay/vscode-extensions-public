import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "block-level/return/add-return-to-service-resource.bal";

describe('Add return statement to resource function', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add empty return statement to resource function', () => {
        Canvas.getService("/hello")
            .getResourceFunction("POST", "/")
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Return");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        // TODO: Just save the return statement instead of providing the below when the statement editor cater it.
        InputEditor
            .typeInput("null");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-return-statement-to-resource.expected.bal");
    })
})
