import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { ConnectorMarketplace } from "../../../utils/forms/connector-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { ActionListForm } from "../../../utils/forms/action-list-form";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add demo connectors to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Test all possible code generation scenarios using demo connectors', () => {
        cy.exec('bal pull lowcodedemo/democonnector.one', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        cy.exec('bal pull lowcodedemo/democonnector.two', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });
        cy.exec('bal pull lowcodedemo/democonnector.three', { failOnNonZeroExit: false }).then((result) => {
            cy.log('Package pull results: ' + JSON.stringify(result));
        });

        let statementIndex = 0;

        addEndpoint(statementIndex++, "democonnector", "demo connector one");
        addAction(statementIndex++, "oneEp", "getMessage");
        addAction(statementIndex++, "oneEp", "readMessage");
        addAction(statementIndex++, "oneEp", "sendMessage");
        addAction(statementIndex++, "oneEp", "viewMessage");
        addAction(statementIndex++, "oneEp", "testKeyword");

        addEndpoint(statementIndex++, "democonnector", "demo connector two");
        addAction(statementIndex++, "twoEp", "getMessages");
        addAction(statementIndex++, "twoEp", "readMessage");
        addAction(statementIndex++, "twoEp", "sendMessage");
        addAction(statementIndex++, "twoEp", "viewMessage");
        addAction(statementIndex++, "twoEp", "updateMessage");

        addEndpoint(statementIndex++, "democonnector", "demo connector three");
        addAction(statementIndex++, "threeEp", "getStudents");
        addAction(statementIndex++, "threeEp", "searchMessage");

        cy.wait(5000);

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-demo-connectors.expected.bal");
    });

});

function addEndpoint(plusIndex: number, searchQuery: string, connector: string) {
    Canvas.getFunction("myfunction")
        .nameShouldBe("myfunction")
        .shouldBeExpanded()
        .getDiagram()
        .shouldBeRenderedProperly()
        .clickDefaultWorkerPlusBtn(plusIndex);

    BlockLevelPlusWidget.clickOption("Connector");

    ConnectorMarketplace
        .shouldBeVisible()
        .waitForConnectorsLoading()
        .searchConnector(searchQuery)
        .waitForConnectorsLoading()
        .selectConnector(connector);

    StatementEditor
        .shouldBeVisible()
        .save();
}

function addAction(plusIndex: number, endpoint: string, action: string) {
    Canvas.getFunction("myfunction")
        .nameShouldBe("myfunction")
        .shouldBeExpanded()
        .getDiagram()
        .shouldBeRenderedProperly()
        .clickDefaultWorkerPlusBtn(plusIndex);

    BlockLevelPlusWidget.clickOption("Action");

    EndpointListForm
        .shouldBeVisible()
        .selectEndpoint(endpoint);

    ActionListForm
        .shouldBeVisible()
        .selectAction(action);

    StatementEditor
        .shouldBeVisible()
        .save();
}

