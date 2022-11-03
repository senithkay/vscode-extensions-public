import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { ConnectorMarketplace } from "../../utils/forms/connector-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const EMPTY_BAL_FILE_PATH = "default/empty-file.bal";

describe('Add connectors to module level via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(EMPTY_BAL_FILE_PATH));
    });

    it('Add add multiple connectors to module level', () => {
        // Add http connector (standard library)
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading("http")
            .searchConnector("http")
            .waitForConnectorsLoading("http / client")
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

        // Add MySQL connector (external library with drivers)
        let startDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        let endDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        startDate = new Date();
        cy.task('log', `ballerinax/mysql.driver package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql.driver', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        endDate = new Date();
        cy.task('log', `ballerinax/mysql.driver package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);

        Canvas.clickTopLevelPlusButton(3);

        TopLevelPlusWidget
            .clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading("mysql")
            .searchConnector("mysql")
            .waitForConnectorsLoading("mysql / client")
            .selectConnector("mysql / client");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-module-level-connector.expected.bal");
    });

});
