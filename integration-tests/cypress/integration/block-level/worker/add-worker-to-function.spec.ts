import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { WorkerForm } from "../../../utils/forms/worker-form";
import { getIntegrationTestPageURL, getIntegrationTestStoryURL } from "../../../utils/story-url-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/worker/add-worker-to-function.bal";

describe('Add worker to function via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add a worker to function', () => {
        cy.wait(10000);
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Worker");

        WorkerForm
            .shouldBeVisible()
            .typeWorkerName("Test")
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-worker-to-function.expected.bal");
    });

    it('Open and Close Form', () => {
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Worker");

        WorkerForm
            .shouldBeVisible()
            .close();
    });

    it('Open and Cancel Form', () => {
        Canvas.getFunction("sampleFunction")
            .nameShouldBe("sampleFunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(0);

        BlockLevelPlusWidget.clickOption("Worker");

        WorkerForm
            .shouldBeVisible()
            .cancel();
    });
});
