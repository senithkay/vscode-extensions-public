import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { HttpForm } from "../../../utils/forms/connectors/http-form";
import { LogForm } from "../../../utils/forms/log-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

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
            .clickDefaultWorkerPlusBtn(0)
            .getBlockLevelPlusWidget()
            .clickOption("HTTP");

        HttpForm
            .waitForConnectorLoad()
            .haveDefaultName()
            .typeConnectionName("boo")
            .typeUrl('"https://foo.com"')
            .saveAndDone();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "worker-with-conflict-scenario.expected.bal");
    });

});
