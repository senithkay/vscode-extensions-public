import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorMarketplace } from "../../../utils/forms/connector-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-child-blocks.bal";

describe('Add connector to child blocks via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add connector to if block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickIfConditionWorkerPlusBtn()
            .getBlockLevelPlusWidget();

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

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-http-connector-to-if-block.expected.bal");
    });

    it('Add connector to foreach block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickForEachWorkerPlusBtn()
            .getBlockLevelPlusWidget();

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

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-http-connector-to-foreach-block.expected.bal");
    });

    it('Add connector to while block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickWhileWorkerPlusBtn()
            .getBlockLevelPlusWidget();

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

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-http-connector-to-while-block.expected.bal");
    });
});
