import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { ActionListForm } from "../../../utils/forms/action-list-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";

const BAL_FILE_PATH = "block-level/connector/add-action-to-resource.bal";

describe('Add action to resource via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add multiple actions to resource', () => {
        // Pulling existing connectors.
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        cy.exec('bal pull ballerinax/mysql.driver', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });

        // Test action creation with module level endpoint.
        Canvas.getService("/hello")
            .getResourceFunction("GET", "/")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("mysqlEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("query");

        StatementEditor
            .shouldBeVisible()
            .save();

        // Test action creation using resource level endpoint.
        Canvas.getService("/hello")
            .getResourceFunction("GET", "/")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("httpEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("get");

        StatementEditor
            .shouldBeVisible()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-action-to-resource.expected.bal");
    });
});
