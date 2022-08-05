import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { ActionListForm } from "../../../utils/forms/action-list-form";

const BAL_FILE_PATH = "block-level/connector/add-action-to-function.bal";

describe('Add action to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    // INFO: Added multiple test scenarios in single test case to avoid multiple module pulling.
    it('Add multiple action to function', () => {
        // Pulling existing connectors.
        cy.exec('bal pull ballerinax/googleapis.sheets', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        cy.exec('bal pull ballerinax/mysql.driver', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });

        // Test action creation with module level endpoint.
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
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

        // Test action creation using param endpoint.
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("sheetsEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("getallspreadsheets");

        StatementEditor
            .shouldBeVisible()
            .save();

        // Test action creation using function level endpoint.
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(3);

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
            getCurrentSpecFolder() + "add-action-to-function.expected.bal");
    });
});
