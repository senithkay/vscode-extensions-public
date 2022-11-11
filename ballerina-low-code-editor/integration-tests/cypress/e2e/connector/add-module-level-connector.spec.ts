import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
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

    it('Add add http connector to module level', () => {
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
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-module-level-connector.expected.bal");
    });

});
