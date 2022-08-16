import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"
import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "function/add-other-statement-file.bal";

const COMPONENT_NAME = "Other";

describe('Test adding an other component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    });

    it('Add an other statement', () => {
        Canvas
            .getFunction('testOtherStatementFunction')
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickForEachWorkerPlusBtn();

        BlockLevelPlusWidget.clickOption(COMPONENT_NAME);

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .doubleClickStatementContent(`<add-statement>`);

        InputEditor
            .typeInput(`match counter { 0 => {io:println("value is: 0");} 1 => {io:println("value is: 1");}}`, false);

        EditorPane
            .validateNewExpression("SimpleNameReference", "counter")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "add-other.expected.bal");
    });
});
