import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { ConnectorMarketplace } from "../../utils/forms/connector-form";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add different connectors to a function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add http connector to function', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading("http")
            .searchConnector("http")
            .waitForConnectorsLoading("http / client")
            .selectConnector("http / client");

        StatementEditor
            .shouldBeVisible()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-http-connector-to-function.expected.bal");
    });

    it('Add google sheet connector to function', () => {

        const startDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/googleapis.sheets', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        const endDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);

        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading("sheet")
            .searchConnector("sheet")
            .waitForConnectorsLoading("google sheets")
            .selectConnector("google sheets");

        StatementEditor
            .shouldBeVisible()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-sheet-connector-to-function.expected.bal");
    });

    it('Add mysql connector to function', () => {

        let startDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        let endDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        startDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        endDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);

        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

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
            getCurrentSpecFolder() + "add-mysql-connector-to-function.expected.bal");
    });

    it('Open and Close Form', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading("http")
            .searchConnector("http")
            .waitForConnectorsLoading("http / client")
            .selectConnector("http / client");

        StatementEditor
            .shouldBeVisible()
            .close();
    });
});
