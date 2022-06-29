import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "block-level/return/existing-return-statement.bal";

describe('Edit return statement', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Edit return statement', () => {
        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickExistingReturnStatement()

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("StringLiteral")
            .doubleClickExpressionContent('"Hello World!!!"');

        InputEditor
            .typeInput('"Updated Hello World!!!"');

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-return-statement.expected.bal");
    })
})
