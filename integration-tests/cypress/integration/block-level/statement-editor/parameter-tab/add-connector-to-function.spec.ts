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

    it('Add http endpoint with custom configurations', () => {
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
            .searchConnector("http")
            .waitForConnectorsLoading()
            .selectConnector("http / client");

        StatementEditor
            .shouldBeVisible();

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameterTree()
            .shouldHaveInclusionArg("config")
            .toggleInclusionArg("config")
            .toggleInclusionOptionalArgs("config")
            .shouldHaveCustomArg("httpVersion")
            .toggleCustomArg("httpVersion")
            .shouldHaveCustomArg("timeout")
            .toggleCustomArg("timeout")
            .shouldHaveRecordArg("cache")
            .toggleRecordArgs("cache")
            .toggleRecordOptionalArgs("cache")
            .shouldHaveCustomArg("enabled")
            .toggleCustomArg("enabled")
            .shouldHaveUnionArg("compression")
            .toggleUnionArg("compression")
            .shouldHaveUnionArg("auth")
            .toggleUnionArg("auth");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-connector-to-function.expected.bal");
    });

});
