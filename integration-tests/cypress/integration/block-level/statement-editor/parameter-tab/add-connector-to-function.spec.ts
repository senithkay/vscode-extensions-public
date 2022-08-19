import { BlockLevelPlusWidget } from "../../../../utils/components/block-level-plus-widget";
import { Canvas } from "../../../../utils/components/canvas";
import { SourceCode } from "../../../../utils/components/code-view";
import { ParameterTab } from "../../../../utils/components/statement-editor/parameter-tab";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { ConnectorMarketplace } from "../../../../utils/forms/connector-form";
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";


const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add connector with custom configurations via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add google sheet endpoint with custom configurations', () => {
        cy.exec('bal pull ballerinax/googleapis.sheets', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });

        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Connector");

        ConnectorMarketplace
            .shouldBeVisible()
            .waitForConnectorsLoading()
            .searchConnector("sheet")
            .waitForConnectorsLoading()
            .selectConnector("google sheets");

        StatementEditor
            .shouldBeVisible();

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameterTree()
            .shouldHaveRecordArg("spreadsheetConfig")
            .shouldHaveUnionArg("auth")
            .shouldHaveRecordArg("BearerTokenConfig")
            // .selectUnionArg("auth", "OAuth2RefreshTokenGrantConfig")
            .shouldHaveCustomArg("token")
            .shouldHaveCustomArg("httpVersion")
            .toggleCustomArg("httpVersion")
            .shouldHaveCustomArg("timeout")
            .toggleCustomArg("timeout")
            .shouldHaveCustomArg("compression")
            .toggleCustomArg("compression");

        // StatementEditor
        //     .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-http-connector-to-function.expected.bal");
    });

});
