import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { ActionListForm } from "../../../utils/forms/action-list-form";

const BAL_FILE_PATH = "block-level/connector/add-action-to-function.bal";

describe('Add different actions to a function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        // Pulling existing connectors.
        let startDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/googleapis.sheets', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        let endDate = new Date();
        cy.task('log', `ballerinax/googleapis.sheets package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        startDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        endDate = new Date();
        cy.task('log', `ballerinax/mysql package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
        startDate = new Date();
        cy.task('log', `ballerinax/mysql.driver package pulling started at ${startDate}`);
        cy.exec('bal pull ballerinax/mysql.driver', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        endDate = new Date();
        cy.task('log', `ballerinax/mysql.driver package pulling completed at ${endDate} and took ${endDate.getTime() - startDate.getTime()}ms`);
    });

    // INFO: Added multiple test scenarios in single test case to avoid multiple module pulling.
    it('Add multiple action to function', () => {        
        // Test action creation using function level endpoint.
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(1);

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


        // Test action creation with module level endpoint.
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

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

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-action-to-function.expected.bal");
    });
});
