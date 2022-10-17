import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ActionListForm } from "../../../utils/forms/action-list-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-action-to-child-blocks.bal";

describe('Add action to child blocks via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add action to if block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickIfConditionWorkerPlusBtn()
            .getBlockLevelPlusWidget();

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("get");

        StatementEditor
            .shouldBeVisible()
            .save();

        cy.wait(1000 * 5);

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-action-to-if-block.expected.bal");
    });

    it('Add action to foreach block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickForEachWorkerPlusBtn()
            .getBlockLevelPlusWidget();

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("post");

        StatementEditor
            .shouldBeVisible()
            .save();

        cy.wait(1000 * 5);

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-action-to-foreach-block.expected.bal");
    });

    it('Add action to while block', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickWhileWorkerPlusBtn()
            .getBlockLevelPlusWidget();

        BlockLevelPlusWidget.clickOption("Action");

        EndpointListForm
            .shouldBeVisible()
            .selectEndpoint("testEp");

        ActionListForm
            .shouldBeVisible()
            .selectAction("put");

        StatementEditor
            .shouldBeVisible()
            .save();

        cy.wait(1000 * 5);

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-action-to-while-block.expected.bal");
    });
});
