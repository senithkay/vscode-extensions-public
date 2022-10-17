import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorMarketplace } from "../../../utils/forms/connector-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";

const BAL_FILE_PATH = "block-level/worker/worker-scenario-with-conflicts.bal";

describe('Worker Scenario with Conflicts', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add a worker to function', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading()
            .searchConnector("http")
            .waitForConnectorsLoading()
            .selectConnector("http / client");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("StringLiteral")
            .doubleClickExpressionContent('""');

        InputEditor
            .typeInput('"https://foo.com"');

        EditorPane
            .validateNewExpression("StringLiteral", '"https://foo.com"')
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "worker-with-conflict-scenario.expected.bal");
    });
});
