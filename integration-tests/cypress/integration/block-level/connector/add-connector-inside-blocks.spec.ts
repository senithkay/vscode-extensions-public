import { Canvas } from "../../../utils/components/canvas";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { HttpForm } from "../../../utils/forms/connectors/http-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { IfForm } from "../../../utils/forms/if-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/test-connector-inside-blocks.bal";

describe('Add connector to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add action statement inside IF block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickIfConditionWorkerPlusBtn()
            .getBlockLevelPlusWidget()
            .clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        HttpForm
            .selectOperation('GET')
            .typeOperationPath('"foo"')
            .saveAndDone();

        Canvas.getFunction("myfunction");
    });

    it('Add action statement inside Foreach block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickForEachWorkerPlusBtn()
            .getBlockLevelPlusWidget()
            .clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        HttpForm
            .selectOperation('GET')
            .typeOperationPath('"foo"')
            .saveAndDone();

        Canvas.getFunction("myfunction");
    });

    it('Add action statement inside While block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickWhileWorkerPlusBtn()
            .getBlockLevelPlusWidget()
            .clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        HttpForm
            .selectOperation('GET')
            .typeOperationPath('"foo"')
            .saveAndDone();

        Canvas.getFunction("myfunction");
    });
})
