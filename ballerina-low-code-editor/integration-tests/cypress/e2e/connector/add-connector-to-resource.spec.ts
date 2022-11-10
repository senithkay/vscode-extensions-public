import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { ConnectorMarketplace } from "../../utils/forms/connector-form";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-resource.bal";

describe('Add connector to resource via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add http connector to resource', () => {
        Canvas.getService("/hello")
            .getResourceFunction("GET", "/")
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
            getCurrentSpecFolder() + "add-http-connector-to-resource.expected.bal");
    });

    it('Add google sheet connector to resource', () => {

        const startDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/googleapis.sheets', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        const endDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);

        Canvas.getService("/hello")
            .getResourceFunction("GET", "/")
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
            getCurrentSpecFolder() + "add-sheet-connector-to-resource.expected.bal");
    });

});
